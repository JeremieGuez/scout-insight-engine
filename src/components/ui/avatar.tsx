export default function Avatar({ name, size=40 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(s=>s[0]?.toUpperCase()).slice(0,2).join("") || "?";
  return (
    <div
      className="rounded-full grid place-items-center text-white"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg,#00C896,#0ABEFF)"
      }}
      aria-label={`Avatar ${name}`}
    >
      <span className="font-semibold" style={{ fontSize: Math.max(12, size*0.35) }}>{initials}</span>
    </div>
  );
}
