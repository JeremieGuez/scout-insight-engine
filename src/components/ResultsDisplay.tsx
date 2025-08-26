import React, { useState, useEffect, useMemo } from 'react';
import { Player, rankSimilarPlayers } from '@/data/players';
import { usePlayerData } from '@/hooks/usePlayerData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getPlayerImageSrc, createImageErrorHandler } from '@/lib/images';
import { Target, ChevronDown } from 'lucide-react';

interface ResultsDisplayProps {
  selectedPlayer: Player;
  onPlayerSelect: (player: Player) => void;
}

export const ResultsDisplay = ({ selectedPlayer, onPlayerSelect }: ResultsDisplayProps) => {
  const { players } = usePlayerData();
  const [filteredPlayers, setFilteredPlayers] = useState<Array<Player & { similarity: number }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('similarity');
  const [positionFilter, setPositionFilter] = useState('all');
  const [marketValueFilter, setMarketValueFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(selectedPlayer.name);

  const itemsPerPage = 8;

  const similarPlayers = useMemo(() => {
    console.log('🔍 Calculating similar players for:', selectedPlayer.name);
    const similar = rankSimilarPlayers(selectedPlayer, players).slice(0, 50);
    console.log('✅ Found', similar.length, 'similar players');
    return similar;
  }, [selectedPlayer, players]);

  useEffect(() => {
    let filtered = [...similarPlayers];

    // Apply filters
    if (positionFilter !== 'all') {
      const positions = positionFilter === 'forward' ? ['ST', 'CF', 'LW', 'RW'] :
                      positionFilter === 'midfielder' ? ['CDM', 'CM', 'CAM', 'LM', 'RM'] :
                      positionFilter === 'defender' ? ['CB', 'LB', 'RB'] :
                      positionFilter === 'goalkeeper' ? ['GK'] : [];
      filtered = filtered.filter(p => positions.includes(p.position));
    }

    if (marketValueFilter !== 'all') {
      filtered = filtered.filter(p => {
        const value = p.marketValue || 0;
        switch (marketValueFilter) {
          case '100plus': return value >= 100;
          case '50-100': return value >= 50 && value < 100;
          case '20-50': return value >= 20 && value < 50;
          case '5-20': return value >= 5 && value < 20;
          case 'under5': return value < 5;
          default: return true;
        }
      });
    }

    if (ageFilter !== 'all') {
      filtered = filtered.filter(p => {
        const age = p.age || 0;
        switch (ageFilter) {
          case '18-21': return age >= 18 && age <= 21;
          case '22-25': return age >= 22 && age <= 25;
          case '26-30': return age >= 26 && age <= 30;
          case '30plus': return age > 30;
          default: return true;
        }
      });
    }

    if (leagueFilter !== 'all') {
      filtered = filtered.filter(p => p.league.toLowerCase().includes(leagueFilter.toLowerCase()));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'marketValue': return (b.marketValue || 0) - (a.marketValue || 0);
        case 'age': return (a.age || 0) - (b.age || 0);
        case 'goals': return (b.goals || 0) - (a.goals || 0);
        default: return b.similarity - a.similarity;
      }
    });

    setFilteredPlayers(filtered);
    setCurrentPage(1);
  }, [similarPlayers, positionFilter, marketValueFilter, ageFilter, leagueFilter, sortBy]);

  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  const getPositionColor = (position: string) => {
    if (position === 'GK') return 'bg-amber-500 text-white';
    if (['CB', 'LB', 'RB'].includes(position)) return 'bg-blue-500 text-white';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'bg-emerald-500 text-white';
    return 'bg-rose-500 text-white';
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-light italic text-primary">chameleon</span>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search for a player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full border-2 focus:border-primary"
              />
            </div>
            
            {/* Compare Button */}
            <Button 
              variant={selectedPlayerIds.size > 0 ? "default" : "secondary"}
              className="rounded-full px-6"
            >
              Compare ({selectedPlayerIds.size})
            </Button>
          </div>
        </div>
      </div>

      {/* Header Section with Selected Player */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
              <img
                src={getPlayerImageSrc(selectedPlayer)}
                alt={`${selectedPlayer.name} profile`}
                className="w-full h-full object-cover"
                onError={createImageErrorHandler(selectedPlayer)}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Players similar to {selectedPlayer.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${getPositionColor(selectedPlayer.position)} font-medium`}>
                  {selectedPlayer.position}
                </Badge>
                {selectedPlayer.age && (
                  <span className="text-muted-foreground">{selectedPlayer.age} years old</span>
                )}
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{selectedPlayer.club}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{selectedPlayer.league}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{selectedPlayer.country}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-6 items-center flex-wrap">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Position</label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="forward">Forward</SelectItem>
                  <SelectItem value="midfielder">Midfielder</SelectItem>
                  <SelectItem value="defender">Defender</SelectItem>
                  <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Market Value</label>
              <Select value={marketValueFilter} onValueChange={setMarketValueFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Values</SelectItem>
                  <SelectItem value="100plus">€100M+</SelectItem>
                  <SelectItem value="50-100">€50-100M</SelectItem>
                  <SelectItem value="20-50">€20-50M</SelectItem>
                  <SelectItem value="5-20">€5-20M</SelectItem>
                  <SelectItem value="under5">Under €5M</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Age</label>
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="18-21">18-21</SelectItem>
                  <SelectItem value="22-25">22-25</SelectItem>
                  <SelectItem value="26-30">26-30</SelectItem>
                  <SelectItem value="30plus">30+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">League</label>
              <Select value={leagueFilter} onValueChange={setLeagueFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  <SelectItem value="premier">Premier League</SelectItem>
                  <SelectItem value="liga">La Liga</SelectItem>
                  <SelectItem value="bundesliga">Bundesliga</SelectItem>
                  <SelectItem value="serie">Serie A</SelectItem>
                  <SelectItem value="ligue">Ligue 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            variant="link" 
            className="text-primary mt-3 p-0 h-auto font-medium underline"
          >
            + More filters (Minutes, Contract, Advanced metrics)
          </Button>
        </div>
      </div>

      {/* Results Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {currentPlayers.length} similar players • Page {currentPage} of {totalPages}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="similarity">Sort by Similarity</SelectItem>
              <SelectItem value="marketValue">Sort by Market Value</SelectItem>
              <SelectItem value="age">Sort by Age</SelectItem>
              <SelectItem value="goals">Sort by Goals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content - Player Cards Grid */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {currentPlayers.map((player, index) => (
            <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border hover:border-primary/30 bg-card">
              <CardContent className="p-6">
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-15 h-15 rounded-full overflow-hidden border border-border/50">
                    <img
                      src={getPlayerImageSrc(player)}
                      alt={`${player.name} profile`}
                      className="w-full h-full object-cover"
                      onError={createImageErrorHandler(player)}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => onPlayerSelect(player)}
                      className="text-left hover:text-primary transition-colors"
                    >
                      <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                        {player.name}
                      </h3>
                    </button>
                    <p className="text-sm text-muted-foreground">
                      {player.position} • {player.age} • {player.club} • {player.league}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-2 rounded-lg font-bold text-lg shadow-lg">
                      {Math.round(player.similarity * 100)}%
                    </div>
                  </div>
                </div>

                {/* Market Value Highlight */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {player.marketValue ? `€${player.marketValue}M` : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Market Value
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-card border border-border rounded-lg">
                    <div className="font-bold text-foreground text-lg">
                      {player.minutes?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Minutes</div>
                  </div>
                  <div className="text-center p-3 bg-card border border-border rounded-lg">
                    <div className="font-bold text-foreground text-lg">
                      {player.nineties?.toFixed(0) || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Matches</div>
                  </div>
                  <div className="text-center p-3 bg-card border border-border rounded-lg">
                    <div className="font-bold text-foreground text-lg">
                      {player.goals || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Goals</div>
                  </div>
                  <div className="text-center p-3 bg-card border border-border rounded-lg">
                    <div className="font-bold text-foreground text-lg">
                      {player.assists || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Assists</div>
                  </div>
                  <div className="text-center p-3 bg-card border border-border rounded-lg">
                    <div className="font-bold text-foreground text-lg">
                      {player.xG?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">xG</div>
                  </div>
                  <div className="text-center p-3 bg-card border border-border rounded-lg">
                    <div className="font-bold text-foreground text-lg">
                      {player.passAccuracy ? `${player.passAccuracy}%` : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Passing</div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <Button variant="link" className="text-primary p-0 h-auto font-medium underline">
                    + more stats
                  </Button>
                  <button
                    onClick={() => togglePlayerSelection(player.id)}
                    className={`w-5 h-5 border-2 border-primary rounded cursor-pointer transition-all duration-300 flex items-center justify-center ${
                      selectedPlayerIds.has(player.id) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    {selectedPlayerIds.has(player.id) && (
                      <span className="text-xs font-bold">✓</span>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};