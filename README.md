# 🏠 Room Sathi - AI-Powered Room Matching Platform

A React Native mobile app with Python FastAPI backend featuring 5 AI agents for intelligent student housing matching.

## Features

- **🎯 AI Matching** - Compatibility scoring (0-100%) using Google LLM
- **🛡️ Red Flag Detection** - Safety checks for lifestyle conflicts
- **💬 Wingman AI** - Friendly personalized recommendations
- **📱 E-commerce Style UI** - Beautiful room cards with filters
- **🔐 Supabase Auth** - Secure user authentication

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Mobile App | React Native + Expo Router |
| Backend | Python FastAPI |
| Database | PostgreSQL (Supabase) |
| AI | Google Gemini LLM |

## Project Structure

```
Room Sathi/
├── mobile/          # React Native Expo app
├── backend/         # Python FastAPI with AI agents
└── database/        # Supabase PostgreSQL schema
```

## Quick Start

### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `database/schema.sql`
3. Copy your project URL and anon key

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your Supabase and Google API keys

# Run server
uvicorn app.main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 3. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env with your API URL and Supabase keys

# Run app
npx expo start
```

Scan QR code with Expo Go app on your phone.

## AI Agents API Endpoints

| Endpoint | Agent | Purpose |
|----------|-------|---------|
| POST `/api/agents/parse-profile` | Profile Reader | Parse text to structured profile |
| POST `/api/agents/score-match` | Match Scorer | Calculate compatibility |
| POST `/api/agents/detect-redflags` | Red Flag | Find conflicts |
| POST `/api/agents/wingman` | Wingman | Friendly explanations |
| POST `/api/agents/recommend-rooms` | Room Hunter | Personalized recommendations |

## Environment Variables

### Backend `.env`
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
GOOGLE_API_KEY=your-gemini-api-key
```

### Mobile `.env`
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://your-ip:8000/api
```

## User Roles

- **Buyer (Seeker)** - Students looking for rooms/roommates
- **Seller (Offerer)** - Students/landlords with rooms to rent

Both fill the same profile with lifestyle preferences for AI matching.

## License

MIT
