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
    <Card className="mb-6 border-primary/10 bg-card">
      <CardHeader className="pb-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Database className="h-4 w-4 text-primary" />
            Imported Data
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
      <CardContent className="pt-0 px-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              <span className="font-medium">{lastImportStats.uniquePlayers.toLocaleString()}</span>
              <span className="text-muted-foreground">players</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-secondary" />
              <span className="font-medium">{lastImportStats.leagues.length}</span>
              <span className="text-muted-foreground">leagues</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 max-w-md">
            {lastImportStats.leagues.slice(0, 6).map((league) => (
              <Badge key={league} variant="outline" className="text-xs py-0 px-1">
                {league}
              </Badge>
            ))}
            {lastImportStats.leagues.length > 6 && (
              <Badge variant="outline" className="text-xs py-0 px-1">
                +{lastImportStats.leagues.length - 6}
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