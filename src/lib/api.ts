export async function listPlayers(q: string, limit = 10, signal?: AbortSignal) {
  const r = await fetch(`/api/players?q=${encodeURIComponent(q)}&limit=${limit}`, { signal });
  if (!r.ok) throw new Error('API error');
  return r.json() as Promise<{ players: string[] }>;
}

export type PlayerMini = {
  name: string;
  pos?: string;
  club?: string;
  league?: string;
  age?: number | null;
  goals?: number | null;
  assists?: number | null;
};

export async function listPlayersRich(q: string, limit = 8, signal?: AbortSignal) {
  const r = await fetch(`/api/players?q=${encodeURIComponent(q)}&limit=${limit}&rich=1`, { signal });
  if (!r.ok) throw new Error('API error');
  return r.json() as Promise<{ players: PlayerMini[] }>;
}

export async function similar(player: string, k = 5) {
  const r = await fetch(`/api/similar`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ player, k }),
  });
  if (!r.ok) throw new Error('API error');
  return r.json() as Promise<{ results: Array<{name:string; position:string; score:number; marketValue?: string}> }>;
}
