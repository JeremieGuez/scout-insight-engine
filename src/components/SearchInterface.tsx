import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { Player, searchPlayers } from '@/data/players';
import { usePlayerData } from '@/hooks/usePlayerData';
import { cn } from '@/lib/utils';

interface SearchInterfaceProps {
  onPlayerSelect: (player: Player) => void;
  selectedPlayer?: Player;
}

export const SearchInterface = ({ onPlayerSelect, selectedPlayer }: SearchInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { players } = usePlayerData();

  useEffect(() => {
    if (query.length >= 2) {
      const results = searchPlayers(query, players);
      setSuggestions(results);
      setShowSuggestions(true);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, players]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handlePlayerSelect = (player: Player) => {
    setQuery(player.name);
    setShowSuggestions(false);
    onPlayerSelect(player);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handlePlayerSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getPositionColor = (position: string) => {
    if (position === 'GK') return 'bg-yellow-100 text-yellow-800';
    if (['CB', 'LB', 'RB'].includes(position)) return 'bg-blue-100 text-blue-800';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for players by name, club, or position..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          className="pl-10 pr-10 h-12 text-lg border-2 focus:border-primary transition-colors"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto border-2 border-primary/20 bg-white"
        >
          {suggestions.map((player, index) => (
            <div
              key={player.id}
              className={cn(
                "p-3 cursor-pointer border-b border-muted hover:bg-accent/50 transition-colors",
                index === highlightedIndex && "bg-accent",
                index === suggestions.length - 1 && "border-b-0"
              )}
              onClick={() => handlePlayerSelect(player)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{player.name}</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      getPositionColor(player.position)
                    )}>
                      {player.position}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {player.club} • {player.league} • {player.age} years
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">€{player.marketValue}M</div>
                  <div className="text-xs text-muted-foreground">
                    {player.goals}G • {player.assists}A
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {selectedPlayer && (
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-primary">
                Selected: {selectedPlayer.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedPlayer.club} • {selectedPlayer.position} • {selectedPlayer.age} years
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearch}
              className="border-primary/30 hover:bg-primary/10"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};