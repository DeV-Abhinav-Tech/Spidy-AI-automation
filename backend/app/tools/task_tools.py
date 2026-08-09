from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.services.task_service import TaskService
from app.schemas.task import TaskCreate, TaskUpdate

# Declarations for LLM Tool Registry
TOOL_DECLARATIONS = [
    {
        "name": "create_task",
        "description": "Create a new task in the user's task list.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING", "description": "Short title of the task"},
                "description": {"type": "STRING", "description": "Detailed description of the task"},
                "priority": {"type": "STRING", "enum": ["low", "medium", "high"], "description": "Task priority level"},
                "category": {"type": "STRING", "description": "Task category e.g. Academic, Personal, Work, Project"},
                "due_date": {"type": "STRING", "description": "Due date in YYYY-MM-DD format"},
                "due_time": {"type": "STRING", "description": "Due time in HH:MM format"}
            },
            "required": ["title"]
        }
    },
    {
        "name": "update_task",
        "description": "Update an existing task by its integer task_id.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "task_id": {"type": "INTEGER", "description": "The ID of the task to update"},
                "title": {"type": "STRING"},
                "description": {"type": "STRING"},
                "status": {"type": "STRING", "enum": ["pending", "completed"]},
                "priority": {"type": "STRING", "enum": ["low", "medium", "high"]},
                "category": {"type": "STRING"},
                "due_date": {"type": "STRING"},
                "due_time": {"type": "STRING"}
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "delete_task",
        "description": "Permanently delete a task by its task_id.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "task_id": {"type": "INTEGER", "description": "The ID of the task to delete"}
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "complete_task",
        "description": "Mark a task as completed using its task_id.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "task_id": {"type": "INTEGER", "description": "The ID of the task to complete"}
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "get_tasks",
        "description": "Retrieve tasks filtered by status, priority, or category.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "status": {"type": "STRING", "description": "Filter by status e.g. pending, completed"},
                "priority": {"type": "STRING", "description": "Filter by priority e.g. low, medium, high"},
                "category": {"type": "STRING", "description": "Filter by category name"}
            }
        }
    },
    {
        "name": "search_tasks",
        "description": "Search for tasks by a text search query string.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {"type": "STRING", "description": "Text to search in task title or description"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "create_subtasks",
        "description": "Decompose a parent task into subtasks.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "parent_task_id": {"type": "INTEGER", "description": "ID of parent task"},
                "subtask_titles": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "List of subtask title strings"
                }
            },
            "required": ["parent_task_id", "subtask_titles"]
        }
    },
    {
        "name": "search_encyclopedia",
        "description": "Search free Wikipedia encyclopedia API for research summaries and background facts to aid task planning.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {"type": "STRING", "description": "Topic, concept, or subject to look up"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_weather_info",
        "description": "Fetch free weather forecast data for a city using Open-Meteo API.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "city": {"type": "STRING", "description": "City name e.g. London, Tokyo, New York, Delhi"}
            },
            "required": ["city"]
        }
    }
]

