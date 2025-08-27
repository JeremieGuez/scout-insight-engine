# backend/app/reco_light.py
import os
import pandas as pd
import numpy as np
from typing import List, Dict, Optional

ENCODINGS = ["utf-8", "utf-8-sig", "latin1", "cp1252"]
CAND_SEPS = [",", "\t", ";", "|"]

def _map_sep_from_env(v: str) -> Optional[str]:
    v = (v or "").strip().lower()
    if v in {"\\t", "tab", "tabs"}:
        return "\t"
    if v in {",", "comma"}:
        return ","
    if v in {";", "semicolon"}:
        return ";"
    if v in {"|", "pipe"}:
        return "|"
    return None

def _detect_sep(path: str) -> str:
    with open(path, "rb") as f:
        sample = f.read(8192)
    text = None
    for enc in ENCODINGS:
        try:
            text = sample.decode(enc, errors="ignore")
            break
        except Exception:
            continue
    if text is None:
        text = sample.decode("utf-8", errors="ignore")
    counts = {sep: 0 for sep in CAND_SEPS}
    for line in text.splitlines()[:30]:
        for sep in CAND_SEPS:
            counts[sep] += line.count(sep)
    sep = max(counts, key=counts.get)
    return sep if counts[sep] > 0 else ","

def _read_try(path: str, sep: str, engine: Optional[str]) -> Optional[pd.DataFrame]:
    last = None
    for enc in ENCODINGS:
        try:
            df = pd.read_csv(
                path,
                encoding=enc,
                sep=sep,
                engine=engine,
                on_bad_lines=("skip" if engine == "python" else None),
            )
            df.columns = [str(c).strip() for c in df.columns]
            print(f"[reco] CSV lu (engine={engine or 'c'}, enc={enc}, sep={repr(sep)}) "
                  f"-> {len(df)} lignes, {len(df.columns)} colonnes")
            return df
        except Exception as e:
            last = e
    print(f"[reco] échec lecture (engine={engine or 'c'}, sep={repr(sep)}): {last}")
    return None

def read_csv_robust(path: str, sep_env: Optional[str]) -> pd.DataFrame:
    if not os.path.isfile(path):
        raise FileNotFoundError(f"CSV introuvable: {path}")

    sep = _map_sep_from_env(sep_env) or _detect_sep(path)

    for eng in (None, "python"):
        df = _read_try(path, sep, eng)
        if df is not None and len(df.columns) > 1:
            return df

    for fallback_sep in ["\t", ";", ",", "|"]:
        for eng in (None, "python"):
            df = _read_try(path, fallback_sep, eng)
            if df is not None and len(df.columns) > 1:
                return df

    raise RuntimeError("Impossible de lire le CSV avec des séparateurs connus.")

def _ci_lookup(cols: List[str], candidates: List[str]) -> Optional[str]:
    norm = {str(c).strip().lower(): c for c in cols}
    for cand in candidates:
        k = str(cand).strip().lower()
        if k in norm:
            return norm[k]
    for cand in candidates:
        k = str(cand).strip().lower()
        for kk, orig in norm.items():
            if k in kk or kk in k:
                return orig
    return None

