from fastapi import FastAPI
from app.routes import user, role, employees, vehicles
from app.auth import auth
from app.database.database import engine
from app.models import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://10.118.1.7"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(user.router, prefix="/api")
app.include_router(role.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(employees.router, prefix="/api")
app.include_router(vehicles.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to ZeeTMS API"}