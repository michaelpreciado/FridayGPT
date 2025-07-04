# Friday AI - JARVIS-Inspired Personal Assistant

A sleek, AI-first web app inspired by Tony Stark's JARVIS, featuring voice interaction, chat history, and smart home integration.

## ✨ Features

- **🎤 Voice I/O** - Web Speech API for natural voice conversations
- **🤖 GPT-4 Chat** - Streaming AI responses with conversation memory
- **🔐 Google OAuth** - Secure authentication with persistent chat history
- **📱 PWA Ready** - Install as a native app on any device
- **🏠 Smart Home** - Home Assistant integration (simulated)
- **📅 Calendar** - Google Calendar integration (simulated)
- **🎨 Glassmorphic UI** - Beautiful sci-fi interface with smooth animations
- **⚡ Performance** - Optimized for 60fps animations on mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- Firebase project (for auth & database)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/friday-ai.git
   cd friday-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # OpenAI API
   OPENAI_API_KEY=sk-your-openai-api-key

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and choose Google as a sign-in provider
3. Create a Firestore database
4. Copy your config values to `.env`

### OpenAI Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file

### Optional Integrations

#### Home Assistant
```env
HOME_ASSISTANT_URL=http://your-home-assistant:8123
HOME_ASSISTANT_TOKEN=your-long-lived-access-token
```

#### Google Calendar
```env
GOOGLE_CALENDAR_CLIENT_ID=your-google-client-id
GOOGLE_CALENDAR_CLIENT_SECRET=your-google-client-secret
```

## 🏗️ Project Structure

```
FridayGPT/
├── app/                    # Next.js App Router
│   ├── api/chat/          # Chat API endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── FridayCoreIcon.tsx # Animated core icon
│   └── ChatPanel.tsx      # Chat interface
├── lib/                   # Utilities
│   ├── auth.ts           # Firebase auth
│   ├── db.ts             # Firestore operations
│   ├── openai.ts         # OpenAI client
│   └── integrations/     # Smart home & calendar
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   └── icons/           # App icons
└── types/               # TypeScript declarations
```

## 🎨 UI/UX Features

### Core Icon Animation
- Concentric neon-blue rings with subtle glow
- Smooth transitions between states (inactive → active → listening)
- 60fps performance optimized for mobile

### Chat Interface
- Glassmorphic design with backdrop blur
- Streaming text responses
- Voice-to-text with visual feedback
- Text-to-speech for AI responses

### Responsive Design
- Mobile-first approach
- Full-screen chat on mobile
- Centered 600px pane on desktop
- Swipe-friendly interactions

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
   ```bash
   npx vercel
   ```

2. **Add environment variables in Vercel dashboard**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🧪 Testing Voice Features

### Browser Compatibility
- ✅ Chrome/Chromium (full support)
- ✅ Edge (full support)  
- ⚠️ Safari (limited support)
- ❌ Firefox (no speech recognition)

### Voice Commands Examples
- "Hello Friday, what's the weather like?"
- "Turn on the living room lights"
- "What's on my schedule today?"
- "Dim the bedroom lights to 30%"

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Framer Motion for animations

## 📱 PWA Features

- **Installable** - Add to home screen on any device
- **Offline Ready** - Basic shell works offline
- **Native Feel** - Full-screen, app-like experience
- **Fast Loading** - Optimized bundle size

## 🔌 Extending with Skills

Skills are modular integrations in `/lib/integrations/`. Each skill exports a `run()` function:

```typescript
// lib/integrations/mySkill.ts
export const run = async (action: string, params?: any) => {
  switch (action) {
    case 'my_action':
      return {
        success: true,
        message: 'Action completed!',
        data: { /* result data */ }
      }
    default:
      return { success: false, message: 'Unknown action' }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by JARVIS from the Iron Man films
- Built with [Next.js](https://nextjs.org/)
- UI components with [Tailwind CSS](https://tailwindcss.com/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- AI powered by [OpenAI](https://openai.com/)

---

**Built like Stark built the suit—sleek, fast, and a little show-offy.** ⚡ 