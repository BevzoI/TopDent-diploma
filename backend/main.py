from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Імпорти твоїх роутерів
from auth import auth
from announcements import announcement as announcements
from absences import absence as absences

app = FastAPI(title="TopDentTeam API")

# CORS (під час розробки дозволимо все; потім обмежиш домени фронту)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Кореневий ping
@app.get("/")
def read_root():
    return {"message": "Welcome to TopDentTeam API (FastAPI)"}

# Підключення роутерів
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(announcements.router, prefix="/announcements", tags=["Announcements"])
app.include_router(absences.router, prefix="/absences", tags=["Absences"])
