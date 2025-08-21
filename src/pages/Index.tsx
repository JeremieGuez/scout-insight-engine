import React, { useState } from 'react';
import { SearchInterface } from '@/components/SearchInterface';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { CSVImport } from '@/components/CSVImport';
import { Player } from '@/data/players';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { usePlayerData } from '@/hooks/usePlayerData';

const Index = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
  const { totalPlayers } = usePlayerData();

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Header */}
      <header className="bg-white border-b border-primary/10 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Scout360</h1>
                <p className="text-sm text-muted-foreground">Professional Football Scouting Platform</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{totalPlayers}+ Players</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>9 Leagues</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!selectedPlayer ? (
          /* Search Landing */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Find Your Next
                <span className="text-primary"> Star Player</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover similar players using our advanced AI recommendation engine. 
                Search through {totalPlayers}+ professional players across Europe's top leagues.
              </p>
            </div>

            {/* CSV Import */}
            {totalPlayers === 0 && (
              <div className="mb-12">
                <CSVImport />
              </div>
            )}

            {/* Search Interface */}
            {totalPlayers > 0 && (
              <div className="mb-12">
                <SearchInterface onPlayerSelect={handlePlayerSelect} selectedPlayer={selectedPlayer} />
              </div>
            )}

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-blue-900">Smart Matching</h3>
                  <p className="text-blue-700 text-sm">
                    AI-powered similarity engine finds players with matching playing styles and performance metrics
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-green-900">Complete Analytics</h3>
                  <p className="text-green-700 text-sm">
                    Performance stats, playing style metrics, and comprehensive media profile analysis
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-purple-900">Export Ready</h3>
                  <p className="text-purple-700 text-sm">
                    Download scouting reports in CSV format for team analysis and presentation
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Coverage Stats */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold text-center mb-6 text-primary">League Coverage</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">🇮🇹</div>
                  <div className="font-semibold text-foreground">Italy</div>
                  <div className="text-sm text-muted-foreground">Serie A, B, C</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">🇫🇷</div>
                  <div className="font-semibold text-foreground">France</div>
                  <div className="text-sm text-muted-foreground">Ligue 1, 2, 3</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
                  <div className="font-semibold text-foreground">England</div>
                  <div className="text-sm text-muted-foreground">Premier League, Championship, League One</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results Display */
          <ResultsDisplay selectedPlayer={selectedPlayer} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-primary/10 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Scout360</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Professional Football Scouting Platform • AI-Powered Player Analysis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
