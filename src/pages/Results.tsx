// Normalise les données venant de ton API (format différent du CSV)
function normalizePlayerData(player: any): ResultItem {
  console.log('Données brutes reçues:', player); // Debug

  return {
    name: player.name || player.Player || "",
    pos: player.position || player.pos || player.Pos || "",
    age: Number(player.age || player.Age) || undefined,
    club: player.club || player.Squad || "",
    league: player.league || player.Comp || "",
    marketValue: player.marketValue || player.market_value || null,
    similarity: player.score || player.similarity,
    // Stats de base - noms exacts du CSV
    Min: Number(player.Min) || 0,
    MP: Number(player.MP) || 0,
    Gls: Number(player.Gls) || 0,
    Ast: Number(player.Ast) || 0,
    xG: Number(player.xG) || 0,
    '90s': Number(player['90s']) || 0,
    // Stats gardien - noms exacts du CSV
    CS: Number(player.CS) || 0,
    'Save%': Number(player['Save%']) || 0,
    'PSxG+/-': Number(player['PSxG+/-']) || 0,
    SoTA: Number(player.SoTA) || 0,
    // Stats défense - noms exacts du CSV
    Tkl: Number(player.Tkl) || 0,
    Int: Number(player.Int) || 0,
    Blocks: Number(player.Blocks || player.Blocks_stats_defense) || 0,
    Clr: Number(player.Clr) || 0,
    // Stats creation/passing - noms exacts du CSV
    KP: Number(player.KP) || 0,
    xAG: Number(player.xAG || player.xAG_stats_passing) || 0,
    SCA: Number(player.SCA) || 0,
    PrgP: Number(player.PrgP || player.PrgP_stats_passing) || 0,
    'Cmp%': Number(player['Cmp%']) || 0,
    // Stats attaque - noms exacts du CSV
    SoT: Number(player.SoT) || 0,
    'SoT%': Number(player['SoT%']) || 0,
    'Sh/90': Number(player['Sh/90']) || 0,
    'G/Sh': Number(player['G/Sh']) || 0,
    npxG: Number(player.npxG) || 0
  };
}import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { similar } from "@/lib/api";
import { photoFor } from "@/lib/photos";

