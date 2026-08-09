from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Spidy Task Automation Assistant API",
        "version": "1.0.0"
    }
