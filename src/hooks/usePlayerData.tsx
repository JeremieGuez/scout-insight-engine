import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Papa from 'papaparse';
import { Player } from '@/data/players';
import { FBrefPlayerRow } from '@/types/csv';

interface PlayerDataContextType {
  players: Player[];
  isLoading: boolean;
  error: string | null;
  loadFromCSV: (file: File) => Promise<void>;
  totalPlayers: number;
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
  const age = safeParseInt(row.Age, 25);
  const goals = safeParseInt(row.Gls);
  const assists = safeParseInt(row.Ast);
  const minutes = safeParseInt(row.Min);
  const position = normalizePosition(row.Pos);
  const { league, country } = normalizeLeague(row.Comp);
  const nineties = safeParseFloat(row["90s"], 1);
  
  // Estimate missing stats based on available data
  const tackles = Math.max(0, Math.round((safeParseInt(row.CrdY) * 8 + Math.random() * 20)));
  const interceptions = Math.max(0, Math.round(tackles * 0.6 + Math.random() * 15));
  const passAccuracy = Math.max(65, Math.min(95, 75 + (safeParseFloat(row.PrgP) / nineties / 10) + Math.random() * 10));
  const forwardPasses = Math.max(0, Math.round(safeParseFloat(row.PrgP) + Math.random() * 50));
  
  // Style metrics based on position and stats
  const tempo = Math.max(1, Math.min(10, Math.round(5 + (forwardPasses / nineties / 20) + Math.random() * 3)));
  const pressingIntensity = Math.max(1, Math.min(10, Math.round(5 + (tackles / nineties / 3) + Math.random() * 3)));
  const aggressivenessIndex = Math.max(1, Math.min(10, Math.round(3 + (safeParseInt(row.CrdY) / nineties * 2) + Math.random() * 4)));
  
  return {
    id: `csv-player-${index}`,
    name: row.Player.trim(),
    age,
    club: row.Squad.trim(),
    position,
    league,
    country,
    goals,
    assists,
    tackles,
    interceptions,
    passAccuracy: Math.round(passAccuracy * 10) / 10,
    forwardPasses,
    kmCovered: Math.round((8 + Math.random() * 4) * 10) / 10,
    tempo,
    pressingIntensity,
    aggressivenessIndex,
    pressMentions: Math.round(Math.random() * 50),
    sentimentScore: Math.round(-30 + Math.random() * 110),
    socialMediaActivity: Math.round(1 + Math.random() * 9),
    followersCount: Math.round(1000 + Math.random() * 4999000),
    marketValue: Math.round(estimateMarketValue(age, goals, assists, minutes, position) * 10) / 10,
    contractExpiry: `${2024 + Math.floor(Math.random() * 4)}-06-30`,
    height: Math.round(165 + Math.random() * 35),
    preferredFoot: Math.random() > 0.7 ? 'Left' : Math.random() > 0.9 ? 'Both' : 'Right'
  };
}

export function PlayerDataProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          console.log('🎯 Final result:', {
            totalRowsInCSV: results.data.length,
            processedPlayers: processedCount,
            skippedRows: skippedCount,
            uniquePlayersCreated: uniquePlayers.length
          });
          
          setPlayers(uniquePlayers);
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
        totalPlayers: players.length 
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
