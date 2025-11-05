from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

# --- Pydantic Схеми ---

# 1. Модель для створення заявки (Вхідні дані від Персоналу)
class AbsenceRequestCreate(BaseModel):
    start_date: date
    end_date: date
    reason: str
    absence_type: str # Наприклад: 'Відпустка', 'Лікарняний', 'Відгул'

# 2. Модель для заявки з результатом (Вихідні дані)
class AbsenceRequest(AbsenceRequestCreate):
    id: int
    user_id: str # Імітація ID користувача
    username: str
    status: str = "Очікує" # 'Очікує', 'Схвалено', 'Відхилено'
    admin_comment: Optional[str] = None

# --- Імітація Бази Даних ---
ABSENCE_DB = [
    {
        "id": 101,
        "user_id": "doctor_ivan_id",
        "username": "Doctor Ivan",
        "start_date": date(2025, 12, 1),
        "end_date": date(2025, 12, 5),
        "reason": "Щорічна відпустка",
        "absence_type": "Відпустка",
        "status": "Схвалено",
        "admin_comment": "Приємного відпочинку!",
    },
]
current_id = 102

# --- Роутери ---

# 1. Отримати всі заявки (Тільки для Admin)
@router.get("/", response_model=List[AbsenceRequest])
async def get_all_requests():
    
    return ABSENCE_DB

# 2. Отримати мої заявки (Тільки для Персоналу)
@router.get("/my/{user_id}", response_model=List[AbsenceRequest])
async def get_my_requests(user_id: str):
    # Тут user_id має братися з JWT токена
    return [req for req in ABSENCE_DB if req["user_id"] == user_id]

# 3. Створити заявку (Тільки для Персоналу)
@router.post("/", response_model=AbsenceRequest)
async def create_request(request_data: AbsenceRequestCreate):
    global current_id
    
    # Імітація отримання даних користувача з токена
    user_id = "doctor_ivan_id" # Треба замінити на реальну логіку токенів
    username = "Doctor Ivan" 
    
    new_request = AbsenceRequest(
        id=current_id,
        user_id=user_id,
        username=username,
        start_date=request_data.start_date,
        end_date=request_data.end_date,
        reason=request_data.reason,
        absence_type=request_data.absence_type,
        status="Очікує"
    )
    ABSENCE_DB.append(new_request.model_dump())
    current_id += 1
    
    return new_request

# 4. Оновити статус заявки (Тільки для Admin)
@router.put("/{request_id}/status/{new_status}")
async def update_request_status(request_id: int, new_status: str):
    # У реальному проєкті тут потрібна перевірка ролі 'admin'
    if new_status not in ["Схвалено", "Відхилено"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    for req in ABSENCE_DB:
        if req["id"] == request_id:
            req["status"] = new_status
            # Успіх
            return {"message": f"Заявка {request_id} оновлена на {new_status}"}
            
    raise HTTPException(status_code=404, detail="Заявку не знайдено")