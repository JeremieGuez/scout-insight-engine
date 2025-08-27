// src/pages/Results.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { similar } from "@/lib/api";
// Si tu as un Header ou un Avatar custom, dé-commente les imports ci-dessous.
// import Header from "@/components/layout/Header";
// import Avatar from "@/components/ui/Avatar";

type SimilarItem = {
  name: string;
  position?: string;
  score?: number; // 0–100
  club?: string;
  league?: string;
  age?: number;
  marketValue?: string; // ex. "6,00 mio. €", "100 K €"
};

function InitialsCircle({ text, size = 56 }: { text: string; size?: number }) {
  const initials = useMemo(() => {
    const parts = text.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }, [text]);

  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold"
      style={{ width: size, height: size, fontSize: Math.max(14, size / 3) }}
    >
      {initials}
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const query = sp.get("query")?.trim() ?? "";

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<SimilarItem[]>([]);

  // Filtres (placeholder pour l’instant — branchables plus tard)
  const [pos, setPos] = useState<string>("all");
  const [league, setLeague] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [ageBand, setAgeBand] = useState<string>("all");
  const [valueBand, setValueBand] = useState<string>("all");
  const [sort, setSort] = useState<string>("similarity");

  useEffect(() => {
    let mounted = true;
    async function run() {
      setErr(null);
      setLoading(true);
      setItems([]);
      try {
        if (!query) {
          setLoading(false);
          return;
        }
        // k par défaut = 20 (change si tu veux)
        const res = await similar(query, 20);
        const rows: SimilarItem[] = Array.isArray(res?.results) ? res.results : [];
        if (mounted) setItems(rows);
      } catch (e: any) {
        if (mounted) setErr(e?.message ? String(e.message) : "similar() HTTP error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [query]);

  // Filtrage local très simple (à étoffer si besoin)
  const filtered = useMemo(() => {
    let out = [...items];
    if (pos !== "all") out = out.filter((r) => (r.position || "").includes(pos));
    if (league !== "all") out = out.filter((r) => (r.league || "").includes(league));
    if (country !== "all") {
      // Si plus tard tu ajoutes la nation dans l’API, filtre-la ici
    }
    if (ageBand !== "all") {
      out = out.filter((r) => {
        const age = r.age ?? -1;
        if (ageBand === "u21") return age > 0 && age <= 21;
        if (ageBand === "22-25") return age >= 22 && age <= 25;
        if (ageBand === "26-30") return age >= 26 && age <= 30;
        if (ageBand === "30+") return age >= 30;
        return true;
      });
    }
    // tri
    if (sort === "similarity") {
      out.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else if (sort === "age") {
      out.sort((a, b) => (a.age ?? 999) - (b.age ?? 999));
    }
    return out;
  }, [items, pos, league, country, ageBand, valueBand, sort]);

  // UI helpers
  function scoreLabel(v?: number) {
    if (v == null) return "—";
    return `${Math.round(v)}%`;
  }

  function detailsLine(r: SimilarItem) {
    const bits = [
      r.position,
      r.age ? `${r.age} yrs` : undefined,
      r.club,
      r.league,
    ].filter(Boolean);
    return bits.join(" • ");
  }

  function openPlayer(name: string) {
    navigate(`/player/${encodeURIComponent(name)}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}

      {/* Hero du joueur comparé */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex items-center gap-5">
          <InitialsCircle text={query || "?"} size={72} />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Players similar to <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500">{query || "—"}</span>
            </h1>
            <p className="mt-1 text-slate-600">
              Based on multi-metric style & performance proximity.
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              New search
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/80 backdrop-blur border-y border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={pos}
            onChange={(e) => setPos(e.target.value)}
          >
            <option value="all">All Positions</option>
            <option value="FW">FW</option>
            <option value="MF">MF</option>
            <option value="DF">DF</option>
            <option value="GK">GK</option>
          </select>

          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={valueBand}
            onChange={(e) => setValueBand(e.target.value)}
          >
            <option value="all">All Values</option>
            <option value="5-20">€5–20M</option>
            <option value="20-50">€20–50M</option>
            <option value="50-100">€50–100M</option>
            <option value="100+">€100M+</option>
          </select>

          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value)}
          >
            <option value="all">All Ages</option>
            <option value="u21">≤21</option>
            <option value="22-25">22–25</option>
            <option value="26-30">26–30</option>
            <option value="30+">30+</option>
          </select>

          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
          >
            <option value="all">All Leagues</option>
            <option value="Premier League">Premier League</option>
            <option value="La Liga">La Liga</option>
            <option value="Bundesliga">Bundesliga</option>
            <option value="Serie A">Serie A</option>
            <option value="Ligue 1">Ligue 1</option>
          </select>

          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="similarity">Sort by Similarity</option>
            <option value="age">Sort by Age</option>
          </select>
        </div>
      </div>

      {/* Résultats */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {/* states */}
        {loading && (
          <div className="py-16 text-center text-slate-500">Loading similar players…</div>
        )}
        {err && !loading && (
          <div className="py-10">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Error while loading results: {err}
            </div>
          </div>
        )}
        {!loading && !err && filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500">No similar players found.</div>
        )}

        {!loading && !err && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((r) => (
              <div
                key={r.name}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <InitialsCircle text={r.name} size={56} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="font-semibold text-lg truncate">{r.name}</h3>
                      {r.position && (
                        <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5">
                          {r.position}
                        </span>
                      )}
                      <span className="ml-auto shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold px-2.5 py-1">
                        {scoreLabel(r.score)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600 truncate">
                      {detailsLine(r) || "—"}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm">
                        <div className="text-slate-500">Market value</div>
                        <div className="font-semibold">
                          {r.marketValue ?? "N/A"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPlayer(r.name)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                          View profile
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/results?query=${encodeURIComponent(r.name)}`)
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Compare with {r.name.split(" ")[0]}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
