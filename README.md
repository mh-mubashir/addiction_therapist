# Addiction Recovery Therapist Chatbot

A compassionate AI-powered chatbot designed to provide therapeutic support for individuals recovering from drug addiction. The chatbot uses Claude's API to deliver empathetic conversations while detecting potential relapse triggers through natural dialogue.

## Features

- **Compassionate AI Therapy**: Powered by Claude 3.5 Sonnet for natural, empathetic conversations
- **Trigger Detection**: Automatically identifies 6 categories of relapse triggers:
  - Celebratory/Positive (success-based rewards)
  - Environmental (location/situational triggers)
  - Social (peer pressure, social dynamics)
  - Emotional (stress, anxiety, depression)
  - Cognitive (thought patterns, mental associations)
  - Physiological (HALT states: Hungry, Angry, Lonely, Tired)
- **Real-time Coping Strategies**: Provides personalized coping strategies when triggers are detected
- **Session Tracking**: Maintains conversation history and trigger assessments in browser storage
- **Modern UI**: Clean, responsive design optimized for both desktop and mobile
- **Privacy-First**: All data stored locally in browser session

## Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- Claude API key from [Anthropic Console](https://console.anthropic.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd addiction_therapist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**
   ```bash
   cp env.example .env
   ```
   Then edit `.env` and add your Claude API key:
   ```
   VITE_CLAUDE_API_KEY=your-actual-api-key-here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Starting a Session
- The chatbot will greet you with a warm welcome message
- Simply type your thoughts, feelings, or concerns
- The AI will respond with supportive, therapeutic dialogue

### Trigger Detection
- The system automatically analyzes your messages for potential triggers
- When triggers are detected, you'll see:
  - An alert with the trigger category
  - Suggested coping strategies
  - A session summary showing detected trigger patterns

### Conversation Management
- **Clear Conversation**: Use the "Clear Conversation" button to start fresh
- **Session Persistence**: Your conversation history is automatically saved
- **Mobile Friendly**: Works seamlessly on phones and tablets

## Technical Architecture

### Frontend
- **React 18** with functional components and hooks
- **Vite** for fast development and building
- **CSS3** with modern styling and animations
- **Local Storage** for session persistence

### API Integration
- **Direct Claude API** calls using Anthropic's latest model
- **System Prompt** designed for addiction recovery therapy
- **Error Handling** with graceful fallbacks

### Trigger Detection
- **Keyword Analysis** based on 6 trigger categories
- **Confidence Scoring** for trigger assessments
- **Coping Strategy Database** with category-specific recommendations

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.jsx    # Main chat component
│   └── MessageBubble.jsx    # Individual message display
├── services/
│   ├── claudeAPI.js         # Claude API integration
│   └── triggerDetection.js  # Trigger analysis logic
├── data/
│   └── triggerQuestions.js  # Trigger assessment framework
├── App.jsx                  # Main application component
├── main.jsx                 # React entry point
└── index.css               # Global styles
```

## Configuration

### Environment Variables
- `VITE_CLAUDE_API_KEY`: Your Claude API key (required)

### Customization
- **Trigger Questions**: Modify `src/data/triggerQuestions.js` to adjust trigger detection
- **Coping Strategies**: Update strategies in `src/services/triggerDetection.js`
- **System Prompt**: Customize the therapeutic approach in `src/services/claudeAPI.js`

## Safety & Privacy

- **No Data Transmission**: All conversations stay in your browser
- **Session-Based Storage**: Data is cleared when you close the browser
- **No User Accounts**: No registration or personal data collection
- **Local Processing**: Trigger detection happens entirely in your browser

## Important Notes

⚠️ **This is a therapeutic support tool, not a replacement for professional treatment**

- Always consult with qualified healthcare professionals for addiction treatment
- Use this tool as a supplement to professional therapy
- If you're in crisis, contact emergency services or a crisis hotline
- The chatbot is designed for ongoing recovery support, not emergency intervention

## Development

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Code Style
- Follow React best practices
- Use functional components with hooks
- Maintain consistent error handling
- Add comments for complex logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and therapeutic support purposes. Please ensure compliance with local regulations regarding AI-powered health applications.

## Support

For technical issues or questions about the implementation, please open an issue in the repository.

---

**Remember**: Recovery is a journey, and you don't have to walk it alone. This tool is here to support you, but always reach out to professionals when you need additional help.

## Session Management

The system now supports multiple users with automatic session management:

- **30-minute session timeout** for inactivity
- **Automatic session cleanup** every 5 minutes
- **Session persistence** across page refreshes
- **Multi-device support** with unique session IDs

## Deployment to Vercel

### 1. Prepare for Deployment

1. **Update API URL** in `src/services/claudeAPI.js`:
   ```javascript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://addiction-therapist.vercel.app'  // Replace with your Vercel URL
     : 'http://localhost:3001';
   ```

2. **Set environment variables** in Vercel:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add: `CLAUDE_API_KEY` = your Claude API key

### 2. Deploy

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub** (recommended):
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically deploy on pushes

3. **Deploy via CLI**:
   ```bash
   vercel
   ```

### 3. Configuration

The `vercel.json` file is already configured to:
- Route API calls to the Node.js server
- Serve the React app for all other routes
- Handle both frontend and backend in one deployment

## API Endpoints

### Session Management
- `POST /api/session/create` - Create new session
- `GET /api/session/:sessionId/status` - Get session status
- `DELETE /api/session/:sessionId` - Delete session

### Chat
- `POST /api/chat` - Send message to Claude AI

### Health Check
- `GET /health` - Server health and status

## Session Timeout Behavior

- **30-minute timeout** for inactive sessions
- **Automatic cleanup** of expired sessions
- **Session status indicators** in the UI
- **Graceful handling** of expired sessions

## Security Considerations

- API keys are stored server-side only
- Sessions are stored in memory (not persistent)
- No sensitive data is logged
- CORS is configured for security