// Convertit les formats du CSV / texte en format compact (ex: "6,00 mio. €" -> "6 m€", "100 K €" -> "100 k€")
export function formatMarketValue(raw?: string | null): string {
  if (!raw) return "N/A";
  const s = String(raw).trim();

  // Normaliser espaces/virgules/points
  const normalized = s
    .replace(/\s+/g, " ")           // espaces multiples
    .replace(/,(\d{2})\b/g, ".$1")  // 6,00 -> 6.00
    .replace(/€|\./g, (m) => (m === "€" ? "" : ".")) // retire le signe € et laisse les points de décimales
    .trim();

  // Cas kilo
  if (/k/i.test(normalized)) {
    const n = parseFloat(normalized.replace(/[^\d.]/g, ""));
    if (isFinite(n)) return `${stripTrailingZeros(n)} k€`.toLowerCase();
  }

  // Cas millions
  if (/mio/i.test(normalized) || /m\b/i.test(normalized)) {
    const n = parseFloat(normalized.replace(/[^\d.]/g, ""));
    if (isFinite(n)) return `${stripTrailingZeros(n)} m€`;
  }

  // Nombre brut -> supposer €
  const n = parseFloat(normalized.replace(/[^\d.]/g, ""));
  if (isFinite(n)) {
    if (n >= 1_000_000) return `${stripTrailingZeros(n / 1_000_000)} m€`;
    if (n >= 1_000) return `${stripTrailingZeros(n / 1_000)} k€`.toLowerCase();
    return `${stripTrailingZeros(n)} €`;
  }

  return "N/A";
}

function stripTrailingZeros(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}
