# Voice-Driven Car Sales AI Assistant - Design Guidelines

## Design Approach

**Hybrid Modern System**: Material Design foundation with custom voice interface elements, drawing inspiration from premium automotive digital experiences (Tesla, BMW configurators) and modern AI chat interfaces (ChatGPT, Perplexity).

**Core Principle**: Trust and technological sophistication - users need to feel confident conversing with an AI about major purchases.

---

## Typography System

**Font Stack**: 
- Primary: 'Inter' - Clean, modern sans-serif for UI elements and conversation text
- Display: 'Outfit' - Bold, contemporary for headings and car details
- Monospace: 'JetBrains Mono' - For technical details (VIN, specs)

**Hierarchy**:
- Hero/Main Title: text-5xl md:text-6xl font-bold (Outfit)
- Section Headers: text-3xl md:text-4xl font-semibold (Outfit)
- Car Titles: text-2xl font-bold (Outfit)
- Body Text: text-base leading-relaxed (Inter)
- Conversation Text: text-sm md:text-base leading-loose (Inter)
- Metadata/Specs: text-xs uppercase tracking-wide (Inter)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Micro-spacing: p-2, gap-2
- Standard elements: p-4, p-6, gap-4
- Section padding: py-12 md:py-16, px-4 md:px-8
- Major sections: py-16 md:py-24

**Grid Structure**:
- Main layout: Two-column on desktop (60/40 split) - Voice interface | Car inventory
- Mobile: Single column stack, voice interface priority
- Container: max-w-7xl mx-auto
- Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

---

## Component Library

### Voice Interface Components (Left/Primary Panel)

**Microphone Control Center**:
- Large circular button (w-24 h-24) with pulsing ring animation when active
- Start/Stop recording states with clear visual feedback
- Audio waveform visualization below microphone (canvas-based, 8-12 bars)
- Status indicator: "Listening...", "Processing...", "Speaking..."

**Conversation Display**:
- Chat-style message bubbles
- User messages: right-aligned, rounded-2xl, p-4
- AI responses: left-aligned, rounded-2xl, p-4, with avatar icon
- Timestamp: text-xs opacity-70
- Auto-scroll to latest message
- Max height with overflow-y-scroll
- Message spacing: gap-4

**Controls Bar**:
- Clear conversation button
- Volume control for TTS
- Speed control toggle
- Horizontal layout with gap-4

### Car Inventory Components (Right/Secondary Panel)

**Featured Vehicle Card** (highlighted current recommendation):
- Large featured image (aspect-ratio 16/9)
- Prominent pricing: text-4xl font-bold
- Key specs in grid: grid-cols-2 gap-4
- CTA button: "Schedule Test Drive"

**Inventory Grid**:
- 2-column on tablet, 3-column on large desktop
- Card structure:
  - Vehicle image (aspect-ratio 4/3)
  - Make/Model: text-xl font-bold
  - Year + Mileage: text-sm
  - Price: text-2xl font-semibold
  - Quick specs icons row (MPG, transmission, drive type)
  - Padding: p-6, gap-4
  - Rounded: rounded-xl
  - Hover lift effect

**Filter/Sort Bar**:
- Sticky top position
- Dropdown filters: Price range, Make, Year, Type
- Sort options: Price, Year, Mileage
- Horizontal layout with gap-4, py-4

### Global Components

**Header**:
- Fixed top, backdrop-blur
- Logo/Brand left
- "AI Sales Assistant" tagline center
- User status/settings right
- Height: h-16, px-8

**Empty States**:
- Microphone icon with "Press to start conversation"
- Suggested conversation starters: "Show me SUVs under $40k", "What's available in red?"
- Text: text-lg text-center, max-w-md mx-auto

---

## Images

**Hero Background** (Optional full-screen on landing):
- Premium automotive showroom interior or sleek vehicle photography
- Subtle overlay gradient for text readability
- Parallax scroll effect

**Car Inventory Images**:
- High-quality vehicle photos (exterior, 3/4 angle preferred)
- Consistent lighting and background
- Aspect ratio maintained across all cards
- Lazy loading for performance

**AI Avatar Icon**:
- Small circular icon (w-8 h-8) for AI messages
- Futuristic/tech-inspired design

---

## Interaction Patterns

**Voice Recording Flow**:
1. Idle state: Microphone button with subtle glow
2. Recording: Pulsing animation + waveform visualization
3. Processing: Spinner overlay
4. Response: AI message appears + optional TTS playback

**Conversation Interaction**:
- Smooth scroll animations
- Typing indicator dots while AI generates response
- Sound cues (subtle) for recording start/stop

**Car Card Interactions**:
- Hover: Slight elevation (shadow-lg), scale-105
- Click: Expands to detailed view modal or navigates to detail page
- Quick action buttons appear on hover

---

## Accessibility

- ARIA labels on all interactive voice controls
- Keyboard shortcuts: Space to start/stop recording, Escape to cancel
- Focus states: 2px ring offset
- Minimum touch target: 44x44px for mobile
- Transcript alternative for all voice interactions
- High contrast mode support

---

## Mobile Optimization

**Breakpoints**:
- Mobile: < 768px - Full width voice interface, stacked layout
- Tablet: 768px - 1024px - Side-by-side but condensed
- Desktop: > 1024px - Full two-panel experience

**Mobile-Specific**:
- Bottom-fixed microphone button for thumb accessibility
- Swipeable car cards (horizontal scroll)
- Collapsible conversation history
- Simplified filter controls (drawer pattern)

---

## Animation Strategy

**Minimal, Purposeful**:
- Microphone pulse when active (2s loop)
- Waveform reactive to audio input
- Message slide-in (200ms ease-out)
- Card hover lift (150ms ease-in-out)
- No page transition animations

---

This design creates a premium, trustworthy environment for voice-driven car sales, balancing technological sophistication with automotive industry expectations. The split-panel layout maintains conversation flow while browsing inventory, and voice visualization provides essential feedback for the core interaction model.