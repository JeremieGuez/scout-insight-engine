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
  
  // Age similarity (5% weight)
  if (player1.age != null && player2.age != null) {
    const ageDiff = Math.abs(player1.age - player2.age);
    const ageSimilarity = Math.max(0, (8 - ageDiff) / 8);
    totalSimilarity += ageSimilarity * 0.05;
    totalWeight += 0.05;
  }
  
  // Minutes played similarity (5% weight) - helps compare players with similar game time
  if (player1.minutes != null && player2.minutes != null) {
    const minDiff = Math.abs(player1.minutes - player2.minutes);
    const minSimilarity = Math.max(0, 1 - minDiff / 3000); // Max diff ~3000 minutes
    totalSimilarity += minSimilarity * 0.05;
    totalWeight += 0.05;
  }
  
  // Position-specific similarity calculation
  const isGoalkeeper = player1.position === 'GK';
  const isDefender = ['CB', 'LB', 'RB', 'WB'].includes(player1.position);
  const isMidfielder = ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(player1.position);
  const isAttacker = ['LW', 'RW', 'ST', 'CF'].includes(player1.position);
  
  if (isGoalkeeper) {
    // For goalkeepers: saves, clean sheets, save percentage
    if (player1.saves != null && player2.saves != null) {
      const savesDiff = Math.abs(player1.saves - player2.saves);
      const savesSimilarity = Math.max(0, 1 - savesDiff / 100);
      totalSimilarity += savesSimilarity * 0.4;
      totalWeight += 0.4;
    }
    
    if (player1.savePercentage != null && player2.savePercentage != null) {
      const savePctDiff = Math.abs(player1.savePercentage - player2.savePercentage);
      const savePctSimilarity = Math.max(0, 1 - savePctDiff / 30);
      totalSimilarity += savePctSimilarity * 0.3;
      totalWeight += 0.3;
    }
  } else {
    // For outfield players: goals and assists (25% weight)
    if (player1.goals != null && player2.goals != null && player1.assists != null && player2.assists != null) {
      const goalsDiff = Math.abs(player1.goals - player2.goals);
      const assistsDiff = Math.abs(player1.assists - player2.assists);
      const attackingSimilarity = Math.max(0, 1 - (goalsDiff + assistsDiff) / 30);
      totalSimilarity += attackingSimilarity * 0.25;
      totalWeight += 0.25;
    }
    
    // Expected stats similarity (20% weight)
    if (player1.xG != null && player2.xG != null) {
      const xGDiff = Math.abs(player1.xG - player2.xG);
      const xGSimilarity = Math.max(0, 1 - xGDiff / 20);
      totalSimilarity += xGSimilarity * 0.1;
      totalWeight += 0.1;
    }
    
    if (player1.xAG != null && player2.xAG != null) {
      const xAGDiff = Math.abs(player1.xAG - player2.xAG);
      const xAGSimilarity = Math.max(0, 1 - xAGDiff / 15);
      totalSimilarity += xAGSimilarity * 0.1;
      totalWeight += 0.1;
    }
  }
  
  // Position-specific advanced stats
  if (isDefender) {
    // Defensive stats (30% weight for defenders)
    if (player1.tackles != null && player2.tackles != null) {
      const tackleDiff = Math.abs(player1.tackles - player2.tackles);
      const tackleSimilarity = Math.max(0, 1 - tackleDiff / 60);
      totalSimilarity += tackleSimilarity * 0.15;
      totalWeight += 0.15;
    }
    
    if (player1.interceptions != null && player2.interceptions != null) {
      const intDiff = Math.abs(player1.interceptions - player2.interceptions);
      const intSimilarity = Math.max(0, 1 - intDiff / 40);
      totalSimilarity += intSimilarity * 0.15;
      totalWeight += 0.15;
    }
  } else if (isMidfielder) {
    // Passing stats (30% weight for midfielders)
    if (player1.passAccuracy != null && player2.passAccuracy != null) {
      const passDiff = Math.abs(player1.passAccuracy - player2.passAccuracy);
      const passSimilarity = Math.max(0, 1 - passDiff / 25);
      totalSimilarity += passSimilarity * 0.15;
      totalWeight += 0.15;
    }
    
    if (player1.prgP != null && player2.prgP != null) {
      const prgPDiff = Math.abs(player1.prgP - player2.prgP);
      const prgPSimilarity = Math.max(0, 1 - prgPDiff / 100);
      totalSimilarity += prgPSimilarity * 0.15;
      totalWeight += 0.15;
    }
  } else if (isAttacker) {
    // Shooting stats (30% weight for attackers)
    if (player1.shotsOn90 != null && player2.shotsOn90 != null) {
      const shotsDiff = Math.abs(player1.shotsOn90 - player2.shotsOn90);
      const shotsSimilarity = Math.max(0, 1 - shotsDiff / 3);
      totalSimilarity += shotsSimilarity * 0.15;
      totalWeight += 0.15;
    }
    
    if (player1.shotAccuracy != null && player2.shotAccuracy != null) {
      const shotAccDiff = Math.abs(player1.shotAccuracy - player2.shotAccuracy);
      const shotAccSimilarity = Math.max(0, 1 - shotAccDiff / 40);
      totalSimilarity += shotAccSimilarity * 0.15;
      totalWeight += 0.15;
    }
  }
  
  // Progressive actions (10% weight for all outfield players)
  if (!isGoalkeeper && player1.prgC != null && player2.prgC != null) {
    const prgCDiff = Math.abs(player1.prgC - player2.prgC);
    const prgCSimilarity = Math.max(0, 1 - prgCDiff / 50);
    totalSimilarity += prgCSimilarity * 0.1;
    totalWeight += 0.1;
  }
  
  // Return normalized similarity (0-1)
  return totalWeight > 0 ? Math.min(1, totalSimilarity / totalWeight) : 0;
}

export function findSimilarPlayers(targetPlayer: Player, count: number = 5, playerList: Player[] = players): Array<Player & { similarity: number }> {
  return playerList
    .filter(player => player.id !== targetPlayer.id)
    .map(player => ({
      ...player,
      similarity: calculateSimilarity(targetPlayer, player)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, count);
}