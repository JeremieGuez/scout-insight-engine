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

export function calculateSimilarity(player1: Player, player2: Player): number {
  // Position must match exactly
  if (player1.position !== player2.position) return 0;
  
  let totalSimilarity = 0;
  let totalWeight = 0;
  
  // Helper function to calculate normalized similarity between two values
  const calcSimilarity = (val1: number | undefined, val2: number | undefined, maxDiff: number): number | null => {
    if (val1 == null || val2 == null) return null;
    const diff = Math.abs(val1 - val2);
    return Math.max(0, 1 - diff / maxDiff);
  };
  
  // Helper function to add similarity with weight
  const addSimilarity = (similarity: number | null, weight: number) => {
    if (similarity !== null) {
      totalSimilarity += similarity * weight;
      totalWeight += weight;
    }
  };
  
  // 1. Age similarity (3% weight) - reduced because we have better metrics
  addSimilarity(calcSimilarity(player1.age, player2.age, 8), 0.03);
  
  // 2. Playing time similarity (7% weight) - indicates similar usage
  addSimilarity(calcSimilarity(player1.minutes, player2.minutes, 3000), 0.04);
  addSimilarity(calcSimilarity(player1.nineties, player2.nineties, 30), 0.03);
  
  // Position-specific analysis
  const isGoalkeeper = player1.position === 'GK';
  const isDefender = ['CB', 'LB', 'RB', 'WB'].includes(player1.position);
  const isMidfielder = ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(player1.position);
  const isAttacker = ['LW', 'RW', 'ST', 'CF'].includes(player1.position);
  
  if (isGoalkeeper) {
    // ============ GOALKEEPER ANALYSIS (90% weight) ============
    
    // Shot stopping (40%)
    addSimilarity(calcSimilarity(player1.saves, player2.saves, 100), 0.25);
    addSimilarity(calcSimilarity(player1.savePercentage, player2.savePercentage, 30), 0.15);
    
    // Clean sheets and goals against (30%)
    addSimilarity(calcSimilarity(player1.cleanSheets, player2.cleanSheets, 20), 0.15);
    addSimilarity(calcSimilarity(player1.goalsAgainst, player2.goalsAgainst, 50), 0.15);
    
    // Distribution (20%)
    addSimilarity(calcSimilarity(player1.passAccuracy, player2.passAccuracy, 25), 0.10);
    addSimilarity(calcSimilarity(player1.passCompleted, player2.passCompleted, 200), 0.10);
    
  } else {
    // ============ OUTFIELD PLAYER ANALYSIS ============
    
    // 3. Basic offensive output (15% weight)
    addSimilarity(calcSimilarity(player1.goals, player2.goals, 25), 0.08);
    addSimilarity(calcSimilarity(player1.assists, player2.assists, 15), 0.07);
    
    // 4. Expected performance (15% weight) - more predictive than raw stats
    addSimilarity(calcSimilarity(player1.xG, player2.xG, 20), 0.08);
    addSimilarity(calcSimilarity(player1.xAG, player2.xAG, 15), 0.07);
    
    // 5. Progressive actions (15% weight) - key for modern football
    addSimilarity(calcSimilarity(player1.prgC, player2.prgC, 80), 0.05);
    addSimilarity(calcSimilarity(player1.prgP, player2.prgP, 100), 0.05);
    addSimilarity(calcSimilarity(player1.prgR, player2.prgR, 60), 0.05);
    
    if (isAttacker) {
      // ============ ATTACKER SPECIFIC (45% weight) ============
      
      // Shooting style (25%)
      addSimilarity(calcSimilarity(player1.shots, player2.shots, 150), 0.08);
      addSimilarity(calcSimilarity(player1.shotsOnTarget, player2.shotsOnTarget, 60), 0.07);
      addSimilarity(calcSimilarity(player1.shotAccuracy, player2.shotAccuracy, 40), 0.05);
      addSimilarity(calcSimilarity(player1.shotsOn90, player2.shotsOn90, 4), 0.05);
      
      // Chance creation (20%)
      addSimilarity(calcSimilarity(player1.prgC, player2.prgC, 60), 0.10);
      addSimilarity(calcSimilarity(player1.prgR, player2.prgR, 40), 0.10);
      
    } else if (isMidfielder) {
      // ============ MIDFIELDER SPECIFIC (45% weight) ============
      
      // Passing style (30%)
      addSimilarity(calcSimilarity(player1.passAccuracy, player2.passAccuracy, 25), 0.10);
      addSimilarity(calcSimilarity(player1.passCompleted, player2.passCompleted, 500), 0.08);
      addSimilarity(calcSimilarity(player1.totalPassDistance, player2.totalPassDistance, 3000), 0.07);
      addSimilarity(calcSimilarity(player1.progressivePassDistance, player2.progressivePassDistance, 1000), 0.05);
      
      // Tempo and creativity (15%)
      addSimilarity(calcSimilarity(player1.prgP, player2.prgP, 80), 0.10);
      addSimilarity(calcSimilarity(player1.prgC, player2.prgC, 40), 0.05);
      
    } else if (isDefender) {
      // ============ DEFENDER SPECIFIC (45% weight) ============
      
      // Defensive actions (30%)
      addSimilarity(calcSimilarity(player1.tackles, player2.tackles, 80), 0.10);
      addSimilarity(calcSimilarity(player1.tacklesWon, player2.tacklesWon, 60), 0.08);
      addSimilarity(calcSimilarity(player1.interceptions, player2.interceptions, 60), 0.07);
      addSimilarity(calcSimilarity(player1.clearances, player2.clearances, 100), 0.05);
      
      // Ball playing ability (15%) - modern defenders
      addSimilarity(calcSimilarity(player1.passAccuracy, player2.passAccuracy, 20), 0.08);
      addSimilarity(calcSimilarity(player1.prgP, player2.prgP, 50), 0.07);
    }
    
    // ============ UNIVERSAL OUTFIELD METRICS (10% weight) ============
    
    // Involvement and consistency (5%)
    addSimilarity(calcSimilarity(player1.passAttempts, player2.passAttempts, 800), 0.03);
    addSimilarity(calcSimilarity(player1.blocks, player2.blocks, 30), 0.02);
  }
  
  // Return normalized similarity (0-1)
  return totalWeight > 0 ? Math.min(1, totalSimilarity / totalWeight) : 0;
}

export function rankSimilarPlayers(targetPlayer: Player, playerList: Player[] = players): Array<Player & { similarity: number }> {
  return playerList
    .filter(player => player.id !== targetPlayer.id)
    .map(player => ({
      ...player,
      similarity: calculateSimilarity(targetPlayer, player)
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

export function findSimilarPlayers(targetPlayer: Player, count: number = 5, playerList: Player[] = players): Array<Player & { similarity: number }> {
  return rankSimilarPlayers(targetPlayer, playerList).slice(0, count);
}