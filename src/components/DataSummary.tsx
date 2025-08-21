import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlayerData } from '@/hooks/usePlayerData';
import { Database, Users, Globe, Download, RefreshCw } from 'lucide-react';
import { useRef } from 'react';

export const DataSummary = () => {
  const { players, lastImportStats, loadFromCSV, isLoading } = usePlayerData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReimport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadFromCSV(file);
    }
  };

  const exportInventory = () => {
    if (players.length === 0) return;

    const csvContent = [
      'Name,Position,Age,Club,League,Country,Market Value,Goals,Assists,Minutes',
      ...players.map(p => 
        `"${p.name}","${p.position}",${p.age},"${p.club}","${p.league}","${p.country}",${p.marketValue},${p.goals},${p.assists},${p.kmCovered}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scout360-players-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!lastImportStats) return null;

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-background to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Data Summary
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReimport}
              disabled={isLoading}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Reimport
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportInventory}
              disabled={players.length === 0}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{lastImportStats.uniquePlayers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Unique Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{lastImportStats.leagues.length}</div>
            <div className="text-xs text-muted-foreground">Leagues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{lastImportStats.totalRows.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">CSV Rows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{lastImportStats.skippedRows}</div>
            <div className="text-xs text-muted-foreground">Skipped</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Leagues:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {lastImportStats.leagues.slice(0, 12).map((league) => (
              <Badge key={league} variant="outline" className="text-xs">
                {league}
              </Badge>
            ))}
            {lastImportStats.leagues.length > 12 && (
              <Badge variant="outline" className="text-xs">
                +{lastImportStats.leagues.length - 12} more
              </Badge>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};