import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Papa from 'papaparse';
import { Player } from '@/data/players';
import { FBrefPlayerRow } from '@/types/csv';

interface ImportStats {
  totalRows: number;
  processedPlayers: number;
  skippedRows: number;
  uniquePlayers: number;
  leagues: string[];
}

interface PlayerDataContextType {
  players: Player[];
  isLoading: boolean;
  error: string | null;
  loadFromCSV: (file: File) => Promise<void>;
  totalPlayers: number;
  lastImportStats: ImportStats | null;
}

const PlayerDataContext = createContext<PlayerDataContextType | undefined>(undefined);

function normalizePosition(position: string): string {
  const pos = position.trim().toUpperCase();
  
  // Map FBref positions to our system
  const positionMap: Record<string, string> = {
    'GK': 'GK',
    'DF': 'CB', 'CB': 'CB', 'LB': 'LB', 'RB': 'RB', 'WB': 'LB',
    'MF': 'CM', 'CM': 'CM', 'DM': 'CDM', 'AM': 'CAM', 'LM': 'LM', 'RM': 'RM',
    'FW': 'ST', 'CF': 'CF', 'ST': 'ST', 'LW': 'LW', 'RW': 'RW'
  };
  
  // Handle compound positions (e.g., "DF,MF" -> "CB")
  const firstPos = pos.split(',')[0];
  return positionMap[firstPos] || 'CM';
}

function normalizeLeague(comp: string): { league: string; country: string } {
  const competition = comp.toLowerCase();
  
  if (competition.includes('premier league')) return { league: 'Premier League', country: 'England' };
  if (competition.includes('championship')) return { league: 'Championship', country: 'England' };
  if (competition.includes('league one')) return { league: 'League One', country: 'England' };
  if (competition.includes('serie a')) return { league: 'Serie A', country: 'Italy' };
  if (competition.includes('serie b')) return { league: 'Serie B', country: 'Italy' };
  if (competition.includes('ligue 1')) return { league: 'Ligue 1', country: 'France' };
  if (competition.includes('ligue 2')) return { league: 'Ligue 2', country: 'France' };
  if (competition.includes('bundesliga')) return { league: 'Bundesliga', country: 'Germany' };
  if (competition.includes('la liga')) return { league: 'La Liga', country: 'Spain' };
  
  // Default mapping
  return { league: comp, country: 'Unknown' };
}

