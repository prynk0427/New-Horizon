# New Horizon 🌅
## AI-Powered Smart Tourism Web Application
### *Explore Beyond the Expected.*

New Horizon is a full-stack AI-powered travel planning platform built with React, TypeScript, FastAPI, and Google Gemini. It helps travellers discover destinations, generate personalized itineraries, check live weather, estimate budgets, and save trips — all in a premium, responsive interface.

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **AI Trip Planner** | Gemini AI generates day-by-day personalized itineraries with demo fallback |
| 2 | **Destination Explorer** | Curated destinations with search, filters, photos, and attraction details |
| 3 | **Live Weather** | Real-time forecasts from Open-Meteo with travel advice and packing tips |
| 4 | **Smart Budget Estimator** | Cost breakdown with Recharts visualization and editable categories |
| 5 | **Interactive Itinerary** | Edit, add, remove activities with day tabs and map view |
| 6 | **Interactive Map** | React Leaflet + OpenStreetMap with attraction markers |
| 7 | **Saved Trips** | Persistent trip management with edit, delete, and reopen |
| 8 | **Favourites** | Save and manage favourite destinations |

---

## 🛠 Technology Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, React Leaflet, Recharts, React Hook Form, Zod

**Backend:** Python 3.11+, FastAPI, Pydantic, SQLAlchemy, HTTPX, Uvicorn

**Database:** SQLite (local) / Supabase PostgreSQL (production)

**AI:** Google Gemini 1.5 Flash

**External APIs:** Open-Meteo (weather), Nominatim/OSM (geocoding)

**Deployment:** Vercel (frontend) · Render (backend) · Supabase (database)

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+

### 1. Clone the repository
```bash
git clone https://github.com/your-username/new-horizon.git
cd new-horizon
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the backend
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# The default VITE_API_BASE_URL=http://localhost:8000 is correct for local dev

# Start the frontend
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Optional* | Google Gemini API key. Without this, demo mode is used. |
| `DATABASE_URL` | Yes | SQLite: `sqlite:///./new_horizon.db` · PostgreSQL: `postgresql://...` |
| `FRONTEND_URL` | Yes | CORS allowed origin. Default: `http://localhost:5173` |
| `DEBUG` | No | `true` for development logging |

*Without `GEMINI_API_KEY`, all itineraries will be clearly labelled demo responses.

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend URL. Default: `http://localhost:8000` |

---

## 🌐 Production Deployment

### Architecture
```
User Browser → Vercel (React) → Render (FastAPI) → Supabase PostgreSQL
                                                  → Open-Meteo API
                                                  → Google Gemini AI
```

### Deployment Checklist

**1. Create Supabase Database**
- Go to [supabase.com](https://supabase.com) → New Project
- Get your connection string: `Project Settings → Database → Connection string (URI)`
- Copy the PostgreSQL URL

**2. Deploy Backend to Render**
- Push code to GitHub
- Go to [render.com](https://render.com) → New Web Service
- Connect your GitHub repository
- Set root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add environment variables:
  - `DATABASE_URL` = your Supabase PostgreSQL URL
  - `GEMINI_API_KEY` = your Google Gemini API key
  - `FRONTEND_URL` = your Vercel deployment URL (add after frontend deploys)
  - `DEBUG` = `false`

**3. Verify Backend Health**
- Visit: `https://your-backend.onrender.com/api/health`
- Should return: `{"status": "ok", "app": "New Horizon API", "ai_enabled": true/false}`

**4. Deploy Frontend to Vercel**
- Go to [vercel.com](https://vercel.com) → New Project
- Import your GitHub repository
- Set root directory: `frontend`
- Add environment variable:
  - `VITE_API_BASE_URL` = your Render backend URL (e.g. `https://new-horizon-backend.onrender.com`)
- Deploy

**5. Update Backend CORS**
- After Vercel deploys, get your frontend URL (e.g. `https://new-horizon.vercel.app`)
- Update `FRONTEND_URL` in Render environment variables
- Redeploy backend

**6. Verify Full Stack**
- Open your Vercel URL
- Navigate to Destinations — destinations should load
- Plan a trip — itinerary should generate (demo or AI)
- Save a trip — should persist
- Check weather — should show real forecast

---

## 🔑 Getting API Keys

### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click "Get API Key" → Create API Key
4. Copy the key to `GEMINI_API_KEY`

> Without this key, the app runs in **demo mode** — itineraries are sample responses clearly labelled as such. All other features work normally.

### Weather API
No API key needed! Open-Meteo is free and open.

### Map API
No API key needed! OpenStreetMap via React Leaflet is free.

---

## 📁 Project Structure

```
new-horizon/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout wrappers
│   │   ├── services/       # API client & service functions
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vercel.json
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI routers
│   │   ├── core/           # Config & settings
│   │   ├── db/             # Database connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── render.yaml
└── README.md
```

---

## ⚠️ Important Disclaimers

- **Budget estimates** are approximate regional averages, not live quotes
- **Hotel/restaurant suggestions** are illustrative categories, not live availability
- **AI itineraries** are suggestions, not professional travel advice
- **Weather data** is from Open-Meteo and accurate for near-term forecasts only
- **No booking functionality** — New Horizon is a planning tool only
- **No user authentication** in this demo version — all data is in a shared context

---

## 🏆 Built For

48-hour AI Hackathon — New Horizon demonstrates AI-powered travel planning with a focus on working features, real integrations, and a polished user experience.

---

*New Horizon — Explore Beyond the Expected.*
