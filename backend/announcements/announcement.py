from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

# In-memory "БД"
ANNOUNCEMENTS_DB = []
current_id = 1

class AnnouncementCreate(BaseModel):
    title: str
    content: str

class Announcement(BaseModel):
    id: int
    title: str
    content: str
    author_role: str
    published_at: datetime

@router.get("/", response_model=List[Announcement])
async def list_announcements():
    return ANNOUNCEMENTS_DB

@router.post("/", response_model=Announcement, status_code=status.HTTP_201_CREATED)
async def create_new_announcement(announcement: AnnouncementCreate):
    global current_id
    new_announcement = Announcement(
        id=current_id,
        title=announcement.title,
        content=announcement.content,
        author_role="admin",
        published_at=datetime.now(),
    )
    ANNOUNCEMENTS_DB.append(new_announcement)
    current_id += 1
    return new_announcement

@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(announcement_id: int):
    idx = next((i for i, a in enumerate(ANNOUNCEMENTS_DB) if a.id == announcement_id), -1)
    if idx == -1:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ANNOUNCEMENTS_DB.pop(idx)
    return
