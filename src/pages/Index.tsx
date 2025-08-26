import React, { useState } from 'react';
import { SearchInterface } from '@/components/SearchInterface';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { CSVImport } from '@/components/CSVImport';
import { DataSummary } from '@/components/DataSummary';
import { Player } from '@/data/players';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, TrendingUp, BarChart3 } from 'lucide-react';
import chameleonLogo from '@/assets/chameleon-logo.jpg';
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
              <div className="h-10 w-10 rounded-lg overflow-hidden">
                <img src={chameleonLogo} alt="Chameleon" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Chameleon</h1>
                <p className="text-sm text-muted-foreground">Advanced Football Player Analytics</p>
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
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Adaptez-vous à vos besoins de recrutement
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Chameleon utilise des modèles statistiques avancés pour identifier des joueurs similaires. 
                  Analysez {totalPlayers}+ joueurs professionnels avec précision scientifique.
                </p>
              </div>
              
              {/* Search Interface */}
              <div className="mb-6">
                <SearchInterface onPlayerSelect={handlePlayerSelect} />
              </div>
              
              {/* Data Summary - compact version under search */}
              {lastImportStats && <DataSummary />}
              
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
                    <h3 className="font-semibold text-lg mb-2">Analyse Vectorielle</h3>
                    <p className="text-muted-foreground text-sm">
                      Algorithmes de similarité cosinus sur des features standardisées pour une précision maximale.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-6 hover:shadow-lg transition-shadow border-primary/20">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Modélisation Statistique</h3>
                    <p className="text-muted-foreground text-sm">
                      Normalisation z-score et sélection dynamique de features selon le poste du joueur.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-6 hover:shadow-lg transition-shadow border-primary/20">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Données Adaptatives</h3>
                    <p className="text-muted-foreground text-sm">
                      Import CSV personnalisé avec detection automatique des colonnes et ajustement du modèle.
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
            <img src={chameleonLogo} alt="Chameleon" className="h-6 w-6 rounded" />
            <span className="font-semibold text-primary">Chameleon</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Advanced Football Player Analytics • Statistical Modeling & ML
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;