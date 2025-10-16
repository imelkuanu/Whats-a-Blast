# Design Guidelines: WhatsApp Broadcast Application

## Design Approach: Productivity-Focused System

**Selected Framework**: Material Design principles adapted with Linear-inspired modern aesthetics
**Justification**: This is a utility-focused productivity tool requiring clear data visualization, efficient workflows, and reliable interface patterns. The design prioritizes usability, clarity, and task completion over visual flair.

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 217 91% 60% (Blue - trust, communication)
- Primary Hover: 217 91% 50%
- Success: 142 76% 36% (Green - WhatsApp alignment)
- Error: 0 84% 60% (Red - alerts)
- Warning: 38 92% 50% (Amber - caution)
- Background: 0 0% 100% (White)
- Surface: 220 13% 97% (Light gray)
- Border: 220 13% 91%
- Text Primary: 220 9% 15%
- Text Secondary: 220 9% 46%

**Dark Mode:**
- Primary: 217 91% 65%
- Primary Hover: 217 91% 55%
- Success: 142 76% 45%
- Error: 0 84% 65%
- Warning: 38 92% 60%
- Background: 222 47% 11% (Dark slate)
- Surface: 217 33% 17%
- Border: 217 33% 24%
- Text Primary: 210 40% 98%
- Text Secondary: 215 20% 65%

### B. Typography

**Font Family:**
- Primary: 'Inter' (Google Fonts) - Clean, modern, excellent readability
- Monospace: 'JetBrains Mono' - For phone numbers, data display

**Type Scale:**
- Headings: font-semibold
- H1: text-3xl (Dashboard titles)
- H2: text-2xl (Section headers)
- H3: text-xl (Card titles)
- Body: text-base, font-normal
- Small: text-sm (Helper text, labels)
- Tiny: text-xs (Timestamps, status badges)

### C. Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4 (between elements)
- Section spacing: p-6, p-8 (cards, containers)
- Page margins: p-8, p-12, p-16 (outer layout)

**Grid System:**
- Main dashboard: Single column on mobile, sidebar + main area on desktop
- Sidebar: w-64 (256px) - Navigation and status
- Main content: flex-1 with max-w-7xl container
- Data tables: Full width with horizontal scroll on mobile

### D. Component Library

**1. Dashboard Layout:**
- Sidebar navigation (fixed left, 256px)
  - WhatsApp connection status card
  - Navigation menu (Dashboard, History, Settings)
  - Quick stats (messages sent today, success rate)
- Main content area
  - Top bar: breadcrumbs, user profile
  - Content cards with rounded-lg, shadow-sm

**2. Authentication Components:**
- QR Code display card
  - Centered 256x256px QR code
  - Loading state with spinner
  - Connection status indicator (green dot + "Connected" or yellow dot + "Waiting")
  - Auto-refresh countdown timer
  - Reconnect button (if disconnected)

**3. Data Input Components:**
- Google Sheets URL input
  - Large input field with icon prefix
  - Paste button helper
  - Validation feedback (green check or red error)
  - "Load Data" button (primary, full width on mobile)
- Spreadsheet column mapping
  - Dropdown selectors for Name, Phone, Task columns
  - Preview of first 3 rows
  - Column count and row count display

**4. Data Table:**
- Responsive table with fixed header
- Columns: Checkbox, Name, Phone Number (monospace), Task, Status
- Row hover states (subtle background change)
- Bulk actions toolbar (appears when rows selected)
- Status badges: pill-shaped with colored backgrounds
  - Pending: gray
  - Sending: blue with pulse animation
  - Sent: green
  - Failed: red
- Pagination controls at bottom (10/25/50/100 rows per page)

**5. Message Composition:**
- Card with rounded borders
- Textarea with character counter (WhatsApp limit)
- Variable insertion buttons ({{name}}, {{task}})
- Message preview panel
- Send controls:
  - Delay between messages (slider: 1-10 seconds)
  - "Send to All" primary button
  - "Send to Selected" secondary button

**6. Progress Tracking:**
- Linear progress bar (top of screen when active)
- Status cards showing:
  - Total messages
  - Sent (green)
  - Failed (red)
  - Remaining (gray)
- Real-time log feed (scrollable, newest at top)
  - Timestamp (text-xs, text-gray-500)
  - Phone number (monospace)
  - Status icon
  - Error message (if failed)

**7. Navigation & Controls:**
- Top navigation: minimal, logo left, actions right
- Sidebar navigation: icon + label style
- Buttons hierarchy:
  - Primary: solid blue background, white text
  - Secondary: border, transparent background
  - Destructive: red background for dangerous actions
  - Ghost: no background, hover shows background
- Icons: Heroicons (outline for navigation, solid for status)

**8. Notifications:**
- Toast notifications (top-right corner)
- Auto-dismiss after 5 seconds
- Success: green left border
- Error: red left border
- Info: blue left border

**9. Forms & Inputs:**
- Input fields: border-2, rounded-lg, p-3
- Focus state: ring-2 ring-primary
- Labels: text-sm font-medium mb-2
- Helper text: text-xs text-gray-500
- Error state: border-red-500, text-red-600 helper

### E. Interaction Patterns

**Loading States:**
- Skeleton screens for data table loading
- Spinner for QR code loading
- Progress bar for bulk operations
- Disabled state for buttons during processing

**Feedback:**
- Immediate visual feedback on button clicks
- Success/error notifications
- Real-time progress updates
- Status badge changes

**Responsive Behavior:**
- Mobile: Single column, full-width cards, hamburger menu
- Tablet: Collapsible sidebar, adjusted spacing
- Desktop: Full sidebar visible, multi-column where appropriate

---

## Key UX Principles

1. **Progressive Disclosure**: Show QR login first, then data import, then message composition
2. **Clear State Indicators**: Always show WhatsApp connection status
3. **Error Prevention**: Validate phone numbers, confirm before sending, show message preview
4. **Undo/Pause**: Allow pausing bulk send operations
5. **Data Safety**: Confirm before leaving page during active sending

**Accessibility**: Consistent dark mode across all inputs, WCAG AA contrast ratios, keyboard navigation support, screen reader friendly status updates.