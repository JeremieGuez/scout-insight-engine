import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { similar } from "@/lib/api";
import { photoFor } from "@/lib/photos";

// Configuration des stats par position - TOUTES LES POSITIONS CSV
const STATS_CONFIG = {
  GLOBAL: {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  },
  GK: {
    PRIMARY: ['Min', 'MP', 'CS', 'Save%', 'PSxG+/-']
  },
  DF: {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  },
  'DF,MF': {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  },
  MF: {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  },
  'MF,DF': {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  },
  'MF,FW': {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  },
  FW: {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  },
  'FW,MF': {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  },
  'FW,DF': {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  },
  'DF,FW': {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG']
  }
};

// Ordre logique des positions (basé sur le terrain de foot)
const POSITION_ORDER = [
  'GK',           // Gardiens
  'DF',           // Défenseurs purs
  'DF,MF',        // Défenseurs-Milieux
  'MF',           // Milieux purs  
  'MF,DF',        // Milieux-Défenseurs
  'MF,FW',        // Milieux-Attaquants
  'FW',           // Attaquants purs
  'FW,MF',        // Attaquants-Milieux
  'FW,DF',        // Attaquants-Défenseurs (rare)
  'DF,FW'         // Défenseurs-Attaquants (très rare)
];

type ResultItem = {
  name: string;
  pos?: string;
  age?: number;
  club?: string;
  league?: string;
  marketValue?: string | null;
  similarity?: number;
  // Stats
  Min?: number;
  MP?: number;
  Gls?: number;
  Ast?: number;
  xG?: number;
  CS?: number;
  'Save%'?: number;
  'PSxG+/-'?: number;
};

type ApiResponse = {
  results?: ResultItem[];
  player?: ResultItem;
};

const AGE_MIN = 15;
const AGE_MAX = 41;
const VALUE_MIN_M = 0.1;
const VALUE_MAX_M = 200;

// Fonctions utilitaires
const formatMarketValue = (value?: string | null) => value || "N/A";

// Labels lisibles pour les positions
function getPositionLabel(pos: string): string {
  const labels = {
    'GK': 'Goalkeeper',
    'DF': 'Defender', 
    'DF,MF': 'Defender/Midfielder',
    'MF': 'Midfielder',
    'MF,DF': 'Midfielder/Defender', 
    'MF,FW': 'Midfielder/Forward',
    'FW': 'Forward',
    'FW,MF': 'Forward/Midfielder',
    'FW,DF': 'Forward/Defender',
    'DF,FW': 'Defender/Forward'
  };
  return labels[pos as keyof typeof labels] || pos;
}

function pct(v?: number) {
  if (v == null) return "—";
  const x = v > 1 ? v : v * 100;
  return `${Math.round(x)}%`;
}

