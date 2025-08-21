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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card via-card to-card/95">
      <CardContent className="p-6">
        {/* Header with name and position */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <button
              onClick={() => navigate(`/player/${player.id}`)}
              className="text-left hover:text-primary transition-colors"
            >
              <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors truncate">
                {player.name}
              </h3>
            </button>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${getPositionColor(player.position)} text-xs font-medium`}>
                {player.position}
              </Badge>
              {player.age && (
                <span className="text-sm text-muted-foreground">{player.age} ans</span>
              )}
            </div>
          </div>
          {showSimilarity && player.similarity && (
            <div className="text-right">
              <div className="text-sm font-semibold text-primary">
                {Math.round(player.similarity * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Match</div>
            </div>
          )}
        </div>

        {/* Club and League */}
        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{player.club}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {player.league} • {player.country}
            </span>
          </div>
        </div>

        {/* Performance Stats - Only CSV data */}
        <div className="space-y-3">
          <div className="border-t pt-3">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Performance</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {player.goals ?? 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Buts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {player.assists ?? 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Passes D.</div>
              </div>
              {player.minutes && (
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {player.minutes.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
              )}
              {player.nineties && (
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {player.nineties.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Matchs (90')</div>
                </div>
              )}
            </div>
          </div>

          {/* Expected Stats */}
          {(player.xG || player.xAG) && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Expected Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                {player.xG && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {player.xG.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">xG</div>
                  </div>
                )}
                {player.xAG && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {player.xAG.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">xAG</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progressive Stats */}
          {(player.prgC || player.prgP || player.prgR) && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Actions Progressives</h4>
              <div className="grid grid-cols-3 gap-2">
                {player.prgC && (
                  <div className="text-center">
                    <div className="text-sm font-bold text-foreground">{player.prgC}</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </div>
                )}
                {player.prgP && (
                  <div className="text-center">
                    <div className="text-sm font-bold text-foreground">{player.prgP}</div>
                    <div className="text-xs text-muted-foreground">Passes</div>
                  </div>
                )}
                {player.prgR && (
                  <div className="text-center">
                    <div className="text-sm font-bold text-foreground">{player.prgR}</div>
                    <div className="text-xs text-muted-foreground">Réceptions</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Defensive Stats for defenders */}
          {(['CB', 'LB', 'RB', 'WB'].includes(player.position) && (player.tackles || player.interceptions)) && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Défense</h4>
              <div className="grid grid-cols-2 gap-3">
                {player.tackles && (
                  <div className="text-center">
                    <div className="text-sm font-bold text-foreground">{player.tackles}</div>
                    <div className="text-xs text-muted-foreground">Tacles</div>
                  </div>
                )}
                {player.interceptions && (
                  <div className="text-center">
                    <div className="text-sm font-bold text-foreground">{player.interceptions}</div>
                    <div className="text-xs text-muted-foreground">Interceptions</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};