import PlayerPhoto from "@/components/ui/PlayerPhoto";

export type PlayerCardProps = {
  name: string;
  position?: string;
  similarity?: number;
  marketValue?: string;
  onClick?: () => void;
};

export default function PlayerCard({ name, position="—", similarity, marketValue="N/A", onClick }: PlayerCardProps) {
  const badge = typeof similarity === "number" ? `${similarity.toFixed(1)}%` : "—";
  const mvMuted = !marketValue || marketValue === "N/A";

  return (
    <button onClick={onClick} className="w-full text-left border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow transition bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlayerPhoto name={name} size={44} />
          <div>
            <div className="text-base font-semibold">{name}</div>
            <div className="text-sm text-gray-500">{position}</div>
          </div>
        </div>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
          style={{ background: "linear-gradient(90deg,#00C896,#0ABEFF)" }}
        >
          {badge}
        </span>
      </div>
      <div className="mt-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${mvMuted ? "text-gray-700 bg-gray-100" : "text-white"}`}
          style={mvMuted ? undefined : { background: "linear-gradient(90deg,#00C896,#0ABEFF)" }}>
          {mvMuted ? "N/A" : marketValue}
        </span>
      </div>
    </button>
  );
}
