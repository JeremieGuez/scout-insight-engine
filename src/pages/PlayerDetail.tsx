import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerData } from '@/hooks/usePlayerData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerCard } from '@/components/PlayerCard';
import { findSimilarPlayers } from '@/data/players';
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
  BarChart3
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
      <header className="bg-white border-b border-primary/10 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Scout360</h1>
                <p className="text-xs text-muted-foreground">Fiche Joueur</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Player Header */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{player.name}</CardTitle>
                  <div className="flex items-center gap-4 text-primary-foreground/80">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{player.age} ans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{player.club}</span>
                    </div>
                    <Badge className={`${getPositionColor(player.position)} text-xs`}>
                      {player.position}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">€{player.marketValue}M</div>
                  <div className="text-sm text-primary-foreground/80">Valeur marchande</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{player.league}</div>
                  <div className="text-sm text-primary-foreground/80">Championnat</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{player.height}cm</div>
                  <div className="text-sm text-primary-foreground/80">Taille</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{player.preferredFoot}</div>
                  <div className="text-sm text-primary-foreground/80">Pied fort</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{player.contractExpiry.split('-')[0]}</div>
                  <div className="text-sm text-primary-foreground/80">Fin contrat</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Performances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span>Buts</span>
                  </div>
                  <span className="font-semibold text-primary">{player.goals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span>Passes décisives</span>
                  </div>
                  <span className="font-semibold text-primary">{player.assists}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span>Précision passes</span>
                  </div>
                  <span className="font-semibold text-primary">{player.passAccuracy}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Style de jeu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Style de jeu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Tempo</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-orange-500 rounded-full" 
                        style={{ width: `${(player.tempo / 10) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-primary">{player.tempo}/10</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pressing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-red-500 rounded-full" 
                        style={{ width: `${(player.pressingIntensity / 10) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-primary">{player.pressingIntensity}/10</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Agressivité</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-purple-500 rounded-full" 
                        style={{ width: `${(player.aggressivenessIndex / 10) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-primary">{player.aggressivenessIndex}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profil médiatique */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Profil médiatique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Mentions presse</span>
                  </div>
                  <span className="font-semibold text-primary">{player.pressMentions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${getSentimentColor(player.sentimentScore)}`} />
                    <span>Sentiment</span>
                  </div>
                  <span className={`font-semibold ${getSentimentColor(player.sentimentScore)}`}>
                    {player.sentimentScore > 0 ? '+' : ''}{player.sentimentScore}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Followers</span>
                  </div>
                  <span className="font-semibold text-primary">
                    {player.followersCount > 1000000 
                      ? `${(player.followersCount / 1000000).toFixed(1)}M`
                      : `${Math.floor(player.followersCount / 1000)}K`
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Similar Players */}
          {similarPlayers.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Joueurs similaires
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {similarPlayers.map((similarPlayer, index) => (
                  <div key={similarPlayer.id} className="relative">
                    <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                      {index + 1}
                    </div>
                    <PlayerCard player={similarPlayer} showSimilarity={true} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlayerDetail;