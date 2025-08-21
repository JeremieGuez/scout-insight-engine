import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CompactPlayerCard } from './CompactPlayerCard';
import { SelectedPlayerCard } from './SelectedPlayerCard';
import { SearchInterface } from './SearchInterface';
import { QuickFilters } from './QuickFilters';
import { ResultsFilters } from './ResultsFilters';
import { Player, findSimilarPlayers, rankSimilarPlayers } from '@/data/players';
import { usePlayerData } from '@/hooks/usePlayerData';
import { Download, Search, Users } from 'lucide-react';

interface ResultsDisplayProps {
  selectedPlayer: Player;
  onPlayerSelect: (player: Player) => void;
}

export const ResultsDisplay = ({ selectedPlayer, onPlayerSelect }: ResultsDisplayProps) => {
  const { players } = usePlayerData();
  const similarPlayers = useMemo(() => 
    rankSimilarPlayers(selectedPlayer, players), 
    [selectedPlayer, players]
  );
  const [filteredPlayers, setFilteredPlayers] = useState<(Player & { similarity: number })[]>(similarPlayers);
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Update filtered players when similar players change
  useEffect(() => {
    setFilteredPlayers(similarPlayers);
    setCurrentPage(1);
  }, [similarPlayers]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

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

      {/* Selected Player Card */}
      <SelectedPlayerCard player={selectedPlayer} />
      
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Joueurs similaires
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredPlayers.length} joueurs trouvés • Page {currentPage} sur {totalPages}
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

      {/* Quick Filters */}
      <QuickFilters 
        players={similarPlayers} 
        onFilterChange={(filtered) => {
          setFilteredPlayers(filtered);
          setCurrentPage(1);
        }}
        onExpandFilters={() => setShowExpandedFilters(!showExpandedFilters)}
      />

      {/* Expanded Filters */}
      {showExpandedFilters && (
        <ResultsFilters 
          players={similarPlayers} 
          onFilterChange={(filtered) => {
            setFilteredPlayers(filtered);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Results Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{filteredPlayers.length} de {similarPlayers.length} joueurs</span>
        </div>
        {filteredPlayers.length > 0 && (
          <>
            <span>•</span>
            <span>Meilleur match: {(filteredPlayers[0].similarity * 100).toFixed(0)}%</span>
            <span>•</span>
            <span>{new Set(filteredPlayers.map(p => p.league)).size} ligues</span>
          </>
        )}
      </div>

      {/* Similar Players Grid */}
      <div className="space-y-4">
        {currentPlayers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentPlayers.map((player, index) => (
                <CompactPlayerCard 
                  key={player.id} 
                  player={player} 
                  rank={startIndex + index + 1}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink 
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun joueur ne correspond aux filtres</p>
              <p className="text-sm">Essayez d'ajuster vos critères de filtrage.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};