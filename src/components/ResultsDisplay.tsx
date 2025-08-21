import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerCard } from './PlayerCard';
import { SearchInterface } from './SearchInterface';
import { Player, findSimilarPlayers } from '@/data/players';
import { usePlayerData } from '@/hooks/usePlayerData';
import { Download, Target, Users, TrendingUp } from 'lucide-react';

interface ResultsDisplayProps {
  selectedPlayer: Player;
  onPlayerSelect: (player: Player) => void;
}

export const ResultsDisplay = ({ selectedPlayer, onPlayerSelect }: ResultsDisplayProps) => {
  const { players } = usePlayerData();
  const similarPlayers = findSimilarPlayers(selectedPlayer, 5, players);

  const exportToCsv = () => {
    const headers = [
      'Name', 'Age', 'Club', 'Position', 'League', 'Similarity %',
      'Goals', 'Assists', 'Pass Accuracy', 'Tempo', 'Pressing', 
      'Market Value (€M)', 'Media Sentiment', 'Followers'
    ];
    
    const csvData = [
      headers,
      ...similarPlayers.map(player => [
        player.name,
        player.age.toString(),
        player.club,
        player.position,
        player.league,
        `${(player.similarity * 100).toFixed(1)}%`,
        player.goals.toString(),
        player.assists.toString(),
        `${player.passAccuracy}%`,
        `${player.tempo}/10`,
        `${player.pressingIntensity}/10`,
        player.marketValue.toString(),
        player.sentimentScore.toString(),
        player.followersCount.toString()
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `scout360_similar_to_${selectedPlayer.name.replace(/\s+/g, '_').toLowerCase()}.csv`;
    link.click();
  };

  const getOverallScore = (player: Player & { similarity: number }) => {
    const performanceScore = (player.goals + player.assists) / 2;
    const styleScore = (player.tempo + player.pressingIntensity + player.aggressivenessIndex) / 3;
    const mediaScore = Math.max(0, player.sentimentScore) / 10;
    
    return ((performanceScore + styleScore + mediaScore) / 3 * player.similarity * 10).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="mb-6">
        <SearchInterface onPlayerSelect={onPlayerSelect} selectedPlayer={selectedPlayer} />
      </div>
      
      {/* Search Result Header */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6" />
              <span>Search Results for {selectedPlayer.name}</span>
            </div>
            <Button
              onClick={exportToCsv}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Position: {selectedPlayer.position}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>League: {selectedPlayer.league}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Age: {selectedPlayer.age} years</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{similarPlayers.length}</div>
              <div className="text-sm text-blue-600">Similar Players Found</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {similarPlayers.length > 0 ? (similarPlayers[0].similarity * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-green-600">Best Match</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {new Set(similarPlayers.map(p => p.league)).size}
              </div>
              <div className="text-sm text-purple-600">Leagues Covered</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">
                €{similarPlayers.length > 0 ? 
                  (similarPlayers.reduce((sum, p) => sum + p.marketValue, 0) / similarPlayers.length).toFixed(1)
                  : '0'}M
              </div>
              <div className="text-sm text-orange-600">Avg. Market Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Similar Players Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Most Similar Players
        </h2>
        
        {similarPlayers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {similarPlayers.map((player, index) => (
              <div key={player.id} className="relative">
                <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                  Score: {getOverallScore(player)}
                </div>
                <PlayerCard player={player} showSimilarity={true} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No similar players found</p>
              <p className="text-sm">Try searching for a different player.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};