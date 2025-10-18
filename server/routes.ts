import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { whatsappService } from "./whatsapp-service";
import { getGoogleSheetClient, extractSpreadsheetId, columnToIndex } from "./google-sheets";
import { googleSheetsRequestSchema, type Contact, type BroadcastResult } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);
    
    // Send current WhatsApp status
    const status = whatsappService.getStatus();
    const qr = whatsappService.getQRCode();
    
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'whatsapp_status',
        status,
        qr: qr || undefined,
      }));
    }
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
  });
  
  // Broadcast message to all connected clients
  const broadcast = (message: any) => {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  };
  
  // WhatsApp status change handler
  whatsappService.setStatusChangeHandler((status, qr) => {
    broadcast({
      type: 'whatsapp_status',
      status,
      qr: qr || undefined,
    });
  });
  
  // Load contacts from Google Sheets
  app.post('/api/contacts/load', async (req, res) => {
    try {
      const validated = googleSheetsRequestSchema.parse(req.body);
      
      // Check if this is a demo/sample data request
      if (validated.spreadsheetUrl.includes('demo') || validated.spreadsheetUrl === 'demo') {
        // Return sample data only when explicitly requested
        const sampleContacts: Contact[] = [
          { id: nanoid(), name: 'John Doe', phone: '081234567890', task: 'Mengerjakan laporan bulanan' },
          { id: nanoid(), name: 'Jane Smith', phone: '081987654321', task: 'Review dokumen proposal' },
          { id: nanoid(), name: 'Ahmad Yusuf', phone: '082345678901', task: 'Presentasi project' },
          { id: nanoid(), name: 'Siti Nurhaliza', phone: '083456789012', task: 'Meeting client' },
          { id: nanoid(), name: 'Budi Santoso', phone: '084567890123', task: 'Update website' },
        ];
        const storedContacts = await storage.setContacts(sampleContacts);
        return res.json(storedContacts);
      }
      
      const spreadsheetId = extractSpreadsheetId(validated.spreadsheetUrl);
      
      let sheets;
      try {
        sheets = await getGoogleSheetClient();
      } catch (error: any) {
        // Return error instead of falling back to demo data
        console.error('Google Sheets authentication failed:', error);
        return res.status(500).json({ 
          message: 'Google Sheets tidak terkoneksi. Pastikan konfigurasi Google API sudah benar.' 
        });
      }
      
      // Get spreadsheet metadata to find sheet names
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId,
      });
      
      const sheetName = metadata.data.sheets?.[0]?.properties?.title || 'Sheet1';
      
      // Read data from sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1000`, // Read first 1000 rows
      });
      
      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        return res.status(400).json({ message: 'Spreadsheet kosong atau tidak ada data' });
      }
      
      // Parse contacts based on column mapping
      const nameCol = columnToIndex(validated.nameColumn.toUpperCase());
      const phoneCol = columnToIndex(validated.phoneColumn.toUpperCase());
      const taskCol = columnToIndex(validated.taskColumn.toUpperCase());
      
      const contacts: Contact[] = [];
      
      // Skip header row if it exists
      const startRow = rows[0]?.some(cell => 
        typeof cell === 'string' && 
        (cell.toLowerCase().includes('nama') || cell.toLowerCase().includes('name'))
      ) ? 1 : 0;
      
      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const name = row[nameCol]?.toString().trim();
        const phone = row[phoneCol]?.toString().trim();
        const task = row[taskCol]?.toString().trim();
        
        if (name && phone) {
          // Validate phone number format
          const phoneRegex = /^(\+?62|0)\d{9,12}$/;
          if (phoneRegex.test(phone)) {
            contacts.push({
              id: nanoid(),
              name,
              phone,
              task: task || undefined,
            });
          }
        }
      }
      
      if (contacts.length === 0) {
        return res.status(400).json({ message: 'Tidak ada kontak valid yang ditemukan. Pastikan format nomor WhatsApp benar (+62/08)' });
      }
      
      // Store contacts
      const storedContacts = await storage.setContacts(contacts);
      
      res.json(storedContacts);
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      res.status(500).json({ message: error.message || 'Gagal memuat data dari Google Sheets' });
    }
  });
  
  // Send broadcast - FIXED VERSION (GUNAKAN TEMPLATE MASING-MASING KONTAK)
  app.post('/api/broadcast/send', async (req, res) => {
    console.log('🎯 BROADCAST SEND REQUEST RECEIVED');
    console.log('Request body:', req.body);
    
    try {
      // Validasi manual - NO ZOD VALIDATION
      const { message, delay = 2, contactIds = [] } = req.body;
      
      console.log('Parsed data:', { message, delay, contactIds });
      
      if (!contactIds || contactIds.length === 0) {
        return res.status(400).json({ message: 'Pilih minimal satu kontak' });
      }
      
      if (!whatsappService.isReady()) {
        return res.status(400).json({ message: 'WhatsApp belum terhubung' });
      }
      
      // Dapatkan kontak dari storage
      const allContacts = await storage.getAllContacts();
      const selectedContacts = allContacts.filter(contact => 
        contactIds.includes(contact.id)
      );
      
      console.log(`📋 Found ${selectedContacts.length} contacts`);
      
      if (selectedContacts.length === 0) {
        return res.status(400).json({ message: 'Kontak tidak ditemukan' });
      }
      
      console.log('✅ Starting broadcast to', selectedContacts.length, 'contacts');
      
      // Kirim response immediate
      res.json({ 
        success: true, 
        message: 'Broadcast dimulai', 
        count: selectedContacts.length 
      });
      
      // Process broadcast async
      (async () => {
        const results: BroadcastResult[] = [];
        
        for (let i = 0; i < selectedContacts.length; i++) {
          const contact = selectedContacts[i];
          const result: BroadcastResult = {
            contactId: contact.id,
            contactName: contact.name,
            status: 'sending',
            message: 'Mengirim pesan...',
            timestamp: new Date().toISOString(),
          };
          
          // Broadcast start progress
          broadcast({
            type: 'broadcast_progress',
            result,
          });
          
          try {
            // FIX: GUNAKAN TEMPLATE DARI KONTAK ITU SENDIRI (kolom C), ABAIKAN message dari user
            let personalizedMessage = contact.task || '';
            
            // Tetap replace variables jika ada
            personalizedMessage = personalizedMessage
              .replace(/{nama}/g, contact.name)
              .replace(/{tugas}/g, contact.task || '-');
            
            console.log(`📤 [${i+1}/${selectedContacts.length}] Sending to ${contact.name}:`, personalizedMessage);
            
            // Kirim via WhatsApp
            await whatsappService.sendMessage(contact.phone, personalizedMessage);
            
            // Success
            result.status = 'sent';
            result.message = 'Pesan terkirim';
            console.log(`✅ [${i+1}/${selectedContacts.length}] Sent to ${contact.name}`);
            
          } catch (error: any) {
            // Failed
            result.status = 'failed';
            result.message = error.message || 'Gagal mengirim';
            console.error(`❌ [${i+1}/${selectedContacts.length}] Failed to ${contact.name}:`, error.message);
          }
          
          result.timestamp = new Date().toISOString();
          results.push(result);
          
          // Broadcast final result
          broadcast({
            type: 'broadcast_progress',
            result,
          });
          
          // Delay untuk pesan berikutnya (kecuali yang terakhir)
          if (i < selectedContacts.length - 1 && delay > 0) {
            console.log(`⏳ Waiting ${delay} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
          }
        }
        
        // Kirim summary
        const sentCount = results.filter(r => r.status === 'sent').length;
        const failedCount = results.filter(r => r.status === 'failed').length;
        
        console.log(`🎉 Broadcast completed: ${sentCount}/${selectedContacts.length} sent`);
        
        broadcast({
          type: 'broadcast_complete',
          summary: {
            total: selectedContacts.length,
            sent: sentCount,
            failed: failedCount
          }
        });
      })();
      
    } catch (error: any) {
      console.error('Error sending broadcast:', error);
      res.status(500).json({ message: error.message || 'Gagal mengirim broadcast' });
    }
  });
  
  // Reconnect WhatsApp
  app.post('/api/whatsapp/reconnect', async (req, res) => {
    try {
      await whatsappService.reconnect();
      res.json({ message: 'WhatsApp reconnecting...' });
    } catch (error: any) {
      console.error('Error reconnecting WhatsApp:', error);
      res.status(500).json({ message: error.message || 'Gagal menghubungkan WhatsApp' });
    }
  });

  return httpServer;
}