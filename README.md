# 🕷️ Spidy Task Automation Assistant

An intelligent, production-quality AI task automation and management platform built with **FastAPI** (Python), **SQLAlchemy**, **SQLite**, and **React 18** (Vite + Tailwind CSS). It empowers users to manage daily tasks via an interactive visual dashboard as well as through natural language instructions evaluated by an LLM-driven, controlled tool-calling engine.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow.svg)](https://python.org)
[![User Manual PDF](https://img.shields.io/badge/User_Manual-PDF_Download-purple.svg)](Spidy_Task_Automation_User_Manual.pdf)

---

## 📄 Documentation Links

- 📖 **Interactive Markdown Manual**: [`USER_MANUAL.md`](USER_MANUAL.md)
- 📑 **Official PDF User Manual**: [`Spidy_Task_Automation_User_Manual.pdf`](Spidy_Task_Automation_User_Manual.pdf)
- 🏛️ **Architecture & Implementation Plan**: [`implementation_plan.md`](implementation_plan.md)
- 🔍 **Verification Walkthrough**: [`walkthrough.md`](walkthrough.md)

---

## ✨ Core Features & Highlights

- 📋 **Visual Interactive Dashboard**: View task progress completion bars, urgency highlights, category filters (`Work`, `Project`, `Study`, `General`), search bar, and expandable subtask accordions.
- 🤖 **AI Natural-Language Assistant**: Talk to your assistant naturally (*"Remind me to submit my ML assignment tomorrow at 6 PM"*) to execute task operations.
- 🛠️ **Controlled Function Tool Engine**: Safe execution layer where the LLM selects function signatures (`create_task`, `complete_task`, `search_tasks`, `search_encyclopedia`, `get_weather_info`) with backend schema validation before updating SQLite.
- ⚙️ **Autonomous AI Subtask Solver Agent**: Converts high-level goals into subtasks, invokes the Gemini LLM solver for every subtask, generates concrete code/text deliverables (`solution_output`), and tracks execution states (*pending → in_progress → completed*).
- 📚 **Free Wikipedia Encyclopedia Knowledge Agent**: Queries free Wikipedia REST API to inject factual research summaries into chat context.
- 🌤️ **Free Open-Meteo Weather Agent**: Queries Open-Meteo API to return live weather forecasts.
- 🔑 **User Email Identity & Custom Gemini Credentials**: Isolated task records by Email ID and custom user Gemini API key configuration (`users.credentials` and `users.details`).
- 📊 **User Record & Analysis Profile**: Visual dashboard tracking user completion rate %, total LLM operations, subtasks solved by Gemini, and user activity history.
- 🎯 **AI Priority Engine**: Multi-factor task prioritization evaluating deadlines, urgency, effort, and status with explicit rationale explanations.
- ⏰ **Background Reminders**: APScheduler worker monitoring task due dates and alerting users to upcoming deadlines.

---

## 🚀 Quick Setup & Running Locally

### 1. Backend Setup (FastAPI + SQLite)

```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Unix / macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

- **Backend REST API**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup (React 18 + Vite)

```bash
cd frontend
npm install
npm run dev -- --port 5173
```

- **Frontend Dashboard**: `http://localhost:5173`

---

## ☁️ Deploy to Vercel

This repository is pre-configured for fullstack deployment on **Vercel** via [`vercel.json`](vercel.json) and serverless Python function entrypoint [`api/index.py`](api/index.py).

### Quick Deployment Steps:
1. **Push to GitHub**: Push this repository to your GitHub account (`Spidy-AI-automation`).
2. **Import in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and import `Spidy-AI-automation`.
   - Vercel automatically detects the root configuration and [`vercel.json`](vercel.json).
3. **Environment Variables**:
   - In the Vercel project settings under **Environment Variables**, add:
     - `GEMINI_API_KEY`: Your Google Gemini API Key.
     - *(Optional)* `DATABASE_URL`: PostgreSQL connection string (e.g. Neon, Supabase). If omitted, SQLite operates in `/tmp/tasks.db`.
4. **Deploy**:
   - Click **Deploy**. Vercel will build the React Vite frontend and deploy the FastAPI backend as Serverless Functions at `/api/*`.

---

## 🕸️ Spider-Man Costume Design & Suit HUD

- **Spider-Man Suit Aesthetic**: Iconic crimson red (`#e11d48`), cobalt armor blue (`#2563eb`), and carbon-fiber black base (`#070a12`) with hexagonal fabric mesh.
- **Expressive Mask Emblem**: Custom geometric mask with animated glowing white eye lenses.
- **Karen Suit HUD**: Live telemetry displaying web fluid status, system diagnostics, and patrol count.
- **Interactive Web Shooter**: Synthesizes 60FPS radial web spray animation with authentic "THWIP!" sound effects via Web Audio API.
- **Spider-Sense Threat Matrix**: Real-time visual radar highlighting critical and overdue patrol missions.

---

## 🌐 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/health` | Health check & service info |
| **POST** | `/api/users/login` | Register/login user by Email ID |
| **PUT** | `/api/users/credentials` | Save custom Gemini API credentials |
| **GET** | `/api/users/analytics` | Fetch task completion & LLM usage analytics |
| **GET** | `/api/tasks` | Filter & list tasks |
| **POST** | `/api/tasks` | Create a new task |
| **PATCH** | `/api/tasks/{id}` | Update task details |
| **DELETE** | `/api/tasks/{id}` | Remove task |
| **POST** | `/api/tasks/{id}/complete` | Mark task as completed |
| **POST** | `/api/ai/chat` | Natural language LLM tool execution |
| **POST** | `/api/ai/auto-execute-goal` | Autonomous subtask breakdown & LLM solver |
| **POST** | `/api/ai/solve-subtasks/{id}` | Solve subtasks under parent task |
| **POST** | `/api/ai/prioritize` | Multi-factor priority matrix & rationale |

---

## 🧪 Automated Testing

Run the Pytest suite for backend endpoints, database models, and tool execution safety:

```bash
cd backend
python -m pytest -v
```

---

*Spidy Task Automation Assistant — Built for safe, autonomous, and intelligent productivity.*
