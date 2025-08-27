import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerPhoto from "@/components/ui/PlayerPhoto";
import { listPlayersRich, type PlayerMini } from "@/lib/api";

function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 250) {
  const ref = useRef<number>();
  return useMemo(
    () =>
      ((...args: any[]) => {
        if (ref.current) window.clearTimeout(ref.current);
        ref.current = window.setTimeout(() => fn(...args), delay);
      }) as T,
    [fn, delay]
  );
}

function GradientButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-2xl px-4 py-2 text-white font-semibold shadow-sm hover:shadow transition ${className}`}
      style={{ background: "linear-gradient(90deg,#00C896,#0ABEFF)" }}
    >
      {children}
    </button>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [items, setItems] = useState<PlayerMini[]>([]);
  const [open, setOpen] = useState(false);

  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggests = useDebouncedCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsSuggestLoading(true);
    try {
      const d = await listPlayersRich(value, 8, ctrl.signal);
      const arr = d.players ?? [];
      setItems(arr);
      setOpen(arr.length > 0);
    } catch {
      setItems([]);
      setOpen(false);
    } finally {
      setIsSuggestLoading(false);
    }
  }, 250);

  useEffect(() => {
    fetchSuggests(q);
  }, [q, fetchSuggests]);

  const submitSearch = async (name?: string) => {
    const query = (name ?? q).trim();
    if (!query) return;
    setOpen(false);
    setIsSearching(true);
    try {
      navigate(`/results?query=${encodeURIComponent(query)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const ITEM_H = 72;
  const dropdownHeight = Math.min(items.length * ITEM_H, 8 * ITEM_H) + (open ? 16 : 0);

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      {/* NAV */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="chameleon logo" className="h-7 w-7 rounded-full" />
            <span className="text-lg font-semibold lowercase text-[#121212]">chameleon</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="pt-10 pb-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#121212]">
            Discover Players with{" "}
            <span className="bg-gradient-to-r from-[#00C896] to-[#0ABEFF] bg-clip-text text-transparent">
              Similar Playing Styles
            </span>
          </h1>
          <p className="mt-3 text-gray-600 text-lg">
            <b>Advanced AI-powered football scouting platform</b> that analyzes player performance metrics and
            characteristics to find perfect matches for your team.
          </p>
        </div>
      </header>

      {/* SEARCH */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="relative z-20">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => items.length && setOpen(true)}
                placeholder="Search for a player…"
                className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3 shadow-sm bg-white outline-none focus:ring-2 focus:ring-[#00C896]"
                aria-label="Search player"
              />
              <svg
                className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>

              {open && (
                <div className="absolute left-0 top-full mt-2 w-full max-h-[420px] overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl z-30">
                  {items.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => submitSearch(p.name)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-start gap-3">
                        <PlayerPhoto name={p.name} size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-[#121212] truncate">{p.name}</div>
                            {p.pos ? (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800 font-semibold">
                                {p.pos}
                              </span>
                            ) : null}
                            <div className="ml-auto text-sm text-slate-500">
                              {p.goals ?? 0}G · {p.assists ?? 0}A
                            </div>
                          </div>
                          <div className="text-sm text-slate-500 truncate">
                            {[p.club, p.league, p.age ? `${p.age} ans` : null].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="px-4 py-2 text-xs text-slate-400 border-t">
                    {isSuggestLoading ? "Loading suggestions…" : "Press Enter to search"}
                  </div>
                </div>
              )}
            </div>

            <GradientButton onClick={() => submitSearch()} aria-label="Search">
              {isSearching ? "…" : "Search"}
            </GradientButton>
          </div>
        </div>

        <div style={{ height: open ? dropdownHeight : 0 }} />
      </section>

      {/* === Plus d’espace avant les blocs === */}
      <div className="mt-20" />

      {/* League Coverage d’abord */}
      <section className="max-w-6xl mx-auto px-6 mt-14 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">League Coverage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country: "England", leagues: "Premier League, Championship, League One" },
            { flag: "🇫🇷", country: "France", leagues: "Ligue 1, Ligue 2" },
            { flag: "🇪🇸", country: "Spain", leagues: "La Liga, Segunda División" },
            { flag: "🇮🇹", country: "Italy", leagues: "Serie A, Serie B" },
            { flag: "🇩🇪", country: "Germany", leagues: "Bundesliga, Bundesliga 2" },
            { flag: "🇵🇹", country: "Portugal", leagues: "Primeira Liga, Liga Portugal 2" },
          ].map((x, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl mb-2">{x.flag}</div>
              <div className="text-xl font-semibold">{x.country}</div>
              <div className="text-gray-500">{x.leagues}</div>
            </div>
          ))}
        </div>
      </section>

      {/* KPI ensuite */}
      <section className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { v: "2,700+", l: "Players Analyzed" },
            { v: "268", l: "Performance Metrics" },
            { v: "13", l: "Top Leagues" },
          ].map((k, i) => (
            <div key={i} className="flex flex-col items-center">
              <p className="text-4xl font-extrabold bg-gradient-to-r from-[#00C896] to-[#0ABEFF] bg-clip-text text-transparent">
                {k.v}
              </p>
              <p className="text-gray-600 text-sm mt-1">{k.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500 text-center">
          © chameleon — AI-powered Scouting Platform
        </div>
      </footer>
    </div>
  );
}
