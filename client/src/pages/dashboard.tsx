import { useState, useEffect } from "react";
import { WhatsAppQRCard } from "@/components/whatsapp-qr-card";
import { GoogleSheetsInput } from "@/components/google-sheets-input";
import { ContactsTable } from "@/components/contacts-table";
import { MessageComposer } from "@/components/message-composer";
import { BroadcastProgress } from "@/components/broadcast-progress";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Contact, WhatsAppStatus, BroadcastMessage, BroadcastResult, GoogleSheetsRequest } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { lastMessage } = useWebSocket();
  
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>('disconnected');
  const [qrCode, setQrCode] = useState<string>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [broadcastResults, setBroadcastResults] = useState<BroadcastResult[]>([]);
  const [contactStatuses, setContactStatuses] = useState<Map<string, BroadcastResult['status']>>(new Map());

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'whatsapp_status') {
      setWhatsappStatus(lastMessage.status);
      if (lastMessage.qr) {
        setQrCode(lastMessage.qr);
      }
    } else if (lastMessage.type === 'broadcast_progress') {
      setBroadcastResults(prev => {
        const existing = prev.find(r => r.contactId === lastMessage.result.contactId);
        if (existing) {
          return prev.map(r => 
            r.contactId === lastMessage.result.contactId ? lastMessage.result : r
          );
        }
        return [...prev, lastMessage.result];
      });
      
      setContactStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(lastMessage.result.contactId, lastMessage.result.status);
        return newMap;
      });
    } else if (lastMessage.type === 'broadcast_complete') {
      toast({
        title: "Broadcast Selesai",
        description: `${lastMessage.summary.sent} pesan terkirim, ${lastMessage.summary.failed} gagal`,
      });
    }
  }, [lastMessage, toast]);

  // Load contacts from Google Sheets
  const loadContactsMutation = useMutation({
    mutationFn: async (data: GoogleSheetsRequest) => {
      return await apiRequest<Contact[]>('POST', '/api/contacts/load', data);
    },
    onSuccess: (data) => {
      setContacts(data);
      setSelectedContacts(new Set(data.map(c => c.id)));
      setBroadcastResults([]);
      setContactStatuses(new Map());
      toast({
        title: "Data Berhasil Dimuat",
        description: `${data.length} kontak berhasil dimuat dari Google Sheets`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal Memuat Data",
        description: error.message || "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    },
  });

  // Send broadcast
  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: BroadcastMessage & { contactIds: string[] }) => {
      const response = await apiRequest('POST', '/api/broadcast/send', data);
      return response;
    },
    onSuccess: () => {
      setBroadcastResults([]);
      setContactStatuses(new Map());
      toast({
        title: "Broadcast Dimulai",
        description: "Pesan sedang dikirim ke kontak yang dipilih",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal Mengirim Broadcast",
        description: error.message || "Terjadi kesalahan saat mengirim pesan",
        variant: "destructive",
      });
    },
  });

  // Reconnect WhatsApp
  const reconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/whatsapp/reconnect');
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Menghubungkan WhatsApp",
        description: "Silakan scan QR code yang muncul",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal Menghubungkan",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    },
  });

  const handleSelectContact = (contactId: string, selected: boolean) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(contactId);
      } else {
        newSet.delete(contactId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  // FIXED: HandleSendBroadcast tanpa "Pesan default"
  const handleSendBroadcast = (data: { message: string; delay: number }) => {
    console.log('🚀 Sending broadcast...');
    
    const fixedData = {
      message: data.message, // LANGSUNG PAKAI data.message, NO FALLBACK
      delay: data.delay,
      contactIds: Array.from(selectedContacts)
    };
    
    console.log('Data yang dikirim:', fixedData);
    sendBroadcastMutation.mutate(fixedData);
  };

  const isBroadcasting = sendBroadcastMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Kelola dan kirim pesan broadcast WhatsApp Anda
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - WhatsApp & Google Sheets */}
        <div className="space-y-6 lg:col-span-1">
          <WhatsAppQRCard 
            status={whatsappStatus}
            qrCode={qrCode}
            onReconnect={() => reconnectMutation.mutate()}
          />
          
          <GoogleSheetsInput 
            onLoadData={(data) => loadContactsMutation.mutate(data)}
            isLoading={loadContactsMutation.isPending}
          />
        </div>

        {/* Right Column - Contacts & Messages */}
        <div className="space-y-6 lg:col-span-2">
          <ContactsTable
            contacts={contacts}
            selectedContacts={selectedContacts}
            onSelectContact={handleSelectContact}
            onSelectAll={handleSelectAll}
            contactStatuses={contactStatuses}
          />

          <MessageComposer
            onSend={handleSendBroadcast}
            isSending={isBroadcasting}
            selectedCount={selectedContacts.size}
            contacts={contacts}
            selectedContacts={selectedContacts}
          />

          {broadcastResults.length > 0 && (
            <BroadcastProgress
              results={broadcastResults}
              isActive={isBroadcasting}
            />
          )}
        </div>
      </div>
    </div>
  );
}