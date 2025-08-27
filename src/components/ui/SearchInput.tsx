import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Suggestion = {
  name: string;
  pos?: string;
  club?: string;
  league?: string;
  marketValue?: string;
};

export default function SearchInput({
  placeholder = "Search a player…",
}: {
  placeholder?: string;
}) {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // debounce
  const debounced = useDebounce(q, 250);

  // fetch suggestions
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (debounced.length < 2) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const res = await fetch(
          `/players?q=${encodeURIComponent(debounced)}&limit=8&rich=1`
        );
        const data = await res.json();
        if (cancelled) return;

        const list: Suggestion[] = Array.isArray(data?.players)
          ? data.players.map((n: any) =>
              typeof n === "string" ? { name: n } : n
            )
          : [];

        setItems(list);
        setOpen(true);
      } catch {
        if (!cancelled) {
          setItems([]);
          setOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  // click outside -> close
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function submit(name?: string) {
    const text = (name ?? q).trim();
    if (!text) return;
    setOpen(false);
    navigate(`/results?query=${encodeURIComponent(text)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center rounded-2xl border border-emerald-400/70 focus-within:ring-2 focus-within:ring-emerald-400/40 bg-white">
        <div className="pl-4 pr-2 text-slate-400">🔎</div>
        <input
          className="w-full px-2 py-3 rounded-l-2xl outline-none bg-transparent"
          placeholder={placeholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value.length >= 2) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (q.length >= 2) setOpen(true);
          }}
        />
        <button
          type="button"
          onClick={() => submit()}
          className="mx-2 my-1 rounded-xl px-4 py-2 text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95"
        >
          Search
        </button>
      </div>

      {/* Dropdown suggestions — états exclusifs */}
      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl z-[9999] overflow-hidden"
          role="listbox"
        >
          {(() => {
            const showLoading = loading && debounced.length >= 2;
            const showList = !loading && items.length > 0;
            const showEnter =
              !loading && items.length === 0 && debounced.length >= 2;

            if (showLoading) {
              return (
                <div
                  className="px-4 py-3 text-sm text-slate-600"
                  role="status"
                  aria-live="polite"
                >
                  Loading suggestions…
                </div>
              );
            }

            if (showList) {
              return (
                <ul className="max-h-80 overflow-auto divide-y divide-slate-100">
                  {items.map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer"
                      onClick={() => submit(p.name)}
                      role="option"
                      aria-label={p.name}
                    >
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
                        {p.name?.charAt(0) ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {p.pos ? `${p.pos} · ` : ""}
                          {p.club || p.league || p.marketValue
                            ? [p.club, p.league, p.marketValue]
                                .filter(Boolean)
                                .join(" · ")
                            : "—"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              );
            }

            if (showEnter) {
              return (
                <div
                  className="px-4 py-3 text-sm text-slate-600 cursor-pointer hover:bg-slate-50"
                  onClick={() => submit()}
                >
                  Press <span className="font-semibold">Enter</span> to search
                  for “{q}”
                </div>
              );
            }

            return null;
          })()}
        </div>
      )}
    </div>
  );
}

/** Hook debounce simple */
function useDebounce<T>(value: T, delay = 250) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return d;
}
