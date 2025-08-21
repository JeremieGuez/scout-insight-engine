import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/data/players";
import { Trophy, Target, Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SelectedPlayerCardProps {
  player: Player;
}

export const SelectedPlayerCard = ({ player }: SelectedPlayerCardProps) => {
  const navigate = useNavigate();
  
  const getPositionColor = (position: string) => {
    if (position === 'GK') return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    if (['CB', 'LB', 'RB'].includes(position)) return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    return 'bg-rose-500/10 text-rose-700 border-rose-500/20';
  };

  return (
    <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Player Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">
                {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <button
                  onClick={() => navigate(`/player/${player.id}`)}
                  className="text-left hover:text-primary transition-colors"
                >
                  <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                    {player.name}
                  </h2>
                </button>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className={`${getPositionColor(player.position)} font-medium`}>
                    {player.position}
                  </Badge>
                  <span className="text-muted-foreground">{player.age} ans</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">€{player.marketValue}M</div>
                <div className="text-xs text-muted-foreground">Valeur marché</div>
              </div>
            </div>

            {/* Club and League */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{player.club}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{player.league}</span>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{player.goals}</div>
                <div className="text-xs text-muted-foreground">Buts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{player.assists}</div>
                <div className="text-xs text-muted-foreground">Passes D.</div>
              </div>
              {player.nineties && (
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{player.nineties.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">Matchs</div>
                </div>
              )}
              {player.passAccuracy && (
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{player.passAccuracy}%</div>
                  <div className="text-xs text-muted-foreground">Précision</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};