function safeParseFloat(value: string, defaultValue: number = 0): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function safeParseInt(value: string, defaultValue: number = 0): number {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function estimateMarketValue(age: number, goals: number, assists: number, minutes: number, position: string): number {
  // Base value calculation
  let baseValue = 0.5;
  
  // Age factor (peak at 25-28)
  const ageFactor = age <= 30 ? Math.max(0.3, 1 - Math.abs(age - 26) * 0.05) : Math.max(0.1, 1 - (age - 30) * 0.1);
  
  // Performance factor
  const performanceFactor = Math.min(3, (goals + assists * 0.7) / Math.max(1, minutes / 900) * 10);
  
  // Position factor
  const positionMultiplier = position === 'ST' || position === 'CF' ? 1.2 : 
                           position === 'CAM' || position === 'LW' || position === 'RW' ? 1.1 : 1.0;
  
  baseValue = baseValue * ageFactor * performanceFactor * positionMultiplier;
  
  // Add randomness for realism
  return Math.max(0.1, Math.min(150, baseValue + (Math.random() - 0.5) * baseValue * 0.5));
}

function csvRowToPlayer(row: FBrefPlayerRow, index: number): Player {
  const { league, country } = normalizeLeague(row.Comp);
  
  // Check for market value column (various possible names) - use index access for dynamic properties
  const marketValueFromCSV = (row as any)["Market Value"] || (row as any)["market value"] || (row as any)["Market_Value"] || (row as any)["market_value"];
  
  return {
    id: `csv-player-${index}`,
    name: row.Player.trim(),
    age: row.Age ? safeParseInt(row.Age) : undefined,
    club: row.Squad.trim(),
    position: normalizePosition(row.Pos),
    league,
    country,
    
    // Market value - use CSV value if available, otherwise estimate
    marketValue: marketValueFromCSV ? safeParseFloat(marketValueFromCSV) : 
      estimateMarketValue(
        row.Age ? safeParseInt(row.Age) : 25,
        row.Gls ? safeParseInt(row.Gls) : 0,
        row.Ast ? safeParseInt(row.Ast) : 0,
        row.Min ? safeParseInt(row.Min) : 0,
        normalizePosition(row.Pos)
      ),
    
    // Basic CSV stats - only use what's present
    goals: row.Gls ? safeParseInt(row.Gls) : undefined,
    assists: row.Ast ? safeParseInt(row.Ast) : undefined,
    minutes: row.Min ? safeParseInt(row.Min) : undefined,
    nineties: row["90s"] ? safeParseFloat(row["90s"]) : undefined,
    
    // Expected stats
    xG: row.xG ? safeParseFloat(row.xG) : undefined,
    npxG: row.npxG ? safeParseFloat(row.npxG) : undefined,
    xAG: row.xAG ? safeParseFloat(row.xAG) : undefined,
    npxGPlusxAG: row["npxG+xAG"] ? safeParseFloat(row["npxG+xAG"]) : undefined,
    
    // Progressive stats
    prgC: row.PrgC ? safeParseInt(row.PrgC) : undefined,
    prgP: row.PrgP ? safeParseInt(row.PrgP) : undefined,
    prgR: row.PrgR ? safeParseInt(row.PrgR) : undefined,
    
    // Shooting stats
    shots: row.Sh ? safeParseInt(row.Sh) : undefined,
    shotsOnTarget: row.SoT ? safeParseInt(row.SoT) : undefined,
    shotAccuracy: row["SoT%"] ? safeParseFloat(row["SoT%"]) : undefined,
    shotsOn90: row["Sh/90"] ? safeParseFloat(row["Sh/90"]) : undefined,
    
    // Passing stats
    passAttempts: row.Att ? safeParseInt(row.Att) : undefined,
    passCompleted: row.Cmp ? safeParseInt(row.Cmp) : undefined,
    passAccuracy: row["Cmp%"] ? safeParseFloat(row["Cmp%"]) : undefined,
    totalPassDistance: row.TotDist ? safeParseInt(row.TotDist) : undefined,
    progressivePassDistance: row.PrgDist ? safeParseInt(row.PrgDist) : undefined,
    
    // Defensive stats
    tackles: row.Tkl ? safeParseInt(row.Tkl) : undefined,
    tacklesWon: row.TklW ? safeParseInt(row.TklW) : undefined,
    interceptions: row.Int ? safeParseInt(row.Int) : undefined,
    blocks: row.Blocks_stats_defense ? safeParseInt(row.Blocks_stats_defense) : undefined,
    clearances: row.Clr ? safeParseInt(row.Clr) : undefined,
    
    // Goalkeeper stats
    saves: row.Saves ? safeParseInt(row.Saves) : undefined,
    savePercentage: row["Save%"] ? safeParseFloat(row["Save%"]) : undefined,
    cleanSheets: row.CS ? safeParseInt(row.CS) : undefined,
    goalsAgainst: row.GA ? safeParseInt(row.GA) : undefined,
    
    // NO MORE ESTIMATED/RANDOM DATA - everything else stays undefined
  };
}

export function PlayerDataProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastImportStats, setLastImportStats] = useState<ImportStats | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('scout360-player-data');
    const savedStats = localStorage.getItem('scout360-import-stats');
    
    if (savedData && savedStats) {
      try {
        const parsedData = JSON.parse(savedData);
        const parsedStats = JSON.parse(savedStats);
        setPlayers(parsedData);
        setLastImportStats(parsedStats);
        console.log('✅ Loaded', parsedData.length, 'players from localStorage');
      } catch (error) {
        console.error('❌ Error loading saved data:', error);
        localStorage.removeItem('scout360-player-data');
        localStorage.removeItem('scout360-import-stats');
      }
    }
  }, []);

  const loadFromCSV = async (file: File) => {
    setIsLoading(true);
    setError(null);
    console.log('🔍 Starting CSV import for file:', file.name, 'Size:', file.size);

    try {
      const text = await file.text();
      console.log('📄 File read successfully, length:', text.length);
      console.log('📄 First 500 characters:', text.substring(0, 500));
      
      Papa.parse<FBrefPlayerRow>(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('✅ CSV parsing completed');
          console.log('📊 Total rows parsed:', results.data.length);
          console.log('🔍 First row sample:', results.data[0]);
          
          if (results.errors.length > 0) {
            console.warn('⚠️ CSV parsing warnings:', results.errors);
          }

          // Convert and deduplicate players
          const playerMap = new Map<string, Player>();
          let processedCount = 0;
          let skippedCount = 0;
          
          results.data.forEach((row, index) => {
            if (!row.Player || !row.Squad) {
              skippedCount++;
              if (index < 5) console.log(`⏭️ Skipping row ${index}:`, row);
              return;
            }
            
            try {
              const player = csvRowToPlayer(row, index);
              const key = `${player.name}-${player.club}`;
              
              // Keep player with more minutes if duplicate
              const existing = playerMap.get(key);
              if (!existing || safeParseInt(row.Min) > safeParseInt(String(existing.goals + existing.assists))) {
                playerMap.set(key, player);
              }
              processedCount++;
              
              if (index < 3) console.log(`✅ Processed player ${index}:`, player.name, player.club, player.position);
            } catch (err) {
              console.error(`❌ Error processing row ${index}:`, err, row);
              skippedCount++;
            }
          });

          const uniquePlayers = Array.from(playerMap.values());
          
          // Calculate league distribution
          const leagueSet = new Set(uniquePlayers.map(p => p.league));
          const leagues = Array.from(leagueSet).sort();
          
          const stats: ImportStats = {
            totalRows: results.data.length,
            processedPlayers: processedCount,
            skippedRows: skippedCount,
            uniquePlayers: uniquePlayers.length,
            leagues
          };
          
          console.log('🎯 Final result:', stats);
          
          // Save to localStorage for persistence
          localStorage.setItem('scout360-player-data', JSON.stringify(uniquePlayers));
          localStorage.setItem('scout360-import-stats', JSON.stringify(stats));
          
          setPlayers(uniquePlayers);
          setLastImportStats(stats);
          setIsLoading(false);
        },
        error: (error) => {
          console.error('❌ Papa Parse error:', error);
          setError(`Failed to parse CSV: ${error.message}`);
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('❌ File reading error:', err);
      setError(`Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <PlayerDataContext.Provider 
      value={{ 
        players, 
        isLoading, 
        error, 
        loadFromCSV, 
        totalPlayers: players.length,
        lastImportStats
      }}
    >
      {children}
    </PlayerDataContext.Provider>
  );
}

export function usePlayerData() {
  const context = useContext(PlayerDataContext);
  if (context === undefined) {
    throw new Error('usePlayerData must be used within a PlayerDataProvider');
  }
  return context;
}
