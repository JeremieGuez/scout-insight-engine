import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/data/players";
import { Trophy, Target, Zap, TrendingUp, Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlayerCardProps {
  player: Player & { similarity?: number };
  showSimilarity?: boolean;
}

export const PlayerCard = ({ player, showSimilarity = false }: PlayerCardProps) => {
  const navigate = useNavigate();
  
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
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-accent/20 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 
                className="font-bold text-lg text-foreground group-hover:text-primary transition-colors hover:underline"
                onClick={() => navigate(`/player/${player.id}`)}
              >
                {player.name}
              </h3>
              {showSimilarity && player.similarity && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {(player.similarity * 100).toFixed(0)}% match
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{player.club}</span>
              <span>•</span>
              <Badge className={getPositionColor(player.position)} variant="outline">
                {player.position}
              </Badge>
              <span>•</span>
              <span>{player.age} years</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {player.league} • {player.country}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-primary">
              €{player.marketValue}M
            </div>
            <div className="text-xs text-muted-foreground">
              {player.height}cm • {player.preferredFoot}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-muted-foreground">Goals:</span>
              <span className="font-semibold text-primary">{player.goals}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-muted-foreground">Assists:</span>
              <span className="font-semibold text-primary">{player.assists}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Pass Acc:</span>
              <span className="font-semibold text-primary">{player.passAccuracy}%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
              <span className="text-muted-foreground">Tempo:</span>
              <span className="font-semibold text-primary">{player.tempo}/10</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
              <span className="text-muted-foreground">Pressing:</span>
              <span className="font-semibold text-primary">{player.pressingIntensity}/10</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 bg-purple-500 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
              <span className="text-muted-foreground">Aggress:</span>
              <span className="font-semibold text-primary">{player.aggressivenessIndex}/10</span>
            </div>
          </div>
        </div>

        {/* Media Profile */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Media:</span>
              <span className="font-medium">{player.pressMentions} mentions</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${getSentimentColor(player.sentimentScore)}`} />
              <span className={`font-medium ${getSentimentColor(player.sentimentScore)}`}>
                {player.sentimentScore > 0 ? '+' : ''}{player.sentimentScore}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Followers:</span>
              <span className="font-medium">
                {player.followersCount > 1000000 
                  ? `${(player.followersCount / 1000000).toFixed(1)}M`
                  : `${Math.floor(player.followersCount / 1000)}K`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Contract:</span>
              <span className="font-medium text-primary">{player.contractExpiry.split('-')[0]}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};