class RecoEngine:
    def __init__(self):
        csv_path = os.getenv("CSV_PATH", "./data/players_data-2024_2025.csv")
        sep_env  = os.getenv("CSV_SEP", "")

        self.df = read_csv_robust(csv_path, sep_env)
        print("[reco] premières colonnes:", list(self.df.columns)[:10])

        self.name_col = _ci_lookup(
            list(self.df.columns),
            [os.getenv("NAME_COLUMNS", "Player"), "Player", "Name", "Nom", "player", "name"]
        )
        if not self.name_col:
            raise RuntimeError(f"Colonne 'Player/Name' introuvable. Colonnes={list(self.df.columns)[:20]}")

        self.pos_col = _ci_lookup(
            list(self.df.columns),
            [os.getenv("POS_COLUMNS", "Pos"), "Pos", "Position", "poste", "role"]
        )

        self.numeric_cols = self._select_numeric_columns()
        self.features = self._build_feature_matrix()

        print(f"[reco] name_col={self.name_col!r} pos_col={self.pos_col!r} num_cols={len(self.numeric_cols)}")

    def _select_numeric_columns(self) -> List[str]:
        exclude = {self.name_col, self.pos_col, "market_value", "Market Value", "marketValue"}
        prefixes = ("Rk", "Nation", "Squad", "Comp", "League", "Team", "Club", "Competition", "Born")
        cols = []
        for c in self.df.columns:
            if c in exclude or any(str(c).startswith(p) for p in prefixes):
                continue
            if pd.api.types.is_numeric_dtype(self.df[c]):
                cols.append(c)
        return cols

    def _build_feature_matrix(self) -> np.ndarray:
        if not self.numeric_cols:
            return np.zeros((len(self.df), 0), dtype=np.float32)
        X = self.df[self.numeric_cols].copy()
        for c in self.numeric_cols:
            if not pd.api.types.is_numeric_dtype(X[c]):
                X[c] = pd.to_numeric(X[c], errors="coerce")
        X = X.fillna(0.0)
        mean = X.mean(axis=0)
        std  = X.std(axis=0).replace(0, 1.0)
        Z = (X - mean) / std
        return Z.to_numpy(dtype=np.float32)

    # ---------- API helpers ----------
    def suggest(self, q: str, limit: int = 10) -> List[str]:
        if not q:
            return []
        s = self.df[self.name_col].astype(str)
        m = s.str.contains(q, case=False, na=False)
        return s[m].dropna().drop_duplicates().head(limit).tolist()

    def _pick_col(self, *cands):
        return _ci_lookup(list(self.df.columns), list(cands))

    def player_mini(self, name: str) -> Dict:
        rows = self.df[self.df[self.name_col].astype(str) == str(name)]
        if rows.empty:
            return {"name": name}
        r = rows.iloc[0]
        pos_c  = self._pick_col("Pos", "Position")
        club_c = self._pick_col("Squad", "Club", "Team")
        lg_c   = self._pick_col("Comp", "League", "Competition")
        age_c  = self._pick_col("Age")
        gls_c  = self._pick_col("Gls", "Goals")
        ast_c  = self._pick_col("Ast", "Assists")
        mv_c   = self._pick_col("market_value", "Market Value", "marketValue")

        def _safe_int(x):
            try:
                return int(float(x))
            except Exception:
                return None

        return {
            "name":   str(r.get(self.name_col, name)),
            "pos":    str(r.get(pos_c, "")) if pos_c else "",
            "club":   str(r.get(club_c, "")) if club_c else "",
            "league": str(r.get(lg_c, "")) if lg_c else "",
            "age":    _safe_int(r.get(age_c)) if age_c else None,
            "goals":  _safe_int(r.get(gls_c)) if gls_c else None,
            "assists":_safe_int(r.get(ast_c)) if ast_c else None,
            "marketValue": ("" if not mv_c else str(r.get(mv_c, "")).strip()),
        }

    def similar_players(self, player: str, k: int = 5) -> Dict:
        res = {"query": player, "k": int(k), "results": []}
        if self.features.shape[1] == 0:
            return res
        mask = (self.df[self.name_col].astype(str) == str(player))
        if not mask.any():
            return res
        idx = int(np.nonzero(mask.values)[0][0])
        v = self.features[idx]
        denom_v = np.linalg.norm(v)
        if denom_v == 0:
            return res
        dots  = self.features @ v
        norms = np.linalg.norm(self.features, axis=1)
        denom = norms * denom_v
        with np.errstate(divide='ignore', invalid='ignore'):
            cos = np.where(denom > 0, dots / denom, 0.0)
        cos[idx] = -1.0
        top = np.argsort(-cos)[:int(k)]
        pos_c = self.pos_col
        mv_c  = self._pick_col("market_value", "Market Value", "marketValue")
        for j in top:
            name_j = str(self.df.iloc[j][self.name_col])
            pos_j  = "" if not pos_c else str(self.df.iloc[j][pos_c])
            mv_j   = "" if not mv_c else str(self.df.iloc[j][mv_c]).strip()
            score_pct = round(100.0 * max(0.0, min(1.0, (float(cos[j]) + 1) / 2)), 1)
            res["results"].append({
                "name": name_j,
                "position": pos_j,
                "score": score_pct,
                "marketValue": mv_j,
            })
        return res
