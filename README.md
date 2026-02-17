<p align="center">
  <img src="frontend/public/favicon.svg" width="80" height="80" alt="InterviewIQ Logo" />
</p>

<h1 align="center">InterviewIQ</h1>

<p align="center">
  <strong>AI-Powered Real-Time Interview Simulator</strong><br/>
  Practice smarter, not harder.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Flask-2.3-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/Chart.js-4.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/status-Active-brightgreen?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/questions-34+-blueviolet?style=flat-square" alt="Questions" />
  <img src="https://img.shields.io/badge/roles-6-blue?style=flat-square" alt="Roles" />
</p>

---

## ✨ Overview

**InterviewIQ** is a full-stack AI-powered interview simulator that helps developers practice technical interviews with timed questions, multi-dimensional AI scoring, and real-time performance analytics. Built with a premium light 3D glassmorphism UI and an animated floating nodes constellation hero section.

<br/>

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| ⏱ **Timed Rounds** | Real interview pressure with countdown timer and pulse alerts under 10 seconds |
| 🧠 **AI Scoring Engine** | 4-dimension evaluation — keyword coverage (45%), depth (25%), structure (15%), vocabulary richness (15%) |
| 📊 **Real-Time Analytics** | Score timeseries, role comparisons, strength/weakness frequency maps, trend detection |
| 🎯 **Targeted Feedback** | Actionable tips per question with strengths and areas for improvement |
| 🔬 **Multi-Role Question Bank** | 34+ curated questions across 6 tech roles |
| 🛡️ **Difficulty Levels** | Easy, Medium, Hard — difficulty-weighted scoring rewards deeper answers |
| 🔐 **JWT Authentication** | Secure user accounts with token-based auth |
| 🎨 **Premium 3D UI** | Light glassmorphism theme with floating nodes, 3D card transforms, and smooth animations |

<br/>

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI |
| **Vite 5** | Lightning-fast HMR & bundling |
| **React Router v6** | Client-side routing |
| **Chart.js + react-chartjs-2** | Performance analytics charts |
| **Axios** | HTTP client with auth interceptor |
| **CSS3** | Custom 3D glassmorphism theme, keyframe animations |

### Backend
| Technology | Purpose |
|------------|---------|
| **Flask 2.3** | REST API server |
| **PyJWT** | JWT token generation & verification |
| **Flask-CORS** | Cross-origin request handling |
| **JSON File Storage** | Lightweight data persistence with file locking (`fcntl`) |

<br/>

## 📁 Project Structure

```
InterviewIQ/
├── backend/
│   ├── app.py              # Flask API — 8 REST endpoints
│   ├── helpers.py           # AI scoring engine, analytics, file I/O with locking
│   ├── questions.json       # 34 curated questions across 6 roles
│   ├── users.json           # User accounts (auto-created)
│   ├── interviews.json      # Interview history (auto-created)
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Python virtual environment
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg      # 3D hexagon neural network logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx   # Nav bar with 3D logo, auth-aware links
│   │   │   └── Footer.jsx   # Branded footer
│   │   ├── pages/
│   │   │   ├── Landing.jsx  # Hero with floating 3D nodes constellation
│   │   │   ├── Auth.jsx     # Login / Register card
│   │   │   ├── Dashboard.jsx# Role selector, questions, performance ring
│   │   │   ├── Interview.jsx# Timed question with textarea & live word count
│   │   │   ├── Results.jsx  # Score ring, strengths/weaknesses, feedback
│   │   │   └── Analytics.jsx# Charts, stats grid, trend badges
│   │   ├── utils/
│   │   │   ├── api.js       # Axios instance with auto token restore
│   │   │   └── AuthContext.jsx # React Context for shared auth state
│   │   ├── App.jsx          # Route definitions
│   │   ├── main.jsx         # Entry point with AuthProvider
│   │   └── styles.css       # Premium light 3D theme
│   ├── index.html           # HTML shell with fonts & meta
│   ├── package.json
│   └── vite.config.js       # Vite config with API proxy
│
└── README.md
```

<br/>

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/RaoMitesh21/1hrs-Full-Stack-Challange.git
cd 1hrs-Full-Stack-Challange
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Initialize data files
echo '[]' > users.json
echo '[]' > interviews.json

# Start Flask server
python app.py
```

> Backend runs at **http://localhost:5001**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

> Frontend runs at **http://localhost:5173**

### 4. Open the App

Navigate to **http://localhost:5173** — register an account and start practicing!

<br/>

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create a new user account |
| `POST` | `/login` | ❌ | Authenticate and receive JWT token |
| `GET` | `/questions` | ✅ | List questions (filter by `role`, `difficulty`) |
| `GET` | `/roles` | ✅ | Available roles with question counts |
| `POST` | `/submit` | ✅ | Submit answer → returns AI evaluation |
| `GET` | `/history` | ✅ | User's interview history (supports `?limit=N`) |
| `GET` | `/history/<id>` | ✅ | Single interview record by ID |
| `GET` | `/analytics` | ✅ | Rich performance analytics with trends |

<br/>

## 🧠 AI Scoring Algorithm

Each answer is evaluated across **4 dimensions**:

```
┌─────────────────────────────────────────────────┐
│  Dimension         │  Weight  │  Measures        │
├─────────────────────────────────────────────────┤
│  Keyword Coverage  │   45%    │  Expected terms  │
│  Depth & Detail    │   25%    │  Word count,     │
│                    │          │  explanation len  │
│  Structure         │   15%    │  Paragraphs,     │
│                    │          │  logical flow     │
│  Vocabulary        │   15%    │  Technical term   │
│                    │          │  richness         │
└─────────────────────────────────────────────────┘
```

Scores are difficulty-weighted:
- **Easy** → standard scoring
- **Medium** → stricter keyword requirements
- **Hard** → demands depth, structure, and breadth

<br/>

## 🎨 Design System

| Element | Value |
|---------|-------|
| **Primary Font** | Clash Display (headlines) |
| **Body Font** | Inter (body text) |
| **Accent Color** | `#6366f1` (Indigo) |
| **Secondary Accent** | `#8b5cf6` (Violet) |
| **Background** | `#f8fafc` (Light slate) |
| **Card Style** | White panels with 3D box-shadows |
| **Animations** | `perspective()` transforms, floating keyframes, reveal-up entries |
| **Hero** | Canvas-rendered floating nodes constellation with traveling particles |

<br/>

## 📊 Available Roles

| Role | Questions | Icon |
|------|-----------|------|
| Frontend | 6 | 🖥️ |
| Backend | 6 | ⚙️ |
| Full-Stack | 6 | 🔗 |
| Machine Learning | 6 | 🧠 |
| DevOps | 5 | 🚀 |
| System Design | 5 | 🏗️ |

<br/>

## 🛠️ Development

```bash
# Run both servers simultaneously (in separate terminals)

# Terminal 1 — Backend
cd backend && source venv/bin/activate && python app.py

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Build for Production

```bash
cd frontend
npm run build     # Output in frontend/dist/
npm run preview   # Preview production build locally
```

<br/>

## 📝 Environment Notes

| Setting | Value |
|---------|-------|
| Backend Port | `5001` (avoids macOS AirPlay conflict on 5000) |
| Frontend Port | `5173` (Vite default) |
| JWT Expiry | 7 days |
| Data Storage | JSON files with `fcntl` file locking |

<br/>

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br/>

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

<br/>

---

<p align="center">
  <strong>InterviewIQ</strong> — Practice smarter, not harder.<br/>
  Built with ❤️ by <a href="https://github.com/RaoMitesh21">Mitesh Rao</a>
</p>
