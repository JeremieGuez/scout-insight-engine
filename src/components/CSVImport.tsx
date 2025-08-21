import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { usePlayerData } from '@/hooks/usePlayerData';
import { useToast } from '@/hooks/use-toast';

export function CSVImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadFromCSV, isLoading, error, totalPlayers } = usePlayerData();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📁 File selected:', file?.name, file?.size);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      console.error('❌ Invalid file type:', file.name);
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🚀 Starting CSV load...');
      await loadFromCSV(file);
      console.log('✅ CSV load completed, total players:', totalPlayers);
      toast({
        title: "CSV imported successfully",
        description: `Loaded ${totalPlayers} players from your CSV file`,
      });
    } catch (err) {
      console.error('❌ CSV import failed:', err);
      toast({
        title: "Import failed",
        description: "Failed to import CSV file. Please check the format.",
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Import Player Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your FBref CSV file to load player data
            </p>
          </div>

          {totalPlayers > 0 && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-success font-medium">
                ✓ {totalPlayers} players loaded
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Importing...' : 'Choose CSV File'}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Expected format: FBref player stats CSV</p>
            <p>Required columns: Player, Squad, Pos, Age, Comp</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}