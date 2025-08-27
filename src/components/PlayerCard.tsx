import React from "react";
import { photoFor } from "@/lib/photos";
import { formatMarketValue } from "@/lib/market";

type CardStat = { label: string; value: string | number | null };

export type PlayerMeta = {
  name: string;
  pos?: string;
  club?: string;
  league?: string;
  age?: number | string;
  nation?: string;
  marketValue?: string | null; // texte brut venant du backend
  // Stats possibles (si présentes dans ton enrichissement)
  minutes?: number;
  matches?: number;
  goals?: number;
  assists?: number;
  xg?: number;
  xag?: number;
  cleanSheets?: number;
  tklInt?: number;
  savePct?: number;
};

export default function PlayerCard({
  player,
  similarity,
  onClick,
}: {
  player: PlayerMeta;
  similarity?: number; // 0-100
  onClick?: () => void;
}) {
  const pos = player.pos?.split(",")[0]?.trim(); // ex "MF,FW" -> "MF"

  // Stats primaires dynamiques selon la position
  const primary: CardStat[] =
    pos === "FW"
      ? [
          { label: "Minutes", value: player.minutes ?? "—" },
          { label: "Matches", value: player.matches ?? "—" },
          { label: "Goals", value: player.goals ?? "—" },
          { label: "Assists", value: player.assists ?? "—" },
          { label: "xG", value: player.xg ?? "—" },
        ]
      : pos === "MF"
      ? [
          { label: "Minutes", value: player.minutes ?? "—" },
          { label: "Matches", value: player.matches ?? "—" },
          { label: "Goals", value: player.goals ?? "—" },
          { label: "Assists", value: player.assists ?? "—" },
          { label: "xAG", value: player.xag ?? "—" },
        ]
      : pos === "DF"
      ? [
          { label: "Minutes", value: player.minutes ?? "—" },
          { label: "Matches", value: player.matches ?? "—" },
          { label: "Clean sheets", value: player.cleanSheets ?? "—" },
          { label: "Tkl+Int", value: player.tklInt ?? "—" },
        ]
      : pos === "GK"
      ? [
          { label: "Minutes", value: player.minutes ?? "—" },
          { label: "Matches", value: player.matches ?? "—" },
          { label: "Clean sheets", value: player.cleanSheets ?? "—" },
          { label: "Save %", value: player.savePct ?? "—" },
        ]
      : [
          { label: "Minutes", value: player.minutes ?? "—" },
          { label: "Matches", value: player.matches ?? "—" },
        ];

  const mv = formatMarketValue(player.marketValue);

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer"
    >
      {/* header */}
      <div className="flex items-center gap-4">
        <img
          src={photoFor(player.name)}
          onError={(e) => ((e.currentTarget.src = "/players/default.jpg"))}
          alt={player.name}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-300/40"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold">{player.name}</h3>
            {player.pos && (
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                {player.pos}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500 truncate">
            {[player.club, player.league].filter(Boolean).join(" • ")}
            {player.age ? ` • ${player.age}y` : ""}
          </div>
        </div>

        {typeof similarity === "number" && (
          <div className="ml-auto rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-3 py-1 text-white font-bold shadow">
            {similarity.toFixed(0)}%
          </div>
        )}
      </div>

      {/* market value */}
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="text-xs font-medium text-slate-500">MARKET VALUE</div>
        <div className="text-xl font-extrabold text-cyan-600">{mv}</div>
      </div>

      {/* primary stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {primary.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-slate-100 p-3 text-center"
          >
            <div className="text-base font-semibold">{s.value}</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm text-slate-500">
        <div>{player.nation ? `🇺🇳 ${player.nation}` : <span>&nbsp;</span>}</div>
        <div className="opacity-0 group-hover:opacity-100 transition">
          <span className="text-emerald-600 font-semibold">+ more</span>
        </div>
      </div>
    </div>
  );
}
