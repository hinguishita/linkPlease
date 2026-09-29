from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, users, automations, contacts, inbox, analytics
from app.seed import seed_db

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed initial data
try:
    seed_db()
except Exception as e:
    print(f"Seed note: {e}")

app = FastAPI(
    title="LinkPlease API",
    description="Social media communication, automation, contacts, inbox & analytics platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(automations.router)
app.include_router(contacts.router)
app.include_router(inbox.router)
app.include_router(analytics.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to LinkPlease API",
        "docs": "http://localhost:8000/docs",
        "status": "active"
    }
