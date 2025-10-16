import { z } from "zod";

// Contact data from Google Sheets
export const contactSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama harus diisi"),
  phone: z.string().regex(/^(\+?62|0)\d{9,12}$/, "Nomor WhatsApp tidak valid"),
  task: z.string().optional(),
});

export type Contact = z.infer<typeof contactSchema>;

// Broadcast message schema
export const broadcastMessageSchema = z.object({
  message: z.string().min(1, "Pesan tidak boleh kosong").max(4096, "Pesan terlalu panjang (max 4096 karakter)"),
  delay: z.number().min(1).max(10).default(2), // delay in seconds between messages
});

export type BroadcastMessage = z.infer<typeof broadcastMessageSchema>;

// Message status for tracking
export const messageStatusSchema = z.enum(['pending', 'sending', 'sent', 'failed']);
export type MessageStatus = z.infer<typeof messageStatusSchema>;

// Broadcast result
export const broadcastResultSchema = z.object({
  contactId: z.string(),
  name: z.string(),
  phone: z.string(),
  status: messageStatusSchema,
  error: z.string().optional(),
  timestamp: z.string().optional(),
});

export type BroadcastResult = z.infer<typeof broadcastResultSchema>;

// WhatsApp connection status
export const whatsappStatusSchema = z.enum(['disconnected', 'qr', 'connected', 'ready']);
export type WhatsAppStatus = z.infer<typeof whatsappStatusSchema>;

// Google Sheets data request
export const googleSheetsRequestSchema = z.object({
  spreadsheetUrl: z.string().url("URL Google Sheets tidak valid"),
  nameColumn: z.string().default("A"),
  phoneColumn: z.string().default("B"),
  taskColumn: z.string().default("C"),
});

export type GoogleSheetsRequest = z.infer<typeof googleSheetsRequestSchema>;

// WebSocket message types
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("whatsapp_status"),
    status: whatsappStatusSchema,
    qr: z.string().optional(),
  }),
  z.object({
    type: z.literal("broadcast_progress"),
    result: broadcastResultSchema,
  }),
  z.object({
    type: z.literal("broadcast_complete"),
    summary: z.object({
      total: z.number(),
      sent: z.number(),
      failed: z.number(),
    }),
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;
