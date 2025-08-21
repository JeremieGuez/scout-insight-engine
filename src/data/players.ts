export interface Player {
  id: string;
  name: string;
  age: number;
  club: string;
  position: string;
  league: string;
  country: string;
  
  // Performance stats
  goals: number;
  assists: number;
  tackles: number;
  interceptions: number;
  passAccuracy: number;
  forwardPasses: number;
  kmCovered: number;
  
  // Style of play stats
  tempo: number; // 1-10 scale
  pressingIntensity: number; // 1-10 scale
  aggressivenessIndex: number; // 1-10 scale
  
  // Media profile
  pressMentions: number;
  sentimentScore: number; // -100 to 100
  socialMediaActivity: number; // 1-10 scale
  followersCount: number;
  
  // Additional scouting data
  marketValue: number; // in millions
  contractExpiry: string;
  height: number; // in cm
  preferredFoot: 'Left' | 'Right' | 'Both';
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
  // Basic similarity calculation
  if (player1.position !== player2.position) return 0;
  
  // League similarity bonus
  const leagueSimilarity = player1.league === player2.league ? 0.2 : 
    (player1.country === player2.country ? 0.1 : 0);
  
  // Age similarity
  const ageDiff = Math.abs(player1.age - player2.age);
  const ageSimilarity = Math.max(0, (10 - ageDiff) / 10) * 0.1;
  
  // Performance similarity (normalized)
  const performanceWeight = 0.4;
  const performanceSimilarity = performanceWeight * (1 - Math.abs(
    (player1.goals + player1.assists) - (player2.goals + player2.assists)
  ) / 50);
  
  // Style similarity
  const styleWeight = 0.3;
  const styleSimilarity = styleWeight * (1 - (
    Math.abs(player1.tempo - player2.tempo) +
    Math.abs(player1.pressingIntensity - player2.pressingIntensity) +
    Math.abs(player1.aggressivenessIndex - player2.aggressivenessIndex)
  ) / 30);
  
  return Math.min(1, leagueSimilarity + ageSimilarity + performanceSimilarity + styleSimilarity);
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