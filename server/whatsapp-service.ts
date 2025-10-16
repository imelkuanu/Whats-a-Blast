import qrcode from 'qrcode';
import type { WhatsAppStatus } from '@shared/schema';

// Simulated WhatsApp service for demo purposes
// In production, this would use whatsapp-web.js with proper Chromium setup
export class WhatsAppService {
  private qrCodeData: string | null = null;
  private status: WhatsAppStatus = 'disconnected';
  private onStatusChange?: (status: WhatsAppStatus, qr?: string) => void;
  private sessionActive: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log('WhatsApp service initialized (simulated mode)');
    
    // Simulate QR code generation after 2 seconds
    setTimeout(async () => {
      this.status = 'qr';
      try {
        // Generate a sample QR code
        this.qrCodeData = await qrcode.toDataURL('https://wa.me/demo-whatsapp-broadcast');
        console.log('QR Code generated (simulated)');
        if (this.onStatusChange) {
          this.onStatusChange(this.status, this.qrCodeData);
        }
        
        // Simulate authentication after 10 seconds
        setTimeout(() => {
          this.status = 'connected';
          console.log('WhatsApp authenticated (simulated)');
          if (this.onStatusChange) {
            this.onStatusChange(this.status);
          }
          
          // Simulate ready state
          setTimeout(() => {
            this.status = 'ready';
            this.sessionActive = true;
            this.qrCodeData = null;
            console.log('WhatsApp ready (simulated)');
            if (this.onStatusChange) {
              this.onStatusChange(this.status);
            }
          }, 2000);
        }, 10000);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    }, 2000);
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
    if (this.status !== 'ready' || !this.sessionActive) {
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
    
    // Simulate sending message
    console.log(`[SIMULATED] Sending message to ${chatId}: ${message}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate 10% failure rate for demo
    if (Math.random() < 0.1) {
      throw new Error('Failed to send message (simulated network error)');
    }
  }

  async reconnect() {
    this.status = 'disconnected';
    this.qrCodeData = null;
    this.sessionActive = false;
    if (this.onStatusChange) {
      this.onStatusChange(this.status);
    }
    this.initialize();
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
}

// Singleton instance
export const whatsappService = new WhatsAppService();
