# WhatsApp Broadcast Application

## Overview
Aplikasi web berbasis fullstack untuk mengirim pesan WhatsApp broadcast ke banyak orang secara bersamaan. Data kontak diambil dari Google Sheets, menggunakan WhatsApp Web untuk autentikasi QR, dan WebSocket untuk real-time progress tracking.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, whatsapp-web.js, Google Sheets API, WebSocket
- **Styling**: Material Design-inspired with WhatsApp green/blue theme
- **State Management**: TanStack Query, React Hooks
- **Real-time**: WebSocket for live status updates

## Features (MVP)
1. **WhatsApp QR Authentication** - Login menggunakan QR code scan di aplikasi web
2. **Google Sheets Integration** - Import data kontak (nama, nomor WA, tugas) dari Google Sheets
3. **Contact Management** - Tampilkan data dalam tabel dengan select/unselect
4. **Message Composer** - Tulis pesan dengan variabel placeholder ({nama}, {tugas})
5. **Broadcast System** - Kirim pesan ke multiple kontak dengan delay yang dikonfigurasi
6. **Real-time Progress** - Track status pengiriman (pending, sending, sent, failed) secara real-time

## Project Structure
```
client/
  src/
    components/
      - whatsapp-qr-card.tsx      # QR code display & connection status
      - google-sheets-input.tsx    # Google Sheets URL input form
      - contacts-table.tsx         # Contact list with selection
      - message-composer.tsx       # Message editor with variables
      - broadcast-progress.tsx     # Real-time progress tracker
      - app-sidebar.tsx           # Navigation sidebar
      - theme-provider.tsx        # Dark/light mode provider
      - theme-toggle.tsx          # Theme switcher
    pages/
      - dashboard.tsx             # Main dashboard page
    hooks/
      - use-websocket.ts          # WebSocket connection hook
shared/
  - schema.ts                     # Zod schemas & TypeScript types
server/
  - routes.ts                     # API endpoints & WebSocket server
  - storage.ts                    # In-memory storage interface
  - google-sheets.ts              # Google Sheets integration
```

## API Endpoints
- `POST /api/contacts/load` - Load contacts from Google Sheets
- `POST /api/broadcast/send` - Send broadcast messages
- `POST /api/whatsapp/reconnect` - Reconnect WhatsApp
- `WS /ws` - WebSocket for real-time updates

## WebSocket Messages
- `whatsapp_status` - WhatsApp connection status & QR code
- `broadcast_progress` - Individual message status update
- `broadcast_complete` - Broadcast completion summary

## Data Model
### Contact
```typescript
{
  id: string
  name: string
  phone: string  // Format: +62xxx or 08xxx
  task?: string
}
```

### Broadcast Message
```typescript
{
  message: string  // Max 4096 chars
  delay: number    // 1-10 seconds between messages
}
```

### Broadcast Result
```typescript
{
  contactId: string
  name: string
  phone: string
  status: 'pending' | 'sending' | 'sent' | 'failed'
  error?: string
  timestamp?: string
}
```

## Design Guidelines
- **Colors**: Blue primary (#217BED), Green success (#22C55E) for WhatsApp
- **Typography**: Inter for UI, JetBrains Mono for phone numbers
- **Spacing**: Consistent 4/6/8/12px spacing throughout
- **Components**: Using shadcn/ui for consistency
- **Dark Mode**: Fully supported with theme toggle
- **Responsive**: Mobile-first design with sidebar collapse

## Google Sheets Integration
- Users must authorize Google Sheets connection
- Sheet should have columns for: Name, Phone, Task
- Phone numbers must be in Indonesian format (+62 or 08)
- Configurable column mapping (default: A=Name, B=Phone, C=Task)

## WhatsApp Integration
- Uses whatsapp-web.js library
- QR code authentication (no Business API needed)
- Session persistence to avoid re-login
- Configurable message delay to prevent spam detection

## User Preferences
- Language: Indonesian (Bahasa Indonesia)
- Default theme: Light mode
- Preferred delay: 2 seconds between messages

## Recent Changes
- 2025-01-XX: Initial project setup
- Schema-first development approach
- All frontend components built with Material Design principles
- WhatsApp-inspired green/blue color scheme
- Real-time WebSocket integration for live updates

## Notes
- In-memory storage (no database persistence yet)
- WhatsApp session stored in server memory
- Contact data refreshed on each Google Sheets load
- Broadcast queue managed server-side with configurable delays
