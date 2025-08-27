// src/lib/market.ts

/**
 * Formatte une valeur marchande brute (style Transfermarkt) en M€ ou k€.
 * - "6,00 mio. €" -> "6 M€"
 * - "100 K €"     -> "100 k€"
 * - "-" ou "not found" ou vide -> "N/A"
 */
export function formatMarketValue(raw?: string | null): string {
  if (!raw) return "N/A";

  const t = raw.trim();

  // Cas spéciaux
  if (t === "-" || t.toLowerCase() === "not found") return "N/A";

  // Millions
  if (t.toLowerCase().includes("mio")) {
    // ex "6,00 mio. €"
    const num = parseFloat(
      t.replace("mio. €", "").replace(",", ".").trim()
    );
    if (isNaN(num)) return "N/A";
    return `${num} M€`;
  }

  // Milliers (K)
  if (t.toLowerCase().includes("k")) {
    // ex "100 K €"
    const num = parseInt(
      t.replace("k €", "").replace("K €", "").trim(),
      10
    );
    if (isNaN(num)) return "N/A";
    return `${num} k€`;
  }

  return t; // fallback si autre format inattendu
}
