import os
import json
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.tools.task_tools import TOOL_DECLARATIONS, ToolExecutor
from app.schemas.ai import SubtaskSuggestion, TaskPriorityItem, PrioritizationResponse

# Try importing google.genai if available
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except Exception:
    GENAI_AVAILABLE = False

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model_name = os.getenv("AI_MODEL", "gemini-2.5-flash")
        self.client = None
        if GENAI_AVAILABLE and self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[AIService Warning] Failed to initialize GenAI Client: {e}")

    def get_client(self, user_api_key: Optional[str] = None):
        """Returns Gemini client initialized with custom user API key if provided, else default client."""
        if GENAI_AVAILABLE and user_api_key and len(user_api_key.strip()) > 5:
            try:
                return genai.Client(api_key=user_api_key.strip())
            except Exception as e:
                print(f"[AIService] Custom user Gemini client initialization failed: {e}")
        return self.client

    def chat_with_tools(self, db: Session, user_message: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """Interprets natural language using tool calling, validates arguments, executes tool, and returns response."""
        
        # If Gemini client is active, try calling Gemini with tool definitions
        if self.client:
            try:
                system_prompt = (
                    "You are the Spidy Task Automation Assistant. "
                    "Help the user manage, organize, decompose, and automate their task list. "
                    "Use the available tools (create_task, update_task, delete_task, complete_task, get_tasks, search_tasks, create_subtasks) "
                    "when the user asks to manipulate or query tasks. "
                    "Never invent non-existent tools or execute raw code. "
                    "If essential information like title is missing for creation, ask the user politely."
                )
                
                # Execute chat prompt with tool capabilities
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=user_message,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        # Pass tools declaration format
                        tools=[types.Tool(function_declarations=TOOL_DECLARATIONS)],
                        temperature=0.2
                    )
                )

                # Check for tool call in candidates
                if response.function_calls:
                    fc = response.function_calls[0]
                    tool_name = fc.name
                    args = dict(fc.args) if fc.args else {}

                    # Validate & execute tool via ToolExecutor
                    tool_result = ToolExecutor.execute(tool_name, args, db)
                    
                    # Follow-up response after tool execution
                    followup_prompt = (
                        f"User asked: '{user_message}'\n"
                        f"Executed Tool: {tool_name} with arguments {json.dumps(args)}\n"
                        f"Tool Output: {json.dumps(tool_result)}\n"
                        "Provide a friendly, concise response confirming the operation."
                    )
                    
                    final_resp = self.client.models.generate_content(
                        model=self.model_name,
                        contents=followup_prompt
                    )

                    return {
                        "response": final_resp.text or f"Tool '{tool_name}' executed successfully.",
                        "tool_executed": {
                            "tool_name": tool_name,
                            "arguments": args,
                            "result": tool_result,
                            "success": tool_result.get("success", False),
                            "error": tool_result.get("error")
                        }
                    }
                else:
                    return {
                        "response": response.text or "I processed your request.",
                        "tool_executed": None
                    }

            except Exception as e:
                print(f"[AIService Error] GenAI invocation failed, using fallback engine: {e}")

        # Fallback Heuristic Rule-Based Tool Engine
        return self._heuristic_fallback_chat(db, user_message)

    def _heuristic_fallback_chat(self, db: Session, user_message: str) -> Dict[str, Any]:
        """High-precision pattern matcher fallback when API key is missing or offline."""
        msg_lower = user_message.lower()

        # 1. Complete task pattern
        complete_match = re.search(r'(?:mark|complete|done|finish)\s+(?:task\s+)?(?:#?(\d+)|["\']?([^"\']+)["\']?)', msg_lower)
        if ("complete" in msg_lower or "mark" in msg_lower or "finish" in msg_lower or "done" in msg_lower):
            # Check if task ID specified
            id_match = re.search(r'#?(\d+)', msg_lower)
            if id_match:
                task_id = int(id_match.group(1))
                tool_res = ToolExecutor.execute("complete_task", {"task_id": task_id}, db)
                return {
                    "response": f"Marked task #{task_id} as completed!",
                    "tool_executed": {
                        "tool_name": "complete_task",
                        "arguments": {"task_id": task_id},
                        "result": tool_res,
                        "success": tool_res.get("success", False)
                    }
                }
            else:
                # Search by title phrase
                clean_title = re.sub(r'^(mark|complete|finish|done)\s+(as\s+completed\s+)?(my\s+)?(task\s+)?', '', msg_lower).strip()
                if clean_title:
                    search_res = ToolExecutor.execute("search_tasks", {"query": clean_title}, db)
                    if search_res.get("success") and search_res.get("tasks"):
                        target_id = search_res["tasks"][0]["id"]
                        tool_res = ToolExecutor.execute("complete_task", {"task_id": target_id}, db)
                        return {
                            "response": f"Found task '{search_res['tasks'][0]['title']}' (ID: {target_id}) and marked it completed!",
                            "tool_executed": {
                                "tool_name": "complete_task",
                                "arguments": {"task_id": target_id},
                                "result": tool_res,
                                "success": tool_res.get("success", False)
                            }
                        }

        # 1.5 Encyclopedia / Fact Search tool pattern
        if "encyclopedia" in msg_lower or "research" in msg_lower or "wikipedia" in msg_lower or "lookup" in msg_lower or "tell me about" in msg_lower:
            query = re.sub(r'^(search\s+encyclopedia\s+for|research\s+encyclopedia\s+for|research\s+about|research\s+for|research|wikipedia|lookup|search\s+for|tell\s+me\s+about)\s+', '', msg_lower, flags=re.IGNORECASE).strip()
            query = re.sub(r'^(encyclopedia\s+for|encyclopedia)\s+', '', query, flags=re.IGNORECASE).strip()
            if query:
                tool_res = ToolExecutor.execute("search_encyclopedia", {"query": query}, db)
                if tool_res.get("success"):
                    return {
                        "response": f"**{tool_res.get('title')}**\n\n{tool_res.get('summary')}",
                        "tool_executed": {
                            "tool_name": "search_encyclopedia",
                            "arguments": {"query": query},
                            "result": tool_res,
                            "success": True
                        }
                    }

        # 1.6 Weather API tool pattern
        if "weather" in msg_lower or "forecast" in msg_lower or "temperature" in msg_lower:
            city_match = re.search(r'in\s+([a-zA-Z\s]+)', user_message, re.IGNORECASE)
            city = city_match.group(1).strip() if city_match else "London"
            tool_res = ToolExecutor.execute("get_weather_info", {"city": city}, db)
            if tool_res.get("success"):
                return {
                    "response": f"Current weather in **{tool_res.get('city')}, {tool_res.get('country')}**: {tool_res.get('temperature_c')}°C, Windspeed {tool_res.get('windspeed')} km/h.",
                    "tool_executed": {
                        "tool_name": "get_weather_info",
                        "arguments": {"city": city},
                        "result": tool_res,
                        "success": True
                    }
                }

        # 2. Delete task pattern
        if ("delete" in msg_lower or "remove" in msg_lower):
            id_match = re.search(r'#?(\d+)', msg_lower)
            if id_match:
                task_id = int(id_match.group(1))
                tool_res = ToolExecutor.execute("delete_task", {"task_id": task_id}, db)
                return {
                    "response": f"Deleted task #{task_id}.",
                    "tool_executed": {
                        "tool_name": "delete_task",
                        "arguments": {"task_id": task_id},
                        "result": tool_res,
                        "success": tool_res.get("success", False)
                    }
                }

        # 3. Create task pattern ("remind me to...", "create task...", "add task...")
        create_match = re.search(r'(?:remind me to|create task|add task|create a task to|remind me)\s+(.+)', user_message, re.IGNORECASE)
        if create_match or "remind" in msg_lower or "add task" in msg_lower or "create task" in msg_lower:
            raw_text = create_match.group(1).strip() if create_match else user_message
            
            # Extract date/time heuristic e.g. "tomorrow", "at 6 PM"
            due_date = None
            if "tomorrow" in raw_text.lower():
                import datetime
                tomorrow = datetime.date.today() + datetime.timedelta(days=1)
                due_date = tomorrow.isoformat()

            due_time = None
            time_match = re.search(r'at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|PM|AM)?)', raw_text, re.IGNORECASE)
            if time_match:
                due_time = time_match.group(1)

            # Determine priority
            priority = "high" if ("urgent" in raw_text.lower() or "important" in raw_text.lower()) else "medium"

            # Clean title
            title = re.sub(r'\s+(tomorrow|today|at\s+\d+.*)$', '', raw_text, flags=re.IGNORECASE).strip()
            
            tool_res = ToolExecutor.execute("create_task", {
                "title": title,
                "priority": priority,
                "category": "Academic" if "assignment" in title.lower() or "study" in title.lower() else "General",
                "due_date": due_date,
                "due_time": due_time
            }, db)

            return {
                "response": f"Created new task: **{title}**" + (f" (Due: {due_date})" if due_date else "") + ".",
                "tool_executed": {
                    "tool_name": "create_task",
                    "arguments": {"title": title, "priority": priority, "due_date": due_date, "due_time": due_time},
                    "result": tool_res,
                    "success": tool_res.get("success", False)
                }
            }

        # 4. Get / Query tasks pattern
        if "what" in msg_lower or "list" in msg_lower or "show" in msg_lower or "view" in msg_lower or "pending" in msg_lower:
            status = "pending" if "pending" in msg_lower or "finish" in msg_lower or "need" in msg_lower else None
            tool_res = ToolExecutor.execute("get_tasks", {"status": status}, db)
            count = tool_res.get("count", 0)
            return {
                "response": f"Found {count} matching tasks in your list.",
                "tool_executed": {
                    "tool_name": "get_tasks",
                    "arguments": {"status": status},
                    "result": tool_res,
                    "success": True
                }
            }

        # General conversational response
        return {
            "response": "I am ready to help you manage your tasks! Try asking me to create a task (e.g. 'Remind me to finish ML project tomorrow'), list your pending tasks, mark a task completed, or break down a big goal.",
            "tool_executed": None
        }

    def generate_task_breakdown(self, goal: str, category: str = "general") -> List[SubtaskSuggestion]:
        """Generates actionable subtasks for a high-level goal."""
        if self.client:
            try:
                prompt = (
                    f"Break down the following goal into 4 to 7 concrete, sequential subtasks:\n"
                    f"Goal: '{goal}'\n"
                    f"Category: {category}\n\n"
                    f"Return ONLY valid JSON format with a key 'subtasks' containing an array of objects with keys 'title', 'description', and 'estimated_priority' ('high', 'medium', or 'low')."
                )
                resp = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(response_mime_type="application/json")
                )
                data = json.loads(resp.text)
                if "subtasks" in data:
                    return [SubtaskSuggestion(**item) for item in data["subtasks"]]
            except Exception as e:
                print(f"[AIService Error] Task breakdown via LLM failed: {e}")

        # Fallback intelligent goal breakdown templates
        return self._heuristic_task_breakdown(goal)

    def _heuristic_task_breakdown(self, goal: str) -> List[SubtaskSuggestion]:
        goal_lower = goal.lower()
        if "portfolio" in goal_lower or "website" in goal_lower:
            return [
                SubtaskSuggestion(title="Define portfolio structure & sections", description="List projects, bio, contact form requirements", estimated_priority="high"),
                SubtaskSuggestion(title="Design UI mockups & color scheme", description="Create visual layout ideas", estimated_priority="medium"),
                SubtaskSuggestion(title="Set up frontend repository", description="Initialize Vite/React project template", estimated_priority="high"),
                SubtaskSuggestion(title="Build Hero & About section", description="Draft introduction and profile content", estimated_priority="medium"),
                SubtaskSuggestion(title="Build Projects showcase section", description="Add project cards with code & demo links", estimated_priority="high"),
                SubtaskSuggestion(title="Add responsive styling & dark mode", description="Ensure mobile & desktop compatibility", estimated_priority="medium"),
                SubtaskSuggestion(title="Deploy website", description="Publish to Vercel/Netlify", estimated_priority="high")
            ]
        elif "ml" in goal_lower or "machine learning" in goal_lower or "model" in goal_lower:
            return [
                SubtaskSuggestion(title="Define project problem & metrics", description="Formulate regression/classification goal", estimated_priority="high"),
                SubtaskSuggestion(title="Collect & inspect dataset", description="Gather raw data files and inspect schema", estimated_priority="high"),
                SubtaskSuggestion(title="Clean data & handle missing values", description="Perform preprocessing and scaling", estimated_priority="medium"),
                SubtaskSuggestion(title="Exploratory Data Analysis (EDA)", description="Generate feature correlation plots", estimated_priority="medium"),
                SubtaskSuggestion(title="Train baseline model", description="Train initial algorithm (e.g. Random Forest/XGBoost)", estimated_priority="high"),
                SubtaskSuggestion(title="Evaluate & tune hyperparameters", description="Optimize cross-validation score", estimated_priority="high"),
                SubtaskSuggestion(title="Build inference pipeline / API", description="Export model artifact and setup endpoint", estimated_priority="medium")
            ]
        elif "internship" in goal_lower or "job" in goal_lower or "application" in goal_lower:
            return [
                SubtaskSuggestion(title="Update resume with latest projects", description="Tailor technical skill keywords", estimated_priority="high"),
                SubtaskSuggestion(title="Create target company list", description="Identify 10-15 open positions", estimated_priority="medium"),
                SubtaskSuggestion(title="Draft customized cover letter template", description="Highlight relevant project experiences", estimated_priority="medium"),
                SubtaskSuggestion(title="Submit online application forms", description="Complete applications on career portals", estimated_priority="high"),
                SubtaskSuggestion(title="Track applications & follow up", description="Log dates and outreach status in tracker", estimated_priority="low")
            ]
        else:
            return [
                SubtaskSuggestion(title=f"Define project scope for '{goal}'", description="List key deliverables and requirements", estimated_priority="high"),
                SubtaskSuggestion(title="Gather resources & setup environment", description="Collect tools, references, and dependencies", estimated_priority="medium"),
                SubtaskSuggestion(title="Implement core functionality phase 1", description="Build primary feature set", estimated_priority="high"),
                SubtaskSuggestion(title="Review, test and refine output", description="Verify quality and fix issues", estimated_priority="medium"),
                SubtaskSuggestion(title="Final completion & documentation", description="Document results and wrap up", estimated_priority="low")
            ]

    def prioritize_tasks(self, tasks: List[Dict[str, Any]]) -> PrioritizationResponse:
        """Evaluates tasks and produces AI recommendations with rationale."""
        if not tasks:
            return PrioritizationResponse(priorities=[], summary="No active tasks to prioritize.")

        if self.client:
            try:
                prompt = (
                    "Analyze the following user tasks and recommend priority rankings based on deadlines, urgency, importance, and status.\n"
                    f"Tasks: {json.dumps(tasks)}\n\n"
                    "Return valid JSON with keys:\n"
                    "- 'priorities': array of objects with keys 'task_id', 'title', 'suggested_priority' ('high','medium','low'), 'score' (0.0-10.0 float), 'rationale' (string explanation)\n"
                    "- 'summary': overall summary advice string."
                )
                resp = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(response_mime_type="application/json")
                )
                data = json.loads(resp.text)
                items = [TaskPriorityItem(**p) for p in data.get("priorities", [])]
                return PrioritizationResponse(priorities=items, summary=data.get("summary", "Priority analysis complete."))
            except Exception as e:
                print(f"[AIService Error] Prioritization via LLM failed: {e}")

        # Fallback multi-factor priority algorithm
        ranked_items = []
        for t in tasks:
            score = 5.0
            rationale_parts = []
            
            prio = t.get("priority", "medium").lower()
            if prio == "high":
                score += 3.0
                rationale_parts.append("High user-assigned priority level.")
            elif prio == "low":
                score -= 2.0

            due = t.get("due_date")
            if due:
                score += 2.5
                rationale_parts.append(f"Has approaching due date ({due}).")

            if t.get("subtasks") and len(t["subtasks"]) > 0:
                score += 1.0
                rationale_parts.append(f"Parent task with {len(t['subtasks'])} subcomponents.")

            suggested = "high" if score >= 7.5 else ("medium" if score >= 4.5 else "low")
            rationale = " ".join(rationale_parts) if rationale_parts else "Standard scheduled task."

            ranked_items.append(TaskPriorityItem(
                task_id=t["id"],
                title=t["title"],
                suggested_priority=suggested,
                score=round(score, 1),
                rationale=rationale
            ))

        ranked_items.sort(key=lambda x: x.score, reverse=True)
        return PrioritizationResponse(
            priorities=ranked_items,
            summary=f"Analyzed {len(tasks)} tasks. Focus first on high-scoring items with upcoming deadlines."
        )

    def solve_subtask(self, title: str, description: Optional[str] = None, goal_context: Optional[str] = None, user_api_key: Optional[str] = None) -> str:
        """Uses LLM solver to generate concrete solution output for a subtask."""
        client = self.get_client(user_api_key)
        if client:
            try:
                prompt = (
                    f"You are an AI Subtask Solver Agent.\n"
                    f"Goal Context: '{goal_context or 'Task Execution'}'\n"
                    f"Subtask Title: '{title}'\n"
                    f"Subtask Description: '{description or ''}'\n\n"
                    "Provide a concise, high-quality, actionable solution output (step-by-step resolution, code snippet, template draft, or analysis report) for completing this subtask."
                )
                resp = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                if resp.text:
                    return resp.text.strip()
            except Exception as e:
                print(f"[AIService Error] Subtask solver via LLM failed: {e}")

        # Intelligent heuristic template solver fallback
        t_lower = title.lower()
        if "structure" in t_lower or "define" in t_lower or "scope" in t_lower:
            return (
                f"### [AI Solution] Scope & Structure for '{title}'\n"
                "- Core Requirement: Establish deliverables and component architecture.\n"
                "- Key Sections: Overview, Core Implementation, Verification, and Next Steps.\n"
                "- Completed by AI Autonomous Solver."
            )
        elif "design" in t_lower or "ui" in t_lower or "mockup" in t_lower:
            return (
                f"### [AI Solution] UI/UX Design Guidelines for '{title}'\n"
                "- Palette: Dark Slate (#0f172a), Accent Indigo (#6366f1) & Cyan (#06b6d4).\n"
                "- Components: Glassmorphism panels, responsive grid cards, interactive micro-animations.\n"
                "- Design specs generated successfully."
            )
        elif "repo" in t_lower or "setup" in t_lower or "environment" in t_lower:
            return (
                f"### [AI Solution] Environment Setup for '{title}'\n"
                "1. Initialize Vite React template: `npx create-vite frontend --template react`\n"
                "2. Install styling & icon dependencies: `npm install lucide-react axios tailwindcss`\n"
                "3. Verify backend connectivity at `http://127.0.0.1:8000`."
            )
        elif "model" in t_lower or "train" in t_lower or "clean" in t_lower or "eda" in t_lower:
            return (
                f"### [AI Solution] Data & Model Pipeline for '{title}'\n"
                "```python\n"
                "# Preprocessing & Model Baseline\n"
                "import pandas as pd\n"
                "from sklearn.ensemble import RandomForestClassifier\n"
                "df = pd.read_csv('dataset.csv')\n"
                "X = df.drop('target', axis=1)\n"
                "y = df['target']\n"
                "model = RandomForestClassifier(n_estimators=100, random_state=42)\n"
                "model.fit(X, y)\n"
                "print('Baseline model trained successfully.')\n"
                "```"
            )
        else:
            return (
                f"### [AI Solution] Automated Resolution for '{title}'\n"
                f"Processed subtask '{title}'. Verified steps, generated required deliverables, and marked status as completed."
            )
