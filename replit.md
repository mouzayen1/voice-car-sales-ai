# AutoVoice AI - Voice-Driven Car Sales Assistant

## Overview
A voice-driven AI car sales assistant that uses OpenAI's APIs for speech-to-text (Whisper), conversational AI (GPT), and text-to-speech capabilities. Users can speak to the assistant to get information about vehicles, ask questions, and receive personalized recommendations.

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with Shadcn/UI components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Audio**: Web Audio API for voice recording and visualization

### Backend (Express + Node.js)
- **Framework**: Express.js
- **AI Integration**: OpenAI SDK (Whisper, GPT-5, TTS)
- **Storage**: In-memory storage for car inventory
- **File Uploads**: Multer for audio file handling

## Key Features

1. **Voice Input**: Press-to-talk microphone with real-time audio waveform visualization
2. **Speech-to-Text**: OpenAI Whisper API for accurate voice transcription
3. **AI Assistant**: GPT-5 powered sales assistant with knowledge of current inventory
4. **Text-to-Speech**: Natural voice responses using OpenAI TTS API
5. **Car Inventory**: Browse 8 sample vehicles with detailed specifications
6. **Theme Support**: Light/dark mode toggle

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/            # Shadcn UI components
│   │   ├── car-inventory.tsx
│   │   ├── conversation-display.tsx
│   │   ├── theme-toggle.tsx
│   │   └── voice-interface.tsx
│   ├── pages/
│   │   ├── home.tsx       # Main application page
│   │   └── not-found.tsx
│   ├── App.tsx
│   └── index.css
server/
├── index.ts               # Server entry point
├── routes.ts              # API endpoints
├── openai.ts              # OpenAI integration
├── storage.ts             # In-memory car storage
└── vite.ts                # Vite middleware
shared/
└── schema.ts              # Shared types and schemas
```

## API Endpoints

- `GET /api/config` - Check if OpenAI API is configured
- `GET /api/cars` - Get all cars in inventory
- `GET /api/cars/:id` - Get car by ID
- `GET /api/cars/search` - Search cars with filters
- `POST /api/transcribe` - Convert audio to text (Whisper)
- `POST /api/chat` - Send message and get AI response with TTS audio
- `POST /api/tts` - Convert text to speech

## Environment Variables

- `OPENAI_API_KEY` - Required for voice features

## Running the Application

```bash
npm run dev
```

The application runs on port 5000 and serves both frontend and backend.

## Recent Changes
- Initial implementation of voice-driven car sales assistant
- Added 8 sample vehicles with realistic data
- Implemented graceful error handling for missing API key
- Added theme toggle for light/dark mode support