// Configuration des stats par position - Basée sur votre config scout
const STATS_CONFIG = {
  GLOBAL: {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'xG', '90s']
  },
  GK: {
    PRIMARY: ['Min', 'MP', 'CS', 'Save%', 'PSxG+/-', '90s']
  },
  DF: {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'Tkl', 'Int']
  },
  'DF,MF': {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'PrgP', 'KP']
  },
  MF: {
    PRIMARY: ['Min', 'MP', 'KP', 'xAG', 'SCA', 'PrgP']
  },
  'MF,DF': {
    PRIMARY: ['Min', 'MP', 'Tkl', 'Int', 'PrgP', 'KP']
  },
  'MF,FW': {
    PRIMARY: ['Min', 'MP', 'xG', 'xAG', 'SCA', 'KP']
  },
  FW: {
    PRIMARY: ['Min', 'MP', 'xG', 'SoT', 'Gls', '90s']
  },
  'FW,MF': {
    PRIMARY: ['Min', 'MP', 'xG', 'KP', 'SCA', 'Gls']
  },
  'FW,DF': {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'Tkl', 'xG']
  },
  'DF,FW': {
    PRIMARY: ['Min', 'MP', 'Gls', 'Ast', 'Tkl', 'xG']
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
  // Stats de base
  Min?: number;
  MP?: number;
  Gls?: number;
  Ast?: number;
  xG?: number;
  '90s'?: number;
  // Stats gardien
  CS?: number;
  'Save%'?: number;
  'PSxG+/-'?: number;
  SoTA?: number;
  // Stats défense
  Tkl?: number;
  Int?: number;
  Blocks?: number;
  Clr?: number;
  // Stats creation/passing
  KP?: number;
  xAG?: number;
  SCA?: number;
  PrgP?: number;
  'Cmp%'?: number;
  // Stats attaque
  SoT?: number;
  'SoT%'?: number;
  'Sh/90'?: number;
  'G/Sh'?: number;
  npxG?: number;
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
    '90s': '90s',
    'CS': 'Clean Sheets',
    'Save%': 'Save %',
    'PSxG+/-': 'PSxG +/-',
    'SoTA': 'SoTA',
    'Tkl': 'Tackles',
    'Int': 'Interceptions',
    'KP': 'Key Passes',
    'xAG': 'xAG',
    'SCA': 'SCA',
    'PrgP': 'Progressive Passes',
    'SoT': 'SoT',
    'Cmp%': 'Pass %'
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

// Configuration des filtres avancés par section - organisée par logique
const ADVANCED_FILTERS = {
  general: {
    title: "General",
    stats: [
      { key: "MP", label: "Matches", tooltip: "Matches played" },
      { key: "Min", label: "Minutes", tooltip: "Minutes played" },
      { key: "90s", label: "90s", tooltip: "Minutes played divided by 90" }
    ]
  },
  offensive: {
    title: "Offensive",
    stats: [
      { key: "Gls", label: "Goals", tooltip: "Goals scored" },
      { key: "Ast", label: "Assists", tooltip: "Assists provided (pass directly leading to a goal)" },
      { key: "xG", label: "xG", tooltip: "Expected Goals (includes penalties)" }
    ]
  },
  passing: {
    title: "Passing",
    stats: [
      { key: "Cmp%", label: "Pass%", tooltip: "Pass completion percentage", isPercentage: true },
      { key: "PrgP", label: "Progressive Passes", tooltip: "Completed passes moving ball ≥10 yards towards goal" },
      { key: "KP", label: "Key Passes", tooltip: "Passes directly leading to a shot" }
    ]
  },
  shooting: {
    title: "Shooting",
    stats: [
      { key: "Sh", label: "Shots", tooltip: "Total shots attempted" },
      { key: "SoT", label: "SoT", tooltip: "Shots on Target" },
      { key: "G/Sh", label: "G/Sh", tooltip: "Goals per Shot" }
    ]
  },
  defensive: {
    title: "Defensive", 
    stats: [
      { key: "Tkl", label: "Tackles", tooltip: "Number of players tackled" },
      { key: "Int", label: "Interceptions", tooltip: "Interceptions made" },
      { key: "Blocks", label: "Blocks", tooltip: "Number of times blocking a shot" }
    ]
  },
  possession: {
    title: "Possession",
    stats: [
      { key: "Touches", label: "Touches", tooltip: "Number of times a player touched the ball" },
      { key: "Succ%", label: "Dribble%", tooltip: "Percentage of dribbles completed successfully", isPercentage: true },
      { key: "PrgC", label: "Progressive Carries", tooltip: "Carries moving the ball ≥10 yards towards goal" }
    ]
  },
  creation: {
    title: "Creation",
    stats: [
      { key: "SCA", label: "SCA", tooltip: "Shot-Creating Actions" },
      { key: "GCA", label: "GCA", tooltip: "Goal-Creating Actions" },
      { key: "SCA90", label: "SCA/90", tooltip: "Shot-Creating Actions per 90 minutes" }
    ]
  },
  discipline: {
    title: "Discipline",
    stats: [
      { key: "CrdY", label: "Yellow Cards", tooltip: "Yellow cards received" },
      { key: "CrdR", label: "Red Cards", tooltip: "Red cards received" },
      { key: "Fls", label: "Fouls", tooltip: "Fouls committed" }
    ]
  },
  goalkeeper: {
    title: "Goalkeeper",
    stats: [
      { key: "Saves", label: "Saves", tooltip: "Number of saves made" },
      { key: "Save%", label: "Save%", tooltip: "Percentage of shots saved", isPercentage: true },
      { key: "CS", label: "Clean Sheets", tooltip: "Number of matches with no goals conceded" }
    ]
  }
};

// Fonction pour obtenir les valeurs par défaut d'une stat
const getStatDefaults = (key: string, isPercentage = false) => {
  const percentageDefaults = { min: 0, max: 100 };
  const normalDefaults = { min: 0, max: 50 };
  const specialDefaults: Record<string, { min: number; max: number }> = {
    'Min': { min: 0, max: 3000 },
    'MP': { min: 0, max: 40 },
    'Starts': { min: 0, max: 40 },
    '90s': { min: 0, max: 40 },
    'Touches': { min: 0, max: 120 },
    'Carries': { min: 0, max: 80 },
    'Gls': { min: 0, max: 30 },
    'Ast': { min: 0, max: 20 },
    'xG': { min: 0, max: 25 },
    'Sh': { min: 0, max: 150 },
    'Saves': { min: 0, max: 150 },
    'GA': { min: 0, max: 80 }
  };

  if (isPercentage) return percentageDefaults;
  return specialDefaults[key] || normalDefaults;
};

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
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, [number, number]>>({});

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

  const heroStats = hero ? getStatsForPosition(hero, hero.pos) : [];

  // Fonction pour vérifier si un joueur correspond aux filtres avancés
  const matchesAdvancedFilters = (player: ResultItem) => {
    for (const [statKey, [min, max]] of Object.entries(advancedFilters)) {
      const value = player[statKey as keyof ResultItem] as number;
      if (value != null && (value < min || value > max)) {
        return false;
      }
    }
    return true;
  };

  // Logique de filtrage avec filtres avancés
  const filtered = useMemo(() => {
    return items.filter((it) => {
      // Filtres existants
      if (posFilter.length > 0) {
        if (!posFilter.includes(it.pos || "")) return false;
      }
      if (leagueFilter.length > 0) {
        const cleanLeague = (it.league || "").replace(/^[a-z]{2,3}\s+/i, '');
        const cleanFilters = leagueFilter.map(l => l.replace(/^[a-z]{2,3}\s+/i, ''));
        if (!cleanFilters.includes(cleanLeague)) return false;
      }
      if (it.age != null) {
        if (it.age < ageRange[0] || it.age > ageRange[1]) return false;
      }
      const mv = numericMarketM(it.marketValue);
      if (mv != null) {
        if (mv < valueRange[0] || mv > valueRange[1]) return false;
      }
      
      // Filtres avancés
      if (!matchesAdvancedFilters(it)) return false;
      
      return true;
    });
  }, [items, posFilter, leagueFilter, ageRange, valueRange, advancedFilters]);

  // Fonction pour réinitialiser les filtres avancés
  const resetAdvancedFilters = () => {
    setAdvancedFilters({});
  };

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
              
              {/* More filters link positionné sous Value */}
              <div className="mt-3 flex">
                <div className="w-24"></div> {/* Espaceur pour aligner avec le 2e input */}
                <span className="text-gray-500 w-4 text-center">-</span>
                <div className="w-24 flex justify-start">
                  <button
                    onClick={() => setMoreFiltersOpen(true)}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    More filters +
                    {Object.keys(advancedFilters).length > 0 && (
                      <span className="ml-1 bg-gradient-to-r from-teal-500 to-cyan-400 text-white px-1.5 py-0.5 rounded-full text-xs">
                        {Object.keys(advancedFilters).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clear filters si des filtres avancés sont actifs */}
          {Object.keys(advancedFilters).length > 0 && (
            <div className="mt-4 flex justify-start">
              <button
                onClick={resetAdvancedFilters}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear advanced filters
              </button>
            </div>
          )}
        </section>

        {/* POPUP MORE FILTERS */}
        {moreFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
                <button
                  onClick={() => setMoreFiltersOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-8">
                  {Object.entries(ADVANCED_FILTERS).map(([sectionKey, section]) => {
                    // Masquer la section GK si aucun GK sélectionné
                    if (sectionKey === 'goalkeeper' && !posFilter.includes('GK')) {
                      return null;
                    }

                    return (
                      <div key={sectionKey} className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                          {section.title}
                        </h3>
                        
                        <div className="space-y-4">
                          {section.stats.map(stat => {
                            const defaults = getStatDefaults(stat.key, stat.isPercentage);
                            const currentFilter = advancedFilters[stat.key] || [defaults.min, defaults.max];
                            
                            return (
                              <div key={stat.key} className="space-y-2">
                                <div className="text-sm font-medium text-gray-700 relative group">
                                  {stat.label}
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10">
                                    {stat.tooltip}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="number"
                                    min={defaults.min}
                                    max={defaults.max}
                                    step={stat.isPercentage ? 1 : 0.1}
                                    value={currentFilter[0]}
                                    onChange={(e) => {
                                      const min = Number(e.target.value);
                                      if (min >= defaults.min && min <= currentFilter[1]) {
                                        setAdvancedFilters(prev => ({
                                          ...prev,
                                          [stat.key]: [min, currentFilter[1]]
                                        }));
                                      }
                                    }}
                                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center"
                                  />
                                  <span className="text-gray-500 text-sm">-</span>
                                  <input
                                    type="number"
                                    min={defaults.min}
                                    max={defaults.max}
                                    step={stat.isPercentage ? 1 : 0.1}
                                    value={currentFilter[1]}
                                    onChange={(e) => {
                                      const max = Number(e.target.value);
                                      if (max <= defaults.max && max >= currentFilter[0]) {
                                        setAdvancedFilters(prev => ({
                                          ...prev,
                                          [stat.key]: [currentFilter[0], max]
                                        }));
                                      }
                                    }}
                                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
                                  />
                                  {stat.isPercentage && <span className="text-gray-500 text-sm">%</span>}
                                  
                                  {/* Bouton pour supprimer ce filtre */}
                                  {advancedFilters[stat.key] && (
                                    <button
                                      onClick={() => {
                                        setAdvancedFilters(prev => {
                                          const newFilters = { ...prev };
                                          delete newFilters[stat.key];
                                          return newFilters;
                                        });
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs"
                                      title="Remove filter"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 flex items-center justify-between">
                <button
                  onClick={resetAdvancedFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all advanced filters
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setMoreFiltersOpen(false)}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setMoreFiltersOpen(false)}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-semibold rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/25"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              
              // Calcul du dégradé selon le % de match
              const similarity = p.similarity || 0;
              const getBorderColor = (sim: number) => {
                if (sim >= 90) return 'border-teal-500';
                if (sim >= 75) return 'border-cyan-400'; 
                if (sim >= 60) return 'border-yellow-400';
                return 'border-gray-300';
              };
              
              return (
                <div
                  key={p.name}
                  className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 ${getBorderColor(similarity)}`}
                >
                  {/* Header horizontal avec badge à droite */}
                  <div className="flex items-start gap-4 mb-6">
                    <img
                      src={photoFor(p.name)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/players/default.jpg";
                      }}
                      alt={p.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{p.name}</h3>
                      {/* Ligne infos comme hero : age + poste + club + ligue */}
                      <div className="text-sm text-gray-600 mb-2">
                        {p.age && <span className="font-medium">{p.age} years</span>}
                        {p.pos && p.age && <span> • </span>}
                        {p.pos && <span className="font-medium">{getPositionLabel(p.pos)}</span>}
                        {p.club && (p.age || p.pos) && <span> • </span>}
                        {p.club && <span>{p.club}</span>}
                        {p.league && (p.age || p.pos || p.club) && <span> • </span>}
                        {p.league && <span>{p.league.replace(/^[a-z]{2,3}\s+/i, '')}</span>}
                      </div>
                      {/* Prix */}
                      <div className="text-sm font-semibold text-teal-600">
                        {formatMarketValue(p.marketValue).replace('Û', '€')}
                      </div>
                    </div>
                    {/* Badge similarité grand à droite */}
                    <div className="flex items-center h-12">
                      <div className="bg-teal-500 text-white px-4 py-3 rounded-xl font-bold text-lg shadow-sm">
                        {pct(p.similarity)}
                      </div>
                    </div>
                  </div>

                  {/* Stats principales - 2 lignes de 3 */}
                  <div className="space-y-3 mb-4">
                    {/* Première ligne */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {playerStats.slice(0, 3).map((stat) => (
                        <div key={stat.key}>
                          <div className="text-lg font-bold text-gray-900">
                            {`${stat.value || 0}${stat.unit}`}
                          </div>
                          <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Deuxième ligne */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {playerStats.slice(3, 6).map((stat) => (
                        <div key={stat.key}>
                          <div className="text-lg font-bold text-gray-900">
                            {`${stat.value || 0}${stat.unit}`}
                          </div>
                          <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end items-center">
                    <Link
                      to={`/player/${encodeURIComponent(p.name)}`}
                      className="text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors"
                    >
                      Details →
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