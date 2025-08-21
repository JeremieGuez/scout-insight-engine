import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/data/players';
import { Filter, MoreHorizontal } from 'lucide-react';

interface QuickFiltersProps {
  players: (Player & { similarity: number })[];
  onFilterChange: (filteredPlayers: (Player & { similarity: number })[]) => void;
  onExpandFilters: () => void;
}

export const QuickFilters = ({ players, onFilterChange, onExpandFilters }: QuickFiltersProps) => {
  const [filters, setFilters] = useState({
    minSimilarity: 0,
    ageRange: [18, 40],
    marketValueRange: [0, 150],
    selectedLeague: 'all',
  });

  const leagues = ['all', ...new Set(players.map(p => p.league))].sort();

  const applyFilters = () => {
    let filtered = players.filter(player => {
      const matchesAge = player.age >= filters.ageRange[0] && player.age <= filters.ageRange[1];
      const matchesValue = player.marketValue >= filters.marketValueRange[0] && player.marketValue <= filters.marketValueRange[1];
      const matchesLeague = filters.selectedLeague === 'all' || player.league === filters.selectedLeague;
      const matchesSimilarity = (player.similarity * 100) >= filters.minSimilarity;

      return matchesAge && matchesValue && matchesLeague && matchesSimilarity;
    });

    // Re-sort by similarity
    filtered = filtered.sort((a, b) => b.similarity - a.similarity);
    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setFilters({
      minSimilarity: 0,
      ageRange: [18, 40],
      marketValueRange: [0, 150],
      selectedLeague: 'all',
    });
    onFilterChange(players);
  };

  const hasActiveFilters = filters.minSimilarity > 0 || 
                          filters.ageRange[0] !== 18 || 
                          filters.ageRange[1] !== 40 ||
                          filters.marketValueRange[0] !== 0 || 
                          filters.marketValueRange[1] !== 150 ||
                          filters.selectedLeague !== 'all';

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-medium">Filtres rapides</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Actifs
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpandFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4 mr-1" />
              Plus de filtres
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Effacer
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Similarity Cards */}
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">Similarité minimum</label>
            <div className="grid grid-cols-3 gap-1">
              {[0, 50, 80].map((value) => (
                <Button
                  key={value}
                  variant={filters.minSimilarity === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, minSimilarity: value }))}
                  className="text-xs"
                >
                  {value === 0 ? 'Tous' : `${value}%+`}
                </Button>
              ))}
            </div>
          </div>

          {/* Age Cards */}
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">Âge</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'Tous', range: [18, 40] },
                { label: '18-25', range: [18, 25] },
                { label: '26-35', range: [26, 35] }
              ].map((option) => (
                <Button
                  key={option.label}
                  variant={filters.ageRange[0] === option.range[0] && filters.ageRange[1] === option.range[1] ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, ageRange: option.range }))}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Market Value Cards */}
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">Valeur marchande</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'Toutes', range: [0, 150] },
                { label: '0-20M', range: [0, 20] },
                { label: '20M+', range: [20, 150] }
              ].map((option) => (
                <Button
                  key={option.label}
                  variant={filters.marketValueRange[0] === option.range[0] && filters.marketValueRange[1] === option.range[1] ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, marketValueRange: option.range }))}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* League */}
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">Ligue</label>
            <Select
              value={filters.selectedLeague}
              onValueChange={(value) => setFilters(prev => ({ ...prev, selectedLeague: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une ligue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les ligues</SelectItem>
                {leagues.slice(1).map(league => (
                  <SelectItem key={league} value={league}>{league}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={applyFilters} size="sm" className="flex-1">
            Appliquer les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};