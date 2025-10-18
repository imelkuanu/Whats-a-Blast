import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2 } from "lucide-react";
import type { Contact } from "@shared/schema";
import { useState, useEffect } from "react";

interface MessageComposerProps {
  onSend: (data: { message: string; delay: number }) => void;
  isSending?: boolean;
  selectedCount: number;
  contacts?: Contact[];
  selectedContacts?: Set<string>;
}

export function MessageComposer({ onSend, isSending, selectedCount, contacts = [], selectedContacts = new Set() }: MessageComposerProps) {
  const [template, setTemplate] = useState<string>(""); // TEMPLATE DARI SPREADSHEET
  const [delay, setDelay] = useState<number>(2);

  // Get template message
  const getTemplateMessage = (): string => {
    if (!selectedContacts || selectedContacts.size === 0) return "";
    const firstSelectedId = Array.from(selectedContacts)[0];
    const firstContact = contacts.find(c => c.id === firstSelectedId);
    return firstContact?.task || "";
  };

  // Auto-fill template message ketika selectedContacts berubah
  useEffect(() => {
    const newTemplate = getTemplateMessage();
    console.log('🔄 Template from spreadsheet:', newTemplate);
    if (newTemplate) {
      setTemplate(newTemplate);
    }
  }, [selectedContacts, contacts]);

  const handleSend = () => {
    // KIRIM PESAN KOSONG SAJA, KARENA SERVER AKAN GUNAKAN TEMPLATE MASING-MASING KONTAK
    console.log('🚀 SENDING (template akan digunakan dari masing2 kontak)');
    onSend({ message: "", delay });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Template Pesan Broadcast
        </CardTitle>
        <CardDescription>
          Pesan otomatis diambil dari kolom Tugas di spreadsheet untuk masing-masing kontak
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Template Display - HANYA TAMPILAN, TIDAK BISA EDIT */}
          <div className="space-y-2">
            <Label>Template Pesan (Dari Spreadsheet Kolom C)</Label>
            <div className="bg-muted/50 rounded-md p-4 border min-h-[120px]">
              <p className="text-sm whitespace-pre-wrap">
                {template || "Pilih kontak untuk melihat template pesan"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Setiap kontak akan menerima template pesan dari kolom Tugas mereka sendiri di spreadsheet.
            </p>
          </div>

          {/* Variables Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Variabel yang Tersedia</Label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-mono">{`{nama}`}</Badge>
              <span>akan diganti dengan nama kontak</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-mono">{`{tugas}`}</Badge>
              <span>akan diganti dengan tugas kontak</span>
            </div>
          </div>

          {/* Delay Field */}
          <div className="space-y-3">
            <Label>Jeda Antar Pesan</Label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[delay]}
              onValueChange={(value) => setDelay(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 detik</span>
              <Badge variant="outline" className="font-mono">
                {delay} detik
              </Badge>
              <span>10 detik</span>
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            className="flex-1 gap-2"
            disabled={isSending || selectedCount === 0}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {selectedCount > 0 
                  ? `Kirim ke ${selectedCount} Kontak`
                  : 'Pilih Kontak Terlebih Dahulu'
                }
              </>
            )}
          </Button>
        </div>

        {/* Preview - GUNAKAN TEMPLATE ASLI UNTUK PREVIEW */}
        {selectedCount > 0 && (
          <div className="mt-6 pt-6 border-t">
            <Label className="text-sm font-medium mb-2 block">Preview Pesan Personal</Label>
            <div className="space-y-3">
              {Array.from(selectedContacts).slice(0, 3).map(contactId => {
                const contact = contacts.find(c => c.id === contactId);
                if (!contact) return null;
                
                // GUNAKAN TEMPLATE MASING-MASING KONTAK UNTUK PREVIEW
                const contactTemplate = contact.task || '';
                const personalizedMessage = contactTemplate
                  .replace(/{nama}/g, contact.name)
                  .replace(/{tugas}/g, contact.task || '-');
                
                return (
                  <div key={contactId} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">{contact.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {contact.phone}
                      </Badge>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {personalizedMessage || "Tidak ada template untuk kontak ini"}
                    </p>
                  </div>
                );
              })}
              {selectedCount > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  ... dan {selectedCount - 3} kontak lainnya
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}