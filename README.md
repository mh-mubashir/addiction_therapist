# Recovery Support - AI-Powered Addiction Recovery Platform

A comprehensive, multi-user addiction recovery support platform powered by Claude AI, featuring semantic trigger detection, patient analytics, and personalized recovery tracking.

## 🚀 Features

### Phase 1: Database & Infrastructure
- **Supabase Integration**: Multi-user database with Row Level Security
- **Optimized Storage**: Free tier compatible with data truncation and retention policies
- **Patient Profiles**: Comprehensive user profiles with recovery stage tracking
- **Session Management**: Persistent conversation sessions with metadata



### Phase 2: Authentication System
- **User Registration**: Recovery-focused onboarding with addiction type and sobriety date
- **Secure Login**: Supabase Auth with email/password authentication
- **Profile Management**: Automatic patient profile creation and updates
- **Session Persistence**: Maintains user state across browser sessions

### Phase 3: Enhanced Chat Interface
- **Semantic Trigger Detection**: Claude AI-powered analysis of relapse risk
- **Structured Responses**: JSON-based trigger analysis with confidence scoring
- **Real-time Updates**: Live patient summary updates during conversations
- **Coping Strategies**: Contextual support for medium/high risk triggers
- **Database Integration**: Persistent message storage and session tracking

### Phase 4: Patient Dashboard
- **Trigger Analytics**: Visual breakdown of trigger categories and intensities
- **Recovery Progress**: Weekly trends and daily activity tracking
- **Conversation History**: Session summaries with risk level assessment
- **Patient Summary**: AI-generated insights and recovery metrics

### Phase 5: Navigation & App Structure
- **Responsive Design**: Mobile-optimized interface with modern UI
- **Protected Routes**: Authentication-based access control
- **Navigation System**: Intuitive app navigation with user context
- **Vercel Ready**: Optimized for deployment on Vercel platform

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Backend**: Node.js/Express server
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Anthropic Claude API
- **Styling**: CSS3 with responsive design
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier)
- Anthropic Claude API key

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd addiction_therapist
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
# Claude API Configuration
VITE_CLAUDE_API_KEY=your_claude_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration (for development)
PORT=3001
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and run the contents of `supabase-schema.sql`
4. Note your project URL and anon key for the environment variables

### 4. Start Development Server

```bash
# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start the frontend development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Schema

The application uses 5 main tables:

### `patient_profiles`
- User recovery information and preferences
- Live-updated patient summaries
- Recovery stage and metrics tracking

### `conversation_sessions`
- Chat session metadata and summaries
- Duration, message count, and risk assessment
- Primary concerns and session status

### `messages`
- Individual chat messages with trigger analysis
- Structured JSON responses from Claude AI
- Optimized storage for free tier limits

### `trigger_history`
- Detailed trigger detection records
- Context and coping strategy tracking
- Resolution and follow-up data

### `recovery_progress`
- Daily aggregated recovery metrics
- Mood and confidence tracking
- Weekly trend analysis

## 🔧 Configuration

### Supabase Free Tier Optimization

The application is optimized for Supabase's free tier limits:

- **500MB Database Storage**: Supports ~2,000 users
- **2GB Bandwidth/month**: Handles ~10,000 users
- **50,000 Monthly Active Users**: More than sufficient
- **0 Real-time Connections**: Uses polling instead of subscriptions

### Data Retention Policies

- Messages: 30-day retention for detailed conversations
- Triggers: 30-day retention for analysis data
- Progress: Unlimited retention for aggregated metrics
- Profiles: Unlimited retention for user data

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all environment variables in Vercel dashboard
3. **Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Deploy**: Vercel will automatically deploy on push to main branch

### Environment Variables for Production

```env
VITE_CLAUDE_API_KEY=your_production_claude_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Usage Guide

### For Users

1. **Registration**: Create account with recovery information
2. **Chat Interface**: Start conversations with AI therapist
3. **Dashboard**: Monitor progress and trigger patterns
4. **Profile Management**: Update preferences and recovery stage

### For Administrators

1. **Database Monitoring**: Check Supabase dashboard for usage
2. **User Management**: Monitor user activity and engagement
3. **Analytics**: Review trigger patterns and recovery trends
4. **Scaling**: Upgrade Supabase plan as needed

## 🔒 Security Features

- **Row Level Security**: Users can only access their own data
- **Authentication**: Secure Supabase Auth integration
- **Input Validation**: Client and server-side validation
- **Data Encryption**: Supabase handles data encryption
- **Session Management**: Secure session handling

## 📈 Scaling Considerations

### Free Tier Limits
- **Database**: 500MB (supports ~2,000 users)
- **Bandwidth**: 2GB/month (supports ~10,000 users)
- **Users**: 50,000 monthly active users

### Upgrade Path
1. **Supabase Pro**: $25/month for 8GB storage, 250GB bandwidth
2. **Supabase Team**: $599/month for enterprise features
3. **Custom Infrastructure**: Self-hosted PostgreSQL option

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all variables are set correctly
2. **Database Connection**: Verify Supabase URL and keys
3. **API Limits**: Check Claude API usage and limits
4. **Build Errors**: Ensure Node.js version compatibility

### Support

- Check Supabase documentation for database issues
- Review Anthropic API documentation for Claude integration
- Monitor Vercel deployment logs for build issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Anthropic**: Claude AI API for semantic analysis
- **Supabase**: Database and authentication infrastructure
- **Vercel**: Deployment and hosting platform
- **React**: Frontend framework and ecosystem

---

**Note**: This application is designed for addiction recovery support and should be used in conjunction with professional medical care. It is not a replacement for professional treatment.