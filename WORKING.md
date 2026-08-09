# WORKING.md — AI Task Automation Assistant

This document defines the engineering workflow, architecture conventions, implementation order, and development rules for the project.

## 1. Development Philosophy

Follow:

> Build small → test → verify → document → expand.

Do not attempt to implement the entire product in one pass.

Every major feature should be independently functional before the next feature is started.

Prioritize:
1. Correctness
2. Maintainability
3. Usability
4. Performance
5. Visual polish

Avoid unnecessary complexity.

## 2. Repository Structure

Recommended structure:

```text
ai-task-automation-assistant/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tools/
│   │   ├── ai/
│   │   ├── database/
│   │   └── utils/
│   │
│   ├── tests/
│   └── requirements.txt
│
├── docs/
│
├── .env.example
├── README.md
├── PRD.md
└── WORKING.md
```

## 3. Backend Architecture

Use clear separation of responsibilities:

```text
API Layer
   ↓
Service Layer
   ↓
Repository / Database Layer
```

AI functionality remains separated:

```text
API
 ↓
AI Service
 ↓
LLM Provider
 ↓
Tool Selection
 ↓
Tool Validation
 ↓
Application Service
 ↓
Database
```

The AI layer must never bypass application services.

## 4. AI Service

Create a dedicated AI abstraction.

Conceptual interface:

```text
AIService
├── chat()
├── parse_intent()
├── generate_subtasks()
└── prioritize_tasks()
```

The rest of the application should not depend directly on a specific LLM provider.

## 5. Tool Layer

Each tool should define:
- name
- description
- input schema
- validation
- execution
- structured output

Never allow the LLM to execute database queries directly.

## 6. Database Rules

Task relationships must support parent-child subtasks (`parent_task_id`).

## 7. Implementation Order

Phase 1 — Backend Foundation  
Phase 2 — Task CRUD  
Phase 3 — Frontend Foundation  
Phase 4 — AI Integration  
Phase 5 — Tool Calling  
Phase 6 — Task Breakdown  
Phase 7 — AI Prioritization  
Phase 8 — Reminders  
Phase 9 — Testing  
Phase 10 — UI Polish & Final Verification  
