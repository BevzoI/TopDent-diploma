from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import auth # Ми створимо цей модуль далі

app = FastAPI(title="TopDentTeam API")

# Налаштування CORS (Критично важливо для мобільних додатків!)
# Це дозволяє вашому React Native додатку (який працює на іншому порту) 
# надсилати запити до бекенду.
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