// src/lib/positionMap.ts
export function mapPosition(raw: string): string {
  const pos = raw?.toUpperCase().trim();

  if (!pos) return "GLOBAL";

  if (pos.includes("GK")) return "GK";
  if (pos.includes("CB")) return "CB";
  if (pos.includes("DF")) return "CB"; // fallback
  if (pos.includes("FB") || pos.includes("WB")) return "FB/WB";
  if (pos.includes("DM")) return "DM";
  if (pos.includes("CM") || pos.includes("AM")) return "CM/AM";
  if (pos.includes("MF")) return "CM/AM";
  if (pos.includes("LW") || pos.includes("RW")) return "WINGER";
  if (pos.includes("FW") || pos.includes("ST") || pos.includes("CF")) return "ST/CF";

  return "GLOBAL"; // fallback safe
}
