from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

# In-memory "БД"
ABSENCE_DB = []
current_id = 1

class AbsenceCreate(BaseModel):
    user: str
    reason: str
    start_date: date
    end_date: date

class AbsenceItem(BaseModel):
    id: int
    user: str
    reason: str
    start_date: date
    end_date: date
    status: str  # "Очікує", "Схвалено", "Відхилено"

@router.get("/", response_model=List[AbsenceItem])
async def list_absences(user: Optional[str] = None):
    if user:
        return [x for x in ABSENCE_DB if x.user == user]
    return ABSENCE_DB

@router.post("/", response_model=AbsenceItem, status_code=status.HTTP_201_CREATED)
async def create_absence(req: AbsenceCreate):
    global current_id
    item = AbsenceItem(
        id=current_id,
        user=req.user,
        reason=req.reason,
        start_date=req.start_date,
        end_date=req.end_date,
        status="Очікує",
    )
    ABSENCE_DB.append(item)
    current_id += 1
    return item

@router.put("/{request_id}/status/{new_status}")
async def update_request_status(request_id: int, new_status: str):
    if new_status not in ["Схвалено", "Відхилено"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    for i, req in enumerate(ABSENCE_DB):
        if req.id == request_id:
            ABSENCE_DB[i] = req.copy(update={"status": new_status})
            return {"message": f"Заявка {request_id} оновлена на {new_status}"}
    raise HTTPException(status_code=404, detail="Request not found")
