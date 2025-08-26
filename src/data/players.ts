export interface Player {
  id: string;
  name: string;
  age?: number;
  club: string;
  position: string;
  league: string;
  country: string;
  
  // Basic CSV stats
  goals?: number;
  assists?: number;
  minutes?: number;
  nineties?: number; // 90s played
  
  // Expected stats (FBref)
  xG?: number;
  npxG?: number;
  xAG?: number;
  npxGPlusxAG?: number;
  
  // Progressive stats
  prgC?: number; // Progressive carries
  prgP?: number; // Progressive passes
  prgR?: number; // Progressive receptions
  
  // Shooting stats
  shots?: number;
  shotsOnTarget?: number;
  shotAccuracy?: number; // SoT%
  shotsOn90?: number; // Sh/90
  
  // Passing stats  
  passAttempts?: number;
  passCompleted?: number;
  passAccuracy?: number; // Cmp%
  totalPassDistance?: number;
  progressivePassDistance?: number;
  
  // Defensive stats
  tackles?: number;
  tacklesWon?: number;
  interceptions?: number;
  blocks?: number;
  clearances?: number;
  
  // Goalkeeper stats
  saves?: number;
  savePercentage?: number;
  cleanSheets?: number;
  goalsAgainst?: number;
  
  // Legacy fields (for backward compatibility with generated data)
  forwardPasses?: number;
  kmCovered?: number;
  tempo?: number;
  pressingIntensity?: number;
  aggressivenessIndex?: number;
  pressMentions?: number;
  sentimentScore?: number;
  socialMediaActivity?: number;
  followersCount?: number;
  marketValue?: number;
  contractExpiry?: string;
  height?: number;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  imageUrl?: string;
}

const clubs = {
  'Serie A': ['Juventus', 'AC Milan', 'Inter Milan', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina', 'Bologna', 'Torino'],
  'Serie B': ['Brescia', 'Parma', 'Venezia', 'Cremonese', 'Pisa', 'Spezia', 'Modena', 'Reggina', 'Perugia', 'Como'],
  'Serie C': ['Juventus U23', 'Atalanta U23', 'Padova', 'Vicenza', 'Catania', 'Bari', 'Foggia', 'Lecce', 'Cosenza', 'Reggina'],
  'Premier League': ['Manchester United', 'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea', 'Tottenham', 'Newcastle', 'Brighton', 'West Ham', 'Aston Villa'],
  'Championship': ['Leicester City', 'Leeds United', 'Burnley', 'Luton Town', 'Coventry City', 'Middlesbrough', 'Norwich City', 'West Brom', 'Hull City', 'Preston'],
  'League One': ['Portsmouth', 'Bolton Wanderers', 'Peterborough', 'Wigan Athletic', 'Stockport County', 'Wrexham', 'Birmingham City', 'Huddersfield', 'Blackpool', 'Exeter City'],
  'Ligue 1': ['PSG', 'Marseille', 'Monaco', 'Lyon', 'Lille', 'Nice', 'Rennes', 'Lens', 'Strasbourg', 'Montpellier'],
  'Ligue 2': ['Bordeaux', 'Saint-Étienne', 'Lorient', 'Guingamp', 'Caen', 'Bastia', 'Rodez', 'Pau FC', 'Dunkerque', 'Grenoble'],
  'Ligue 3': ['Versailles', 'Boulogne', 'Châteauroux', 'Cholet', 'Le Mans', 'Dijon', 'Rouen', 'Quevilly', 'Avranches', 'Épinal']
};

const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];

const firstNames = [
  'Marco', 'Luca', 'Alessandro', 'Matteo', 'Lorenzo', 'Francesco', 'Gabriele', 'Andrea', 'Simone', 'Davide',
  'Antoine', 'Lucas', 'Maxime', 'Thomas', 'Nicolas', 'Julien', 'Alexandre', 'Romain', 'Pierre', 'Hugo',
  'James', 'Harry', 'Jack', 'Oliver', 'Charlie', 'George', 'William', 'Thomas', 'Oscar', 'Henry',
  'Mohamed', 'Ahmed', 'Youssef', 'Omar', 'Karim', 'Hassan', 'Ibrahim', 'Mahmoud', 'Ali', 'Samir'
];

