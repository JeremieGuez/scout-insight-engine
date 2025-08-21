import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerCard } from './PlayerCard';
import { SearchInterface } from './SearchInterface';
import { ResultsFilters } from './ResultsFilters';
import { Player, findSimilarPlayers } from '@/data/players';
import { usePlayerData } from '@/hooks/usePlayerData';
import { Download, Search, Users } from 'lucide-react';

interface ResultsDisplayProps {
  selectedPlayer: Player;
  onPlayerSelect: (player: Player) => void;
}

export const ResultsDisplay = ({ selectedPlayer, onPlayerSelect }: ResultsDisplayProps) => {
  const { players } = usePlayerData();
  const similarPlayers = findSimilarPlayers(selectedPlayer, 10, players);
  const [filteredPlayers, setFilteredPlayers] = useState<(Player & { similarity: number })[]>(similarPlayers);

  // Update filtered players when similar players change
  useEffect(() => {
    setFilteredPlayers(similarPlayers);
  }, [similarPlayers]);

  const exportToCsv = () => {
    const headers = [
      'Name', 'Age', 'Club', 'Position', 'League', 'Similarity %',
      'Goals', 'Assists', 'Pass Accuracy', 'Tempo', 'Pressing', 
      'Market Value (€M)', 'Media Sentiment', 'Followers'
    ];
    
    const csvData = [
      headers,
      ...filteredPlayers.map(player => [
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
      
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Similar to {selectedPlayer.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedPlayer.position} • {selectedPlayer.club} • {selectedPlayer.league}
            </p>
          </div>
        </div>
        
        <Button
          onClick={exportToCsv}
          variant="outline"
          size="sm"
          disabled={filteredPlayers.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export ({filteredPlayers.length})
        </Button>
      </div>

      {/* Filters */}
      <ResultsFilters 
        players={similarPlayers} 
        onFilterChange={setFilteredPlayers}
      />

      {/* Results Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{filteredPlayers.length} of {similarPlayers.length} players</span>
        </div>
        {filteredPlayers.length > 0 && (
          <>
            <span>•</span>
            <span>Best match: {(filteredPlayers[0].similarity * 100).toFixed(0)}%</span>
            <span>•</span>
            <span>{new Set(filteredPlayers.map(p => p.league)).size} leagues</span>
          </>
        )}
      </div>

      {/* Similar Players Grid */}
      <div className="space-y-4">
        {filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPlayers.map((player, index) => (
              <div key={player.id} className="relative">
                <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                  {(player.similarity * 100).toFixed(0)}% match
                </div>
                <PlayerCard player={player} showSimilarity={true} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No players match your filters</p>
              <p className="text-sm">Try adjusting your filter criteria.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};