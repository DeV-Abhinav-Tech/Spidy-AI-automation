import sys
import os
import traceback

# Resolve paths for serverless Lambda execution on Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(root_dir, "backend")

for p in [backend_dir, root_dir, current_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Ensure VERCEL environment flag is detected
if "VERCEL" not in os.environ and ("AWS_LAMBDA_FUNCTION_NAME" in os.environ or "VERCEL_URL" in os.environ):
    os.environ["VERCEL"] = "1"

try:
    from app.main import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="Spidy Diagnostic Fallback")
    err_msg = str(e)
    err_trace = traceback.format_exc()

    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
    async def catch_all_error(path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Backend Import Failed on Vercel",
                "message": err_msg,
                "traceback": err_trace,
                "path": path_name,
                "sys_path": sys.path,
                "current_dir": current_dir,
                "root_dir_contents": os.listdir(root_dir) if os.path.exists(root_dir) else "NotFound",
                "backend_dir_contents": os.listdir(backend_dir) if os.path.exists(backend_dir) else "NotFound"
            }
        )
