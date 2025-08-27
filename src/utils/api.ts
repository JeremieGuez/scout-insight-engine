// src/lib/api.ts
export type Suggestion = { name: string; pos?: string; club?: string; league?: string; marketValue?: string };

export async function suggest(q: string, limit = 8, rich = 1) {
  const url = `/players?q=${encodeURIComponent(q)}&limit=${limit}&rich=${rich}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`suggest() HTTP ${res.status}`);
  return res.json() as Promise<{ players: string[] } | { players: Suggestion[] }>;
}

export async function similar(player: string, k = 8) {
  const res = await fetch(`/similar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player, k }),
  });
  if (!res.ok) throw new Error(`similar() HTTP ${res.status}`);
  return res.json() as Promise<{ query: string; k: number; results: { name: string; position?: string; score: number }[] }>;
}