class ToolExecutor:
    @staticmethod
    def execute(tool_name: str, arguments: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """Validates arguments and executes backend task operation securely."""
        try:
            if tool_name == "create_task":
                title = arguments.get("title")
                if not title:
                    return {"success": False, "error": "Missing required argument 'title'"}
                task_data = TaskCreate(
                    title=title,
                    description=arguments.get("description"),
                    priority=arguments.get("priority", "medium"),
                    category=arguments.get("category", "general"),
                    due_date=arguments.get("due_date"),
                    due_time=arguments.get("due_time")
                )
                task = TaskService.create_task(db, task_data)
                return {
                    "success": True,
                    "message": f"Task '{task.title}' created successfully (ID: {task.id}).",
                    "task": {
                        "id": task.id,
                        "title": task.title,
                        "status": task.status,
                        "priority": task.priority,
                        "due_date": task.due_date,
                        "due_time": task.due_time
                    }
                }

            elif tool_name == "update_task":
                task_id = arguments.get("task_id")
                if not task_id:
                    return {"success": False, "error": "Missing required argument 'task_id'"}
                update_data = TaskUpdate(
                    title=arguments.get("title"),
                    description=arguments.get("description"),
                    status=arguments.get("status"),
                    priority=arguments.get("priority"),
                    category=arguments.get("category"),
                    due_date=arguments.get("due_date"),
                    due_time=arguments.get("due_time")
                )
                updated = TaskService.update_task(db, int(task_id), update_data)
                if not updated:
                    return {"success": False, "error": f"Task with ID {task_id} not found."}
                return {
                    "success": True,
                    "message": f"Task ID {task_id} updated successfully.",
                    "task": {"id": updated.id, "title": updated.title, "status": updated.status, "priority": updated.priority}
                }

            elif tool_name == "delete_task":
                task_id = arguments.get("task_id")
                if not task_id:
                    return {"success": False, "error": "Missing required argument 'task_id'"}
                success = TaskService.delete_task(db, int(task_id))
                if not success:
                    return {"success": False, "error": f"Task with ID {task_id} not found."}
                return {"success": True, "message": f"Task ID {task_id} deleted successfully."}

            elif tool_name == "complete_task":
                task_id = arguments.get("task_id")
                if not task_id:
                    return {"success": False, "error": "Missing required argument 'task_id'"}
                task = TaskService.complete_task(db, int(task_id))
                if not task:
                    return {"success": False, "error": f"Task with ID {task_id} not found."}
                return {"success": True, "message": f"Task '{task.title}' marked as completed.", "task_id": task.id}

            elif tool_name == "get_tasks":
                tasks = TaskService.get_tasks(
                    db,
                    status=arguments.get("status"),
                    priority=arguments.get("priority"),
                    category=arguments.get("category")
                )
                tasks_summary = [
                    {"id": t.id, "title": t.title, "status": t.status, "priority": t.priority, "due_date": t.due_date}
                    for t in tasks
                ]
                return {"success": True, "count": len(tasks_summary), "tasks": tasks_summary}

            elif tool_name == "search_tasks":
                query = arguments.get("query")
                if not query:
                    return {"success": False, "error": "Missing required search query"}
                tasks = TaskService.get_tasks(db, search=query)
                tasks_summary = [
                    {"id": t.id, "title": t.title, "status": t.status, "priority": t.priority, "due_date": t.due_date}
                    for t in tasks
                ]
                return {"success": True, "count": len(tasks_summary), "query": query, "tasks": tasks_summary}

            elif tool_name == "create_subtasks":
                parent_id = arguments.get("parent_task_id")
                titles = arguments.get("subtask_titles", [])
                if not parent_id or not titles:
                    return {"success": False, "error": "parent_task_id and subtask_titles are required"}
                subtasks_dict = [{"title": t} for t in titles]
                created = TaskService.create_subtasks(db, int(parent_id), subtasks_dict)
                return {
                    "success": True,
                    "message": f"Created {len(created)} subtasks under Task ID {parent_id}.",
                    "subtasks": [{"id": st.id, "title": st.title} for st in created]
                }

            elif tool_name == "search_encyclopedia":
                query = arguments.get("query")
                if not query:
                    return {"success": False, "error": "Missing required query argument"}
                import httpx
                headers = {"User-Agent": "AITaskAutomationAssistant/1.0 (student@example.com)"}
                wiki_title = query.strip().title().replace(' ', '_')
                wiki_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{wiki_title}"
                resp = httpx.get(wiki_url, headers=headers, timeout=5.0)
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "success": True,
                        "query": query,
                        "title": data.get("title"),
                        "summary": data.get("extract"),
                        "description": data.get("description")
                    }
                else:
                    return {"success": False, "error": f"Topic '{query}' not found on Encyclopedia API."}

            elif tool_name == "get_weather_info":
                city = arguments.get("city")
                if not city:
                    return {"success": False, "error": "Missing required city argument"}
                import httpx
                geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
                geo_resp = httpx.get(geo_url, timeout=5.0)
                if geo_resp.status_code == 200 and geo_resp.json().get("results"):
                    loc = geo_resp.json()["results"][0]
                    lat, lon = loc["latitude"], loc["longitude"]
                    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
                    w_resp = httpx.get(weather_url, timeout=5.0)
                    if w_resp.status_code == 200:
                        cw = w_resp.json().get("current_weather", {})
                        return {
                            "success": True,
                            "city": loc.get("name"),
                            "country": loc.get("country"),
                            "temperature_c": cw.get("temperature"),
                            "windspeed": cw.get("windspeed"),
                            "weather_code": cw.get("weathercode")
                        }
                return {"success": False, "error": f"Could not fetch weather forecast for '{city}'."}

            else:
                return {"success": False, "error": f"Unknown tool name '{tool_name}'"}

        except Exception as e:
            return {"success": False, "error": f"Error executing {tool_name}: {str(e)}"}