const lastNames = [
  'Rossi', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno',
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'El Amrani', 'Ben Ali', 'Diallo', 'Traore', 'Kone', 'Ouattara', 'Sangare', 'Coulibaly', 'Dembele', 'Keita'
];

function generateRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number, decimals: number = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generatePlayer(id: string): Player {
  const league = Object.keys(clubs)[Math.floor(Math.random() * Object.keys(clubs).length)];
  const clubsInLeague = clubs[league as keyof typeof clubs];
  const club = clubsInLeague[Math.floor(Math.random() * clubsInLeague.length)];
  const position = positions[Math.floor(Math.random() * positions.length)];
  const age = getRandomInRange(16, 38);
  
  // Generate stats based on position
  const isGoalkeeper = position === 'GK';
  const isDefender = ['CB', 'LB', 'RB'].includes(position);
  const isMidfielder = ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position);
  const isAttacker = ['LW', 'RW', 'ST', 'CF'].includes(position);
  
  let goals = 0;
  let assists = 0;
  
  if (isAttacker) {
    goals = getRandomInRange(0, 25);
    assists = getRandomInRange(0, 15);
  } else if (isMidfielder) {
    goals = getRandomInRange(0, 12);
    assists = getRandomInRange(0, 20);
  } else if (isDefender) {
    goals = getRandomInRange(0, 5);
    assists = getRandomInRange(0, 8);
  } else {
    goals = 0;
    assists = getRandomInRange(0, 2);
  }
  
  return {
    id,
    name: generateRandomName(),
    age,
    club,
    position,
    league,
    country: league.includes('Serie') ? 'Italy' : league.includes('Ligue') ? 'France' : 'England',
    
    // Performance stats
    goals,
    assists,
    tackles: isDefender ? getRandomInRange(30, 80) : getRandomInRange(10, 50),
    interceptions: isDefender ? getRandomInRange(20, 60) : getRandomInRange(5, 30),
    passAccuracy: getRandomFloat(70, 95),
    forwardPasses: isMidfielder ? getRandomInRange(100, 300) : getRandomInRange(20, 150),
    kmCovered: getRandomFloat(8, 12),
    
    // Style of play stats
    tempo: getRandomInRange(1, 10),
    pressingIntensity: getRandomInRange(1, 10),
    aggressivenessIndex: getRandomInRange(1, 10),
    
    // Media profile
    pressMentions: getRandomInRange(0, 50),
    sentimentScore: getRandomInRange(-30, 80),
    socialMediaActivity: getRandomInRange(1, 10),
    followersCount: getRandomInRange(1000, 5000000),
    
    // Additional data
    marketValue: getRandomFloat(0.1, 80, 1),
    contractExpiry: `${getRandomInRange(2024, 2028)}-06-30`,
    height: getRandomInRange(165, 200),
    preferredFoot: Math.random() > 0.7 ? 'Left' : Math.random() > 0.9 ? 'Both' : 'Right'
  };
}

// Generate 500+ players
export const players: Player[] = Array.from({ length: 520 }, (_, i) => 
  generatePlayer(`player-${i + 1}`)
);

