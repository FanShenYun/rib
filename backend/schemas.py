import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# Auth
class AuthRequest(BaseModel):
    password: str
    display_name: str


class AuthResponse(BaseModel):
    token: str


# Parse
class ParseRequest(BaseModel):
    raw_text: str


class ParseResponse(BaseModel):
    time_field: str
    location: str
    summary: str


# Card
class CardCreate(BaseModel):
    raw_text: str
    time_field: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    zone: str = "left"


class CardUpdate(BaseModel):
    raw_text: Optional[str] = None
    time_field: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    zone: Optional[str] = None
    collaboration_status: Optional[str] = None
    urgency: Optional[str] = None
    sort_order: Optional[int] = None


class CardResponse(BaseModel):
    id: uuid.UUID
    raw_text: str
    time_field: Optional[str]
    location: Optional[str]
    summary: Optional[str]
    zone: str
    sort_order: int
    collaboration_status: Optional[str]
    urgency: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Reorder
class ReorderItem(BaseModel):
    id: uuid.UUID
    sort_order: int
    zone: str


class ReorderRequest(BaseModel):
    updates: List[ReorderItem]
