from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/ping")
async def ping():
    """Lightweight keep-alive endpoint."""
    return {"pong": True}