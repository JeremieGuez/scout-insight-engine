import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerData } from '@/hooks/usePlayerData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerCard } from '@/components/PlayerCard';
import { findSimilarPlayers } from '@/data/players';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Target, 
  Trophy, 
  Zap, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Calendar,
  MapPin,
  User,
  BarChart3,
  Star,
  Heart,
  Shield,
  Activity
} from 'lucide-react';

const PlayerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { players } = usePlayerData();
  
  const player = players.find(p => p.id === id);
  
  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Joueur non trouvé</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const similarPlayers = findSimilarPlayers(player, 3, players);

  const getPositionColor = (position: string) => {
    if (position === 'GK') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (['CB', 'LB', 'RB'].includes(position)) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getSentimentColor = (score: number) => {
    if (score >= 20) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-primary/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Scout360</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Player Profile Header */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white">
            <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
              <div className="flex items-start gap-6">
                {/* Player Avatar */}
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0ea5e9&color=fff&size=256&bold=true`} 
                      alt={player.name} 
                    />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <Badge className={`${getPositionColor(player.position)} text-xs font-bold shadow-md border-2 border-white`}>
                      {player.position}
                    </Badge>
                  </div>
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">{player.name}</h1>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{player.age} ans</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          <span>{player.height}cm</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>{player.preferredFoot}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">€{player.marketValue}M</div>
                      <div className="text-sm text-muted-foreground">Valeur marchande</div>
                    </div>
                  </div>

                  {/* Club Info */}
                  <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{player.club}</div>
                      <div className="text-sm text-muted-foreground">{player.league} • {player.country}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-sm text-muted-foreground">Contrat jusqu'en</div>
                      <div className="font-semibold text-foreground">{player.contractExpiry.split('-')[0]}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Performance */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Performance</h3>
                    <p className="text-xs text-muted-foreground">Saison en cours</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Buts</span>
                    <span className="font-bold text-lg text-primary">{player.goals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Passes D.</span>
                    <span className="font-bold text-lg text-primary">{player.assists}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Précision</span>
                    <span className="font-bold text-primary">{player.passAccuracy}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Style de jeu */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Style de jeu</h3>
                    <p className="text-xs text-muted-foreground">Caractéristiques</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tempo</span>
                      <span className="font-semibold">{player.tempo}/10</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full">
                      <div 
                        className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" 
                        style={{ width: `${(player.tempo / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pressing</span>
                      <span className="font-semibold">{player.pressingIntensity}/10</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full">
                      <div 
                        className="h-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all" 
                        style={{ width: `${(player.pressingIntensity / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Défense */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Défense</h3>
                    <p className="text-xs text-muted-foreground">Actions défensives</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tacles</span>
                    <span className="font-bold text-lg text-primary">{player.tackles}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Interceptions</span>
                    <span className="font-bold text-lg text-primary">{player.interceptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Km parcourus</span>
                    <span className="font-bold text-primary">{player.kmCovered}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Médiatique */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Médiatique</h3>
                    <p className="text-xs text-muted-foreground">Popularité</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mentions</span>
                    <span className="font-bold text-lg text-primary">{player.pressMentions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sentiment</span>
                    <span className={`font-bold ${getSentimentColor(player.sentimentScore)}`}>
                      {player.sentimentScore > 0 ? '+' : ''}{player.sentimentScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Followers</span>
                    <span className="font-bold text-primary">
                      {player.followersCount > 1000000 
                        ? `${(player.followersCount / 1000000).toFixed(1)}M`
                        : `${Math.floor(player.followersCount / 1000)}K`
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Similar Players */}
          {similarPlayers.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  Joueurs similaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {similarPlayers.map((similarPlayer, index) => (
                    <div key={similarPlayer.id} className="relative group">
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold z-10 shadow-lg">
                        {index + 1}
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-semibold z-10 shadow-lg">
                        {(similarPlayer.similarity * 100).toFixed(0)}%
                      </div>
                      <div className="transform transition-transform group-hover:scale-105">
                        <PlayerCard player={similarPlayer} showSimilarity={false} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlayerDetail;