# backend/app/main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import logging

# IMPORTANT : ces deux fichiers doivent exister
# backend/__init__.py  et  backend/app/__init__.py

# Si reco_light pose souci, commente l'import et les usages le temps de redémarrer
from .reco_light import RecoEngine  # noqa

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chameleon")

# <- C'EST ÇA QUE UVICORN CHERCHE
app = FastAPI(title="Chameleon API", version="0.1.0")

# CORS pour Vite (5173/5174)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charge le moteur (si ça plante, commente ces 2 lignes pour tester l’ASGI)
logger.info("Loading recommendation engine…")
engine = RecoEngine()
logger.info("Engine ready: rows=%s", len(engine.df))

class SimilarQuery(BaseModel):
    player: str
    k: int = 5

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/players")
def players(
    q: str = Query("", description="search string"),
    limit: int = Query(10, ge=1, le=50),
    rich: int = Query(0, description="1 for enriched output"),
):
    names = engine.suggest(q, limit=limit)
    if not rich:
        return {"players": names}
    enriched: List[Dict[str, Any]] = []
    for name in names:
        p = engine.player_mini(name)
        enriched.append({
            "name": p.get("name", name),
            "pos": p.get("pos", ""),
            "club": p.get("club", ""),
            "league": p.get("league", ""),
            "age": p.get("age", None),
            "goals": p.get("goals", None),
            "assists": p.get("assists", None),
            "marketValue": p.get("marketValue", "") or "",
        })
    return {"players": enriched}

@app.post("/similar")
def similar(body: SimilarQuery):
    return engine.similar_players(body.player, body.k)

# Lancement direct optionnel
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
