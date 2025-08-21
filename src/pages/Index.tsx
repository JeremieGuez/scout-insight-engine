import React, { useState } from 'react';
import { SearchInterface } from '@/components/SearchInterface';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { CSVImport } from '@/components/CSVImport';
import { DataSummary } from '@/components/DataSummary';
import { Player } from '@/data/players';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { usePlayerData } from '@/hooks/usePlayerData';

const Index = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
  const { totalPlayers, lastImportStats } = usePlayerData();

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
                <span>{lastImportStats?.leagues.length || 9} Leagues</span>
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
        {selectedPlayer ? (
          <ResultsDisplay selectedPlayer={selectedPlayer} onPlayerSelect={handlePlayerSelect} />
        ) : (
          <div className="space-y-8">
            {/* Data Summary - only show if we have imported data */}
            {lastImportStats && <DataSummary />}
            
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Find Your Next Star Player
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Discover similar players using our advanced AI recommendation engine. 
                  Search through {totalPlayers}+ professional players across Europe's top leagues.
                </p>
              </div>
              
              {/* Search Interface */}
              <div className="mb-12">
                <SearchInterface onPlayerSelect={handlePlayerSelect} />
              </div>
              
              {/* CSV Import - only show if no data imported yet */}
              {!lastImportStats && (
                <div className="mb-12">
                  <CSVImport />
                </div>
              )}
              
              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="text-center p-6 hover:shadow-lg transition-shadow border-primary/20">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
                    <p className="text-muted-foreground text-sm">
                      Our AI analyzes 25+ attributes to find players with similar playing styles and characteristics.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-6 hover:shadow-lg transition-shadow border-primary/20">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Advanced Analytics</h3>
                    <p className="text-muted-foreground text-sm">
                      Detailed statistical analysis including performance metrics, style of play, and market valuation.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-6 hover:shadow-lg transition-shadow border-primary/20">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Export Ready</h3>
                    <p className="text-muted-foreground text-sm">
                      Export search results to CSV for further analysis or sharing with your scouting team.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* League Coverage */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-6">League Coverage</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">🇪🇸</div>
                    <div className="font-semibold text-foreground">Spain</div>
                    <div className="text-sm text-muted-foreground">La Liga, Segunda División</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">🇩🇪</div>
                    <div className="font-semibold text-foreground">Germany</div>
                    <div className="text-sm text-muted-foreground">Bundesliga, 2. Bundesliga</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">🇮🇹</div>
                    <div className="font-semibold text-foreground">Italy</div>
                    <div className="text-sm text-muted-foreground">Serie A, Serie B</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">🇫🇷</div>
                    <div className="font-semibold text-foreground">France</div>
                    <div className="text-sm text-muted-foreground">Ligue 1, Ligue 2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
                    <div className="font-semibold text-foreground">England</div>
                    <div className="text-sm text-muted-foreground">Premier League, Championship, League One</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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