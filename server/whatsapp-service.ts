import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import type { WhatsAppStatus } from '@shared/schema';

export class WhatsAppService {
  private client: Client | null = null;
  private qrCodeData: string | null = null;
  private status: WhatsAppStatus = 'disconnected';
  private onStatusChange?: (status: WhatsAppStatus, qr?: string) => void;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
      }),
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

    this.client.on('qr', async (qr) => {
      console.log('QR Code received');
      this.status = 'qr';
      try {
        this.qrCodeData = await qrcode.toDataURL(qr);
        if (this.onStatusChange) {
          this.onStatusChange(this.status, this.qrCodeData);
        }
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready');
      this.status = 'ready';
      this.qrCodeData = null;
      if (this.onStatusChange) {
        this.onStatusChange(this.status);
      }
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated');
      this.status = 'connected';
      if (this.onStatusChange) {
        this.onStatusChange(this.status);
      }
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failure:', msg);
      this.status = 'disconnected';
      if (this.onStatusChange) {
        this.onStatusChange(this.status);
      }
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.status = 'disconnected';
      if (this.onStatusChange) {
        this.onStatusChange(this.status);
      }
    });

    this.client.initialize();
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
    if (!this.client) {
      throw new Error('WhatsApp client not initialized');
    }

    if (this.status !== 'ready') {
      throw new Error('WhatsApp client is not ready');
    }

    // Format phone number for WhatsApp
    let formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Handle Indonesian numbers
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '62' + formattedNumber.slice(1);
    } else if (!formattedNumber.startsWith('62')) {
      formattedNumber = '62' + formattedNumber;
    }

    const chatId = `${formattedNumber}@c.us`;
    
    try {
      await this.client.sendMessage(chatId, message);
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async reconnect() {
    if (this.client) {
      await this.client.destroy();
    }
    this.status = 'disconnected';
    this.qrCodeData = null;
    this.initialize();
  }

  getStatus(): WhatsAppStatus {
    return this.status;
  }

  getQRCode(): string | null {
    return this.qrCodeData;
  }

  isReady(): boolean {
    return this.status === 'ready';
  }
}

// Singleton instance
export const whatsappService = new WhatsAppService();
