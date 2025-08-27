import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { similar } from "@/lib/api";
import { formatMarketValue } from "@/lib/market";
import { mapPosition } from "@/lib/positionMap";
import stats_config from "@/config/stats_config";

export default function PlayerDetail() {
  const { name } = useParams();
  const [player, setPlayer] = useState<any | null>(null);
  const [similars, setSimilars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!name) return;
      setLoading(true);
      try {
        const response = await similar(name, 5);
        if (response?.results?.length > 0) {
          setPlayer({ name, ...response.results[0] });
          setSimilars(response.results.slice(1));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [name]);

  if (loading) return <p className="p-6">Loading player…</p>;
  if (!player) return <p className="p-6">Player not found</p>;

  // Déterminer les stats primaires du poste
  const mappedPos = mapPosition(player.position);
  const statsToShow = stats_config[mappedPos]?.PRIMARY || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header className="bg-white shadow p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
        <p className="text-gray-600">
          {player.position} • {player.club || player.league || "Unknown"}
        </p>
        <p className="mt-2">
          Market Value:{" "}
          <span className="font-semibold text-emerald-600">
            {formatMarketValue(player.marketValue)}
          </span>
        </p>
        {/* Stats primaires */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {statsToShow.map((stat: string) => (
            <div key={stat} className="bg-gray-100 p-3 rounded text-center">
              <p className="font-bold">{player[stat] ?? "—"}</p>
              <p className="text-xs text-gray-600">{stat}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Joueurs similaires */}
      <main className="px-6">
        <h2 className="text-xl font-semibold mb-4">Similar Players</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {similars.map((p) => (
            <div key={p.name} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-gray-600">
                {p.position} • {p.club || p.league || "Unknown"}
              </p>
              <p className="mt-2 text-sm">
                Market Value:{" "}
                <span className="font-semibold">
                  {formatMarketValue(p.marketValue)}
                </span>
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
