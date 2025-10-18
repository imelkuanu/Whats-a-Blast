import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, QrCode, CheckCircle2, XCircle, RefreshCw, Info } from "lucide-react";
import type { WhatsAppStatus } from "@shared/schema";

interface WhatsAppQRCardProps {
  status: WhatsAppStatus;
  qrCode?: string;
  onReconnect: () => void;
}

export function WhatsAppQRCard({ status, qrCode, onReconnect }: WhatsAppQRCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
      case 'ready':
        return (
          <Badge className="gap-1.5 bg-chart-2 text-white border-chart-2" data-testid="badge-status-connected">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Terhubung
          </Badge>
        );
      case 'qr':
      case 'connecting':
        return (
          <Badge className="gap-1.5 bg-chart-3 text-white border-chart-3" data-testid="badge-status-waiting">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Menunggu Scan
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="destructive" className="gap-1.5" data-testid="badge-status-disconnected">
            <XCircle className="h-3.5 w-3.5" />
            Terputus
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card data-testid="card-whatsapp-connection">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg">WhatsApp Connection</CardTitle>
          <CardDescription className="mt-1.5">
            Scan QR code dengan WhatsApp Anda
          </CardDescription>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Status Real:</strong> Aplikasi terhubung dengan WhatsApp Web. Pesan akan benar-benar dikirim.
          </AlertDescription>
        </Alert>
        {(status === 'qr' || status === 'connecting') && qrCode ? (
          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <img 
                src={qrCode} 
                alt="WhatsApp QR Code" 
                className="w-64 h-64"
                data-testid="img-qr-code"
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Scan dengan WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                Buka WhatsApp → Pengaturan → Perangkat Tertaut
              </p>
            </div>
          </div>
        ) : status === 'connected' || status === 'ready' ? (
          <div className="flex flex-col items-center justify-center p-8 bg-chart-2/10 rounded-lg">
            <CheckCircle2 className="h-16 w-16 text-chart-2 mb-3" />
            <p className="text-sm font-medium">WhatsApp Terhubung</p>
            <p className="text-xs text-muted-foreground mt-1">
              Siap mengirim pesan
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
            <QrCode className="h-16 w-16 text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-3">Belum Terhubung</p>
            <Button 
              onClick={onReconnect} 
              variant="outline" 
              size="sm"
              className="gap-2"
              data-testid="button-reconnect"
            >
              <RefreshCw className="h-4 w-4" />
              Hubungkan WhatsApp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
