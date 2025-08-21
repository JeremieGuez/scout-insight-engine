import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/data/players';
import { Filter, X } from 'lucide-react';

interface ResultsFiltersProps {
  players: (Player & { similarity: number })[];
  onFilterChange: (filteredPlayers: (Player & { similarity: number })[]) => void;
}

export const ResultsFilters = ({ players, onFilterChange }: ResultsFiltersProps) => {
  const [filters, setFilters] = useState({
    ageRange: [18, 40],
    marketValueRange: [0, 150],
    selectedLeagues: [] as string[],
    selectedPositions: [] as string[],
    minSimilarity: 0,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const leagues = [...new Set(players.map(p => p.league))].sort();
  const positions = [...new Set(players.map(p => p.position))].sort();

  const applyFilters = () => {
    const filtered = players.filter(player => {
      const matchesAge = player.age >= filters.ageRange[0] && player.age <= filters.ageRange[1];
      const matchesValue = player.marketValue >= filters.marketValueRange[0] && player.marketValue <= filters.marketValueRange[1];
      const matchesLeague = filters.selectedLeagues.length === 0 || filters.selectedLeagues.includes(player.league);
      const matchesPosition = filters.selectedPositions.length === 0 || filters.selectedPositions.includes(player.position);
      const matchesSimilarity = (player.similarity * 100) >= filters.minSimilarity;

      return matchesAge && matchesValue && matchesLeague && matchesPosition && matchesSimilarity;
    });

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setFilters({
      ageRange: [18, 40],
      marketValueRange: [0, 150],
      selectedLeagues: [],
      selectedPositions: [],
      minSimilarity: 0,
    });
    onFilterChange(players);
  };

  const toggleLeague = (league: string) => {
    setFilters(prev => ({
      ...prev,
      selectedLeagues: prev.selectedLeagues.includes(league)
        ? prev.selectedLeagues.filter(l => l !== league)
        : [...prev.selectedLeagues, league]
    }));
  };

  const togglePosition = (position: string) => {
    setFilters(prev => ({
      ...prev,
      selectedPositions: prev.selectedPositions.includes(position)
        ? prev.selectedPositions.filter(p => p !== position)
        : [...prev.selectedPositions, position]
    }));
  };

  const hasActiveFilters = filters.selectedLeagues.length > 0 || 
                          filters.selectedPositions.length > 0 || 
                          filters.ageRange[0] !== 18 || 
                          filters.ageRange[1] !== 40 ||
                          filters.marketValueRange[0] !== 0 || 
                          filters.marketValueRange[1] !== 150 ||
                          filters.minSimilarity > 0;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-6">
            {/* Age Range */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Age: {filters.ageRange[0]} - {filters.ageRange[1]} years
              </label>
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}
                max={40}
                min={18}
                step={1}
                className="w-full"
              />
            </div>

            {/* Market Value Range */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Market Value: €{filters.marketValueRange[0]}M - €{filters.marketValueRange[1]}M
              </label>
              <Slider
                value={filters.marketValueRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, marketValueRange: value }))}
                max={150}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* Similarity Threshold */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Minimum Similarity: {filters.minSimilarity}%
              </label>
              <Slider
                value={[filters.minSimilarity]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minSimilarity: value[0] }))}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* Leagues */}
            <div>
              <label className="text-sm font-medium mb-3 block">Leagues</label>
              <div className="flex flex-wrap gap-2">
                {leagues.map(league => (
                  <Badge
                    key={league}
                    variant={filters.selectedLeagues.includes(league) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleLeague(league)}
                  >
                    {league}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Positions */}
            <div>
              <label className="text-sm font-medium mb-3 block">Positions</label>
              <div className="flex flex-wrap gap-2">
                {positions.map(position => (
                  <Badge
                    key={position}
                    variant={filters.selectedPositions.includes(position) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => togglePosition(position)}
                  >
                    {position}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button onClick={applyFilters} size="sm" className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};