// Helper functions for search and filtering
export function searchPlayers(query: string, playerList: Player[] = players): Player[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return playerList.filter(player => 
    player.name.toLowerCase().includes(searchTerm) ||
    player.club.toLowerCase().includes(searchTerm) ||
    player.position.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Limit autocomplete results
}

// Helper functions for feature extraction and similarity calculation
function isGoalkeeper(position: string): boolean {
  return position?.toUpperCase().startsWith('GK') || false;
}

function buildFeatureSet(players: Player[], forGk: boolean): string[] {
  // Map Player properties to feature names, prioritizing available stats
  if (forGk) {
    const gkFeatures = [
      'savePercentage', 'saves', 'cleanSheets', 'goalsAgainst', 
      'passAccuracy', 'passCompleted'
    ];
    return gkFeatures.filter(feat => {
      return players.some(p => p[feat as keyof Player] != null);
    });
  } else {
    const outfieldFeatures = [
      'shotsOn90', 'shotsOnTarget90', 'xG', 'npxG', 'shotAccuracy', 'goals', 'assists',
      'passAccuracy', 'prgP', 'prgC', 'prgR', 'totalPassDistance', 'progressivePassDistance',
      'touches', 'carries', 'miscontrols', 'dispossessed',
      'pressures', 'pressureSuccesses', 'tackles', 'interceptions', 'blocks', 'clearances',
      'aerialsWon', 'aerialWinPercentage', 'errors', 'yellowCards', 'redCards', 'offsides'
    ];
    return outfieldFeatures.filter(feat => {
      return players.some(p => p[feat as keyof Player] != null);
    });
  }
}

function standardizeFeatures(players: Player[], features: string[]): { 
  zScores: number[][], 
  means: { [key: string]: number }, 
  stds: { [key: string]: number } 
} {
  const means: { [key: string]: number } = {};
  const stds: { [key: string]: number } = {};
  
  // Calculate means and standard deviations for each feature
  features.forEach(feat => {
    const values = players
      .map(p => p[feat as keyof Player] as number)
      .filter(v => v != null && !isNaN(v));
    
    if (values.length > 0) {
      means[feat] = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - means[feat], 2), 0) / values.length;
      stds[feat] = Math.sqrt(variance) || 1; // Avoid division by zero
    } else {
      means[feat] = 0;
      stds[feat] = 1;
    }
  });
  
  // Calculate z-scores for all players
  const zScores = players.map(player => {
    return features.map(feat => {
      const value = player[feat as keyof Player] as number;
      if (value == null || isNaN(value)) return 0;
      return (value - means[feat]) / stds[feat];
    });
  });
  
  return { zScores, means, stds };
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0)) + 1e-9;
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0)) + 1e-9;
  
  return dotProduct / (normA * normB);
}

export function calculateSimilarity(player1: Player, player2: Player, allPlayers: Player[] = []): number {
  // Use a broader position grouping instead of exact match
  const player1IsGk = isGoalkeeper(player1.position);
  const player2IsGk = isGoalkeeper(player2.position);
  
  // Only compare players of the same role (GK vs outfield)
  if (player1IsGk !== player2IsGk) return 0;
  
  // Get all players of the same role for standardization
  const sameRolePlayers = allPlayers.length > 0 
    ? allPlayers.filter(p => isGoalkeeper(p.position) === player1IsGk)
    : [player1, player2];
  
  // Build feature set
  const features = buildFeatureSet(sameRolePlayers, player1IsGk);
  if (features.length === 0) return 0;
  
  // Standardize features
  const { zScores, means, stds } = standardizeFeatures(sameRolePlayers, features);
  
  // Find indices of our target players in the same role players array
  const player1Index = sameRolePlayers.findIndex(p => p.id === player1.id);
  const player2Index = sameRolePlayers.findIndex(p => p.id === player2.id);
  
  // If players not found in the array, calculate their z-scores directly
  let player1Vector: number[];
  let player2Vector: number[];
  
  if (player1Index >= 0) {
    player1Vector = zScores[player1Index];
  } else {
    player1Vector = features.map(feat => {
      const value = player1[feat as keyof Player] as number;
      return value != null && !isNaN(value) ? (value - means[feat]) / stds[feat] : 0;
    });
  }
  
  if (player2Index >= 0) {
    player2Vector = zScores[player2Index];
  } else {
    player2Vector = features.map(feat => {
      const value = player2[feat as keyof Player] as number;
      return value != null && !isNaN(value) ? (value - means[feat]) / stds[feat] : 0;
    });
  }
  
  // Calculate cosine similarity
  const similarity = cosineSimilarity(player1Vector, player2Vector);
  
  // Normalize to 0-1 range and ensure non-negative
  return Math.max(0, Math.min(1, (similarity + 1) / 2));
}

export function rankSimilarPlayers(targetPlayer: Player, playerList: Player[] = players): Array<Player & { similarity: number }> {
  return playerList
    .filter(player => player.id !== targetPlayer.id)
    .map(player => ({
      ...player,
      similarity: calculateSimilarity(targetPlayer, player, playerList)
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

export function findSimilarPlayers(targetPlayer: Player, count: number = 5, playerList: Player[] = players): Array<Player & { similarity: number }> {
  return rankSimilarPlayers(targetPlayer, playerList).slice(0, count);
}