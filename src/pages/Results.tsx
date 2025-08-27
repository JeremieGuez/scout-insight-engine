import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { similar } from "@/lib/api";

export default function Results() {
  const [sp] = useSearchParams();
  const query = useMemo(() => sp.get("query") ?? "", [sp]);
  const [items, setItems] = useState<{ name: string; position?: string; score: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!query) return;
      try {
        setLoading(true);
        setError(null);
        const r = await similar(query, 8);
        if (!cancelled) setItems(r.results || []);
      } catch (e: any) {
        if (!cancelled) setError(String(e.message ?? e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Similar players to {query}</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error while loading results: {error}</div>}
      {!loading && !error && items.length === 0 && <div>No results.</div>}
      <ul className="grid sm:grid-cols-2 gap-4">
        {items.map((p) => (
          <li key={p.name} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-slate-500">{p.position ?? "—"}</div>
            <div className="text-sm mt-1">Similarity: {p.score.toFixed(1)}%</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