function StatCard({ label, value, unit = "" }: { 
  label: string; 
  value: string | number; 
  unit?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-900">
        {value !== undefined && value !== null ? `${value}${unit}` : '—'}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

// Normalise les données venant de ton API (format différent du CSV)
function normalizePlayerData(player: any): ResultItem {
  console.log('Données brutes reçues:', player); // Debug

  return {
    name: player.name || player.Player || "",
    // CORRECTION : API retourne "position" pas "Pos"
    pos: player.position || player.pos || player.Pos || "",
    age: Number(player.age || player.Age) || undefined,
    club: player.club || player.Squad || "",
    league: player.league || player.Comp || "",
    // CORRECTION : API retourne "marketValue" 
    marketValue: player.marketValue || player.market_value || player['market_value'] || null,
    // CORRECTION : API retourne "score" pas "similarity"
    similarity: player.score || player.similarity,
    // Stats basées sur vos colonnes CSV exactes
    Min: Number(player.Min) || undefined,
    MP: Number(player.MP) || undefined,
    Gls: Number(player.Gls) || undefined,
    Ast: Number(player.Ast) || undefined,
    xG: Number(player.xG) || undefined,
    CS: Number(player.CS) || undefined,
    'Save%': Number(player['Save%']) || undefined,
    'PSxG+/-': Number(player['PSxG+/-']) || undefined
  };
}

function getStatsForPosition(player: ResultItem, position?: string) {
  const pos = position || player.pos;
  const config = STATS_CONFIG[pos as keyof typeof STATS_CONFIG] || {};
  const globalPrimary = pos === 'GK' ? [] : STATS_CONFIG.GLOBAL.PRIMARY;
  const statsToShow = config.PRIMARY || globalPrimary;
  
  return statsToShow.map(statKey => ({
    key: statKey,
    label: getStatLabel(statKey),
    value: player[statKey as keyof ResultItem],
    unit: getStatUnit(statKey)
  }));
}

function getStatLabel(key: string) {
  const labels = {
    'Min': 'Minutes',
    'MP': 'Matches', 
    'Gls': 'Goals',
    'Ast': 'Assists',
    'xG': 'xG',
    'CS': 'Clean Sheets',
    'Save%': 'Save %',
    'PSxG+/-': 'PSxG +/-'
  };
  return labels[key as keyof typeof labels] || key;
}

function getStatUnit(key: string) {
  const percentageStats = ['Save%'];
  if (percentageStats.includes(key)) return '%';
  return '';
}

/** Parse "6,00 mio. €", "100 K €", etc. to a number in m€ (e.g. 6 or 0.1). */
function numericMarketM(input?: string | null): number | null {
  if (!input) return null;
  const s = input.replace(/\s+/g, "").replace(",", ".").toLowerCase();
  if (s.includes("mio") || s.includes("m€") || s.endsWith("m€")) {
    const n = parseFloat(s.replace(/[^\d.]/g, ""));
    return isFinite(n) ? n : null;
  }
  if (s.includes("k")) {
    const n = parseFloat(s.replace(/[^\d.]/g, ""));
    return isFinite(n) ? n / 1000 : null;
  }
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return isFinite(n) ? n : null;
}

export default function Results() {
  const [sp] = useSearchParams();
  const query = sp.get("query")?.trim() ?? "";

  // data
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<ResultItem[]>([]);
  const [hero, setHero] = useState<ResultItem | null>(null);

  // filters
  const [posFilter, setPosFilter] = useState<string[]>([]);
  const [leagueFilter, setLeagueFilter] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([AGE_MIN, AGE_MAX]);
  const [valueRange, setValueRange] = useState<[number, number]>([VALUE_MIN_M, VALUE_MAX_M]);

  // dropdown states
  const [posDropdownOpen, setPosDropdownOpen] = useState(false);
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false);

  // load data
  useEffect(() => {
    if (!query) return;
    let alive = true;
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        console.log("=== CALLING API similar() ===");
        console.log("Query:", query);
        
        const resp = (await similar(query, 20)) as ApiResponse;
        console.log("Raw API response:", resp);
        
        if (!alive) return;

        const normalize = (s?: number) =>
          s == null ? undefined : s > 1 ? s : s * 100;

        console.log("resp.results:", resp.results);
        console.log("resp.player:", resp.player);

        const rows =
          resp.results?.map((r) => {
            console.log("Processing result item:", r);
            const normalized = normalizePlayerData({
              ...r,
              similarity: normalize(r.similarity),
            });
            console.log("Normalized item:", normalized);
            return normalized;
          }) ?? [];

        console.log("Final rows to setItems:", rows);
        setItems(rows);
        
        const heroData = normalizePlayerData(
          resp.player ?? {
            name: query,
          }
        );
        console.log("Hero data:", heroData);
        setHero(heroData);
      } catch (e: any) {
        console.error("API Error:", e);
        setErr(`similar() failed: ${e?.message ?? String(e)}`);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [query]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setPosDropdownOpen(false);
        setLeagueDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // POSITIONS : Ordre logique basé sur vos vraies données CSV
  const availablePositions = useMemo(() => {
    // DEBUG: Vérifier les données reçues
    console.log("=== DEBUG POSITIONS ===");
    console.log("Items count:", items.length);
    console.log("Sample items:", items.slice(0, 3));
    
    // 1. Extraire TOUTES les positions de votre CSV
    const csvPositions = new Set<string>();
    items.forEach((item, index) => {
      console.log(`Item ${index}: pos = "${item.pos}", name = "${item.name}"`);
      if (item.pos) csvPositions.add(item.pos);
    });
    
    console.log("CSV Positions found:", Array.from(csvPositions));
    
    // 2. Trier selon l'ordre logique terrain
    const orderedPositions = POSITION_ORDER.filter(pos => csvPositions.has(pos));
    
    // 3. Ajouter positions non-prévues à la fin (au cas où)
    const otherPositions = Array.from(csvPositions)
      .filter(pos => !POSITION_ORDER.includes(pos))
      .sort();
    
    const result = [...orderedPositions, ...otherPositions];
    console.log("Final positions:", result);
    
    return result;
  }, [items]);

  // LEAGUES : Dynamiques depuis vos données CSV
  const availableLeagues = useMemo(() => {
    // DEBUG: Vérifier les ligues
    console.log("=== DEBUG LEAGUES ===");
    console.log("Items count for leagues:", items.length);
    
    const leagues = new Set<string>();
    items.forEach((item, index) => {
      console.log(`Item ${index}: league = "${item.league}", name = "${item.name}"`);
      if (item.league) leagues.add(item.league);
    });
    
    const result = Array.from(leagues).sort();
    console.log("Final leagues:", result);
    
    return result;
  }, [items]);

  // Logique de filtrage
  const filtered = useMemo(() => {
    return items.filter((it) => {
      // position - exact match
      if (posFilter.length > 0) {
        if (!posFilter.includes(it.pos || "")) return false;
      }
      // league - exact match sans préfixes
      if (leagueFilter.length > 0) {
        const cleanLeague = (it.league || "").replace(/^[a-z]{2,3}\s+/i, '');
        const cleanFilters = leagueFilter.map(l => l.replace(/^[a-z]{2,3}\s+/i, ''));
        if (!cleanFilters.includes(cleanLeague)) return false;
      }
      // age range
      if (it.age != null) {
        if (it.age < ageRange[0] || it.age > ageRange[1]) return false;
      }
      // value range
      const mv = numericMarketM(it.marketValue);
      if (mv != null) {
        if (mv < valueRange[0] || mv > valueRange[1]) return false;
      }
      return true;
    });
  }, [items, posFilter, leagueFilter, ageRange, valueRange]);

  const heroStats = hero ? getStatsForPosition(hero, hero.pos) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="chameleon logo" className="h-8 w-8 rounded-full" />
            <span className="text-lg font-semibold text-teal-600">chameleon</span>
          </Link>
          <div className="mx-2 h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-4 flex-1">
            <div className="truncate text-sm text-gray-600">
              Similar players to{" "}
              <span className="font-medium text-gray-900">{query}</span>
            </div>
            <Link 
              to="/"
              className="ml-auto px-3 py-1 text-sm font-medium text-teal-600 hover:text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors"
            >
              New Search
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* HERO - Player Info avec stats */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-center">
            {/* Photo centrée */}
            <img
              src={photoFor(hero?.name || "")}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/players/default.jpg";
              }}
              alt={hero?.name ?? "player"}
              className="h-24 w-24 rounded-full object-cover mx-auto mb-4"
            />
            
            {/* Nom du joueur */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {hero?.name ?? query}
            </h1>
            
            {/* Infos: age + poste + club + ligue */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-6">
              {hero?.age && <span className="font-medium">{hero.age} years</span>}
              {hero?.pos && <span className="font-medium">{getPositionLabel(hero.pos)}</span>}
              {hero?.club && <span>{hero.club}</span>}
              {hero?.league && <span>{hero.league.replace(/^[a-z]{2,3}\s+/i, '')}</span>}
            </div>

            {/* Market Value + Stats centrés */}
            <div className="flex items-center justify-center gap-8">
              {/* Market Value */}
              {hero?.marketValue && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4">
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    {formatMarketValue(hero.marketValue).replace('Û', '€')}
                  </div>
                </div>
              )}
              
              {/* Stats primaires */}
              <div className="grid grid-cols-5 gap-4">
                {heroStats.map((stat) => (
                  <StatCard
                    key={stat.key}
                    label={stat.label}
                    value={stat.value || 0}
                    unit={stat.unit}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-gray-800 mb-4">Filters</div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Position dropdown - TOUTES LES POSITIONS */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPosDropdownOpen(!posDropdownOpen);
                  setLeagueDropdownOpen(false);
                }}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-gray-400"
              >
                <span className="text-sm">
                  {posFilter.length === 0 ? "All positions" : `${posFilter.length} selected`}
                </span>
                <svg className={`w-5 h-5 transition-transform ${posDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {posDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                    {availablePositions.map((pos) => (
                      <label key={pos} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={posFilter.includes(pos)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setPosFilter([...posFilter, pos]);
                            } else {
                              setPosFilter(posFilter.filter(p => p !== pos));
                            }
                          }}
                          className="mr-3 text-teal-600 focus:ring-teal-500 rounded"
                        />
                        <span className="text-sm">{getPositionLabel(pos)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* League dropdown */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">League</label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLeagueDropdownOpen(!leagueDropdownOpen);
                  setPosDropdownOpen(false);
                }}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-gray-400"
              >
                <span className="text-sm">
                  {leagueFilter.length === 0 ? "All leagues" : `${leagueFilter.length} selected`}
                </span>
                <svg className={`w-5 h-5 transition-transform ${leagueDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {leagueDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                    {availableLeagues.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No leagues available</div>
                    ) : (
                      availableLeagues.map((league) => (
                        <label key={league} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={leagueFilter.includes(league)}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                setLeagueFilter([...leagueFilter, league]);
                              } else {
                                setLeagueFilter(leagueFilter.filter(l => l !== league));
                              }
                            }}
                            className="mr-3 text-teal-600 focus:ring-teal-500 rounded"
                          />
                          <span className="text-sm truncate">{league.replace(/^[a-z]{2,3}\s+/i, '')}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Age Range - Inputs numériques */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={AGE_MIN}
                  max={AGE_MAX}
                  value={ageRange[0]}
                  onChange={(e) => {
                    const min = Number(e.target.value);
                    if (min >= AGE_MIN && min <= ageRange[1]) {
                      setAgeRange([min, ageRange[1]]);
                    }
                  }}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min={AGE_MIN}
                  max={AGE_MAX}
                  value={ageRange[1]}
                  onChange={(e) => {
                    const max = Number(e.target.value);
                    if (max <= AGE_MAX && max >= ageRange[0]) {
                      setAgeRange([ageRange[0], max]);
                    }
                  }}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
                />
                <span className="text-gray-500 text-sm">years</span>
              </div>
            </div>

            {/* Value Range - Inputs numériques */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={VALUE_MIN_M}
                  max={VALUE_MAX_M}
                  step="0.1"
                  value={valueRange[0]}
                  onChange={(e) => {
                    const min = Number(e.target.value);
                    if (min >= VALUE_MIN_M && min <= valueRange[1]) {
                      setValueRange([min, valueRange[1]]);
                    }
                  }}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min={VALUE_MIN_M}
                  max={VALUE_MAX_M}
                  step="0.5"
                  value={valueRange[1]}
                  onChange={(e) => {
                    const max = Number(e.target.value);
                    if (max <= VALUE_MAX_M && max >= valueRange[0]) {
                      setValueRange([valueRange[0], max]);
                    }
                  }}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
                />
                <span className="text-gray-500 text-sm">m€</span>
              </div>
            </div>
          </div>
        </section>

        {/* RESULTS avec stats */}
        <section>
          <div className="mb-4 text-sm text-gray-600">
            {loading ? "Loading…" : `${filtered.length} players`}
            {err && (
              <span className="ml-2 rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                {err}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((p) => {
              const playerStats = getStatsForPosition(p, p.pos);
              
              return (
                <div
                  key={p.name}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={photoFor(p.name)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/players/default.jpg";
                        }}
                        alt={p.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">{p.name}</h3>
                        <div className="text-sm text-gray-600">
                          {p.pos && <span>{getPositionLabel(p.pos)}</span>}
                          {p.age && <span> • {p.age} years</span>}
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          {formatMarketValue(p.marketValue)}
                        </div>
                      </div>
                    </div>
                    <div className="bg-teal-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm">
                      {pct(p.similarity)}
                    </div>
                  </div>

                  {/* Stats du joueur */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    {playerStats.slice(0, 3).map((stat) => (
                      <StatCard
                        key={stat.key}
                        label={stat.label}
                        value={stat.value}
                        unit={stat.unit}
                      />
                    ))}
                  </div>

                  <div className="text-right">
                    <Link
                      to={`/player/${encodeURIComponent(p.name)}`}
                      className="text-teal-600 hover:text-teal-700 font-semibold text-sm"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
              No players match your filters.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}