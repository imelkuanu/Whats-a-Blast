import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { BroadcastResult } from "@shared/schema";
import { format } from "date-fns";

interface BroadcastProgressProps {
  results: BroadcastResult[];
  isActive: boolean;
}

export function BroadcastProgress({ results, isActive }: BroadcastProgressProps) {
  const total = results.length;
  const sent = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const pending = results.filter(r => r.status === 'pending').length;
  const sending = results.filter(r => r.status === 'sending').length;
  
  const progress = total > 0 ? ((sent + failed) / total) * 100 : 0;

  const getStatusIcon = (status: BroadcastResult['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'sending':
        return <Activity className="h-4 w-4 text-primary animate-pulse" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <Card data-testid="card-broadcast-progress">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Progress Broadcast
        </CardTitle>
        <CardDescription>
          {isActive ? 'Sedang mengirim pesan...' : 'Broadcast selesai'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress value={progress} className="h-2" data-testid="progress-broadcast" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold" data-testid="text-total-count">{total}</div>
            <div className="text-xs text-muted-foreground mt-1">Total</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-chart-2/10 rounded-lg">
            <div className="text-2xl font-bold text-chart-2" data-testid="text-sent-count">{sent}</div>
            <div className="text-xs text-muted-foreground mt-1">Terkirim</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-destructive/10 rounded-lg">
            <div className="text-2xl font-bold text-destructive" data-testid="text-failed-count">{failed}</div>
            <div className="text-xs text-muted-foreground mt-1">Gagal</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold" data-testid="text-pending-count">{pending + sending}</div>
            <div className="text-xs text-muted-foreground mt-1">Menunggu</div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Log Aktivitas</h4>
          <ScrollArea className="h-64 rounded-lg border bg-muted/20">
            <div className="p-4 space-y-2">
              {results.slice().reverse().map((result, index) => (
                <div 
                  key={`${result.contactId}-${index}`}
                  className="flex items-start gap-3 p-2 rounded-md hover-elevate"
                  data-testid={`log-entry-${result.contactId}`}
                >
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{result.phone}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          result.status === 'sent' ? 'bg-chart-2/10 text-chart-2 border-chart-2/20' :
                          result.status === 'failed' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          result.status === 'sending' ? 'bg-primary/10 text-primary border-primary/20' :
                          'bg-muted/50 text-muted-foreground border-border'
                        }
                      >
                        {result.status === 'sent' ? 'Terkirim' :
                         result.status === 'failed' ? 'Gagal' :
                         result.status === 'sending' ? 'Mengirim' :
                         'Menunggu'}
                      </Badge>
                    </div>
                    {result.error && (
                      <p className="text-xs text-destructive mt-1">{result.error}</p>
                    )}
                    {result.timestamp && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(result.timestamp), 'HH:mm:ss')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
