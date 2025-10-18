import qrcode from 'qrcode';
import { Client } from 'whatsapp-web.js';
import type { WhatsAppStatus } from '@shared/schema';

export class WhatsAppService {
  private client: Client | null = null;
  private qrCodeData: string | null = null;
  private status: WhatsAppStatus = 'disconnected';
  private onStatusChange?: (status: WhatsAppStatus, qr?: string) => void;
  private sessionActive: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log('Initializing REAL WhatsApp service...');
    
    try {
      // Initialize WhatsApp client with basic configuration
      this.client = new Client({
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      // QR Code generation
      this.client.on('qr', async (qr: string) => {
        console.log('QR Code received from WhatsApp Web');
        this.status = 'qr';
        try {
          this.qrCodeData = await qrcode.toDataURL(qr);
          console.log('QR Code generated (REAL)');
          if (this.onStatusChange) {
            this.onStatusChange(this.status, this.qrCodeData);
          }
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      });

      // Authenticated
      this.client.on('authenticated', () => {
        console.log('WhatsApp AUTHENTICATED successfully');
        this.status = 'connected';
        if (this.onStatusChange) {
          this.onStatusChange(this.status);
        }
      });

      // Ready to send messages
      this.client.on('ready', () => {
        console.log('WhatsApp READY to send messages');
        this.status = 'ready';
        this.sessionActive = true;
        this.qrCodeData = null;
        if (this.onStatusChange) {
          this.onStatusChange(this.status);
        }
      });

      // Disconnected
      this.client.on('disconnected', (reason: string) => {
        console.log('WhatsApp DISCONNECTED:', reason);
        this.status = 'disconnected';
        this.sessionActive = false;
        this.qrCodeData = null;
        if (this.onStatusChange) {
          this.onStatusChange(this.status);
        }
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect WhatsApp...');
          this.reconnect();
        }, 5000);
      });

      // Error handling
      this.client.on('auth_failure', (error: any) => {
        console.error('WhatsApp AUTH FAILURE:', error);
        this.status = 'disconnected';
        if (this.onStatusChange) {
          this.onStatusChange(this.status);
        }
      });

      // Initialize the client
      this.client.initialize();

    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      this.status = 'disconnected';
      if (this.onStatusChange) {
        this.onStatusChange(this.status);
      }
    }
  }

  setStatusChangeHandler(handler: (status: WhatsAppStatus, qr?: string) => void) {
    this.onStatusChange = handler;
    // Send current status immediately
    if (this.qrCodeData) {
      handler(this.status, this.qrCodeData);
    } else {
      handler(this.status);
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    if (!this.client || this.status !== 'ready' || !this.sessionActive) {
      throw new Error('WhatsApp client is not ready. Please check connection.');
    }

    try {
      // Format phone number for WhatsApp
      let formattedNumber = phoneNumber.replace(/\D/g, '');
      
      // Handle Indonesian numbers
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.slice(1);
      } else if (!formattedNumber.startsWith('62')) {
        formattedNumber = '62' + formattedNumber;
      }

      const chatId = `${formattedNumber}@c.us`;
      
      console.log(`[REAL] Sending message to ${chatId}: ${message.substring(0, 50)}...`);
      
      // Send the actual message via WhatsApp
      await this.client.sendMessage(chatId, message);
      
      console.log(`[REAL] Message sent successfully to ${formattedNumber}`);
      
    } catch (error: any) {
      console.error(`[REAL] Failed to send message to ${phoneNumber}:`, error);
      throw new Error(`Gagal mengirim pesan: ${error.message}`);
    }
  }

  async reconnect() {
    console.log('Reconnecting WhatsApp service...');
    
    this.status = 'disconnected';
    this.qrCodeData = null;
    this.sessionActive = false;
    
    if (this.onStatusChange) {
      this.onStatusChange(this.status);
    }
    
    // Clean up existing client
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (error) {
        console.error('Error destroying old client:', error);
      }
      this.client = null;
    }
    
    // Reinitialize
    setTimeout(() => {
      this.initialize();
    }, 1000);
  }

  getStatus(): WhatsAppStatus {
    return this.status;
  }

  getQRCode(): string | null {
    return this.qrCodeData;
  }

  isReady(): boolean {
    return this.status === 'ready' && this.sessionActive;
  }

  // Cleanup method
  async destroy() {
    if (this.client) {
      await this.client.destroy();
    }
  }
}

// Singleton instance
export const whatsappService = new WhatsAppService();