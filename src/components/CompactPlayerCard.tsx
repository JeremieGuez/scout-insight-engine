import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/data/players";
import { Trophy, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPlayerImageSrc, createImageErrorHandler } from "@/lib/images";

interface CompactPlayerCardProps {
  player: Player & { similarity?: number };
  rank: number;
}

export const CompactPlayerCard = ({ player, rank }: CompactPlayerCardProps) => {
  const navigate = useNavigate();
  
  const getPositionColor = (position: string) => {
    if (position === 'GK') return 'bg-amber-500 text-white';
    if (['CB', 'LB', 'RB'].includes(position)) return 'bg-blue-500 text-white';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'bg-emerald-500 text-white';
    return 'bg-rose-500 text-white';
  };

  const getTeamLogo = (club: string) => {
    // Simplified team logo based on club name
    return club.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  const matchPercentage = player.similarity ? Math.round(player.similarity * 100) : 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/30">
      <CardContent className="p-4">
        {/* Header with rank and match */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
              {rank}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
              matchPercentage >= 80 ? 'bg-emerald-500/20 text-emerald-700' :
              matchPercentage >= 60 ? 'bg-amber-500/20 text-amber-700' :
              'bg-slate-500/20 text-slate-700'
            }`}>
              {matchPercentage}% match
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-primary">€{player.marketValue}M</div>
          </div>
        </div>

        {/* Player Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-border/50 flex-shrink-0">
            <img
              src={getPlayerImageSrc(player)}
              alt={`${player.name} profile`}
              className="w-full h-full object-cover"
              onError={createImageErrorHandler(player)}
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => navigate(`/player/${player.id}`)}
              className="text-left hover:text-primary transition-colors w-full"
            >
              <h3 className="font-bold text-foreground hover:text-primary transition-colors truncate mb-1">
                {player.name}
              </h3>
            </button>
            <div className="flex items-center gap-2">
              <Badge className={`${getPositionColor(player.position)} text-xs`}>
                {player.position}
              </Badge>
              <span className="text-xs text-muted-foreground">{player.age} ans</span>
            </div>
          </div>
        </div>

        {/* Club Info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {getTeamLogo(player.club)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">{player.club}</div>
            <div className="text-xs text-muted-foreground">{player.league}</div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-bold text-foreground">{player.goals}</div>
            <div className="text-xs text-muted-foreground">Buts</div>
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{player.assists}</div>
            <div className="text-xs text-muted-foreground">Passes D.</div>
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              {player.nineties ? player.nineties.toFixed(0) : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Matchs</div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-center">
          {player.passAccuracy && (
            <div>
              <div className="text-xs font-medium text-foreground">{player.passAccuracy}%</div>
              <div className="text-xs text-muted-foreground">Précision</div>
            </div>
          )}
          {player.tempo && (
            <div>
              <div className="text-xs font-medium text-foreground">{player.tempo}/10</div>
              <div className="text-xs text-muted-foreground">Tempo</div>
            </div>
          )}
        </div>

        {/* Position-specific stats - Line 1 */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
          {(['GK'].includes(player.position)) ? (
            <>
              <div>
                <div className="text-xs font-medium text-foreground">{player.saves || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Arrêts</div>
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{player.cleanSheets || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Clean Sheets</div>
              </div>
            </>
          ) : (['CB', 'LB', 'RB'].includes(player.position)) ? (
            <>
              <div>
                <div className="text-xs font-medium text-foreground">{player.tackles || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Tacles</div>
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{player.interceptions || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Intercept.</div>
              </div>
            </>
          ) : (['CDM', 'CM'].includes(player.position)) ? (
            <>
              <div>
                <div className="text-xs font-medium text-foreground">{player.blocks || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Blocs</div>
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{player.passCompleted || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Passes</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-xs font-medium text-foreground">{player.shotsOnTarget || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Tirs cadrés</div>
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{player.xG?.toFixed(1) || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">xG</div>
              </div>
            </>
          )}
        </div>

        {/* Position-specific stats - Line 2 */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
          {(['GK'].includes(player.position)) ? (
            <>
              <div>
                <div className="text-xs font-medium text-foreground">{player.savePercentage?.toFixed(0) || 'N/A'}%</div>
                <div className="text-xs text-muted-foreground">% Arrêts</div>
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{player.pressingIntensity}/10</div>
                <div className="text-xs text-muted-foreground">Jeu pied</div>
              </div>
            </>
          ) : (['CB', 'LB', 'RB'].includes(player.position)) ? (
            <>
              <div>
                <div className="text-xs font-medium text-foreground">{player.clearances || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Dégagements</div>
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{player.pressingIntensity}/10</div>
                <div className="text-xs text-muted-foreground">Pressing</div>
              </div>
            </>
          ) : (['CDM', 'CM'].includes(player.position)) ? (
            <>
              <div>
                <div className="text-xs font-medium text-foreground">{player.prgP || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Passes prog.</div>
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{player.prgC || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Courses prog.</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-xs font-medium text-foreground">{player.xAG?.toFixed(1) || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">xA</div>
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{player.prgC || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Courses prog.</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};