# Spidy Task Automation Assistant

An intelligent task management and automation platform built with **FastAPI** (Python), **SQLAlchemy**, and **React** (Vite + Tailwind CSS). It empowers users to manage daily tasks via an interactive visual dashboard as well as through natural language instructions evaluated by an LLM-driven, tool-calling engine.

---

## Features

- 📋 **Complete Task Management**: Create, view, filter, edit, delete, and complete tasks with priority levels, categories, due dates, and parent-child subtasks.
- 🤖 **AI Natural-Language Assistant**: Talk to your assistant naturally ("Remind me to submit my ML assignment tomorrow at 6 PM") to perform CRUD operations.
- 🛠️ **Controlled Tool-Calling Engine**: Safe execution layer where the LLM selects function signatures (`create_task`, `complete_task`, `search_tasks`, etc.) with backend schema validation before updating SQLite.
- 🧩 **AI Task Breakdown**: High-level goal decomposition into actionable subtasks with an interactive review & confirm UI before database commitment.
- 🎯 **AI Priority Engine**: Multi-factor task prioritization evaluating deadlines, urgency, effort, and status with explicit rationale explanations.
- ⏰ **Reminder Mechanism**: Background scheduler monitoring task due dates and alerting users to upcoming deadlines.
- 🔒 **Security & Reliability**: No arbitrary code/SQL execution, full input sanitization, and structured Pydantic validation.

---

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, SQLite, Pydantic v2, Pytest, APScheduler / Asyncio background worker.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Axios.
- **AI Layer**: Abstraction service (`AIService`) supporting Google Gemini API / OpenAI API with fallback logic.

---

## Quick Setup & Running Locally

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Unix:
source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend server will run at: `http://127.0.0.1:8000`  
API Documentation (Swagger): `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend dashboard will run at: `http://localhost:5173`

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/api/tasks` | List tasks (with filter params) |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/{id}` | Get specific task |
| PATCH | `/api/tasks/{id}` | Update task details |
| DELETE | `/api/tasks/{id}` | Delete task |
| POST | `/api/tasks/{id}/complete` | Mark task as completed |
| POST | `/api/ai/chat` | Process natural language chat & tools |
| POST | `/api/ai/task-breakdown` | Generate AI subtask breakdown |
| POST | `/api/ai/prioritize` | Generate task priority matrix & rationale |

---

## Testing

```bash
cd backend
pytest -v
```
