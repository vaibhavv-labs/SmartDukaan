"""
KiranaMind AI — FastAPI Application Entrypoint
Multi-Modal Proactive AI Store Assistant Backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import create_tables, SessionLocal
from app.routes import auth, inventory, sales, khata, insights, ai, dashboard
from app.services.intelligence import run_intelligence_engine

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Multi-Modal Proactive AI Store Assistant for Kirana Stores (Final Year Project)",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend Vite dev server (e.g. http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during development or configured list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api/v1
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(sales.router)
app.include_router(khata.router)
app.include_router(insights.router)
app.include_router(ai.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def on_startup():
    """Ensure database tables exist on startup."""
    create_tables()
    # Trigger initial intelligence analysis pass
    db = SessionLocal()
    try:
        run_intelligence_engine(db)
    except Exception as e:
        print(f"Initial intelligence run notice: {e}")
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "env": settings.app_env}
