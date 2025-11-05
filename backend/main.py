from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import auth 
from . import absences

app = FastAPI(title="TopDentTeam API")


origins = [
    "*", # Дозволити всі джерела (для розробки)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Підключення роутерів
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    return {"message": "Welcome to TopDentTeam API (FastAPI)"}
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(announcements.router, prefix="/announcements", tags=["Announcements"]) 
app.include_router(absences.router, prefix="/absences", tags=["Absences"])