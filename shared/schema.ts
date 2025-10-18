import { z } from "zod";

// Contact data from Google Sheets
export const contactSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama harus diisi"),
  phone: z.string().regex(/^(\+?62|0)\d{9,12}$/, "Nomor WhatsApp tidak valid"),
  task: z.string().optional(),
});

export type Contact = z.infer<typeof contactSchema>;

// Broadcast message schema - SIMPLE VERSION
export const broadcastMessageSchema = z.object({
  message: z.string(),
  delay: z.number().default(2),
  contactIds: z.array(z.string())
});

export type BroadcastMessage = z.infer<typeof broadcastMessageSchema>;

// Message status for tracking
export const messageStatusSchema = z.enum(['pending', 'sending', 'sent', 'failed']);
export type MessageStatus = z.infer<typeof messageStatusSchema>;

// Broadcast result
export const broadcastResultSchema = z.object({
  contactId: z.string(),
  contactName: z.string(),
  status: messageStatusSchema,
  message: z.string().optional(),
  error: z.string().optional(),
  timestamp: z.string(),
});

export type BroadcastResult = z.infer<typeof broadcastResultSchema>;

// WhatsApp connection status
export const whatsappStatusSchema = z.enum(['disconnected', 'qr', 'connected', 'ready']);
export type WhatsAppStatus = z.infer<typeof whatsappStatusSchema>;

// Google Sheets data request
export const googleSheetsRequestSchema = z.object({
  spreadsheetUrl: z.string().min(1, "URL Google Sheets harus diisi"),
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