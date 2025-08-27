import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import PlayerPhoto from "@/components/ui/PlayerPhoto";
import PlayerCard from "@/components/PlayerCard";
import { similar } from "@/lib/api";
import { formatMarketValue } from "@/lib/market";
import type { Player } from "@/types";

export default function PlayerDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    similar(name, 5)
      .then((d) => setResults(d.results || []))
      .finally(() => setLoading(false));
  }, [name]);

  if (!name) return <div>No player selected</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* Header joueur */}
      <div className="flex items-center gap-4 mb-8">
        <PlayerPhoto name={name} size={64} />
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-gray-500">{results[0]?.position || "—"}</p>
          <p className="text-sm mt-1">
            Market Value: {formatMarketValue(results[0]?.marketValue)}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="ml-auto text-sm text-[#00C896] underline"
        >
          ← Back
        </button>
      </div>

      {/* Radar chart placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="font-semibold mb-4">Performance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart
            outerRadius="80%"
            data={[
              { stat: "Passing", value: 80 },
              { stat: "Shooting", value: 65 },
              { stat: "Defense", value: 70 },
              { stat: "Pace", value: 85 },
              { stat: "Dribbling", value: 75 },
            ]}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="stat" />
            <PolarRadiusAxis />
            <Radar
              dataKey="value"
              stroke="#00C896"
              fill="#00C896"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Joueurs similaires */}
      <div>
        <h2 className="font-semibold mb-4">Similar Players</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div>Loading…</div>
          ) : (
            results.map((p, i) => (
              <PlayerCard
                key={i}
                name={p.name}
                position={p.position}
                similarity={p.score}
                marketValue={formatMarketValue(p.marketValue)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
