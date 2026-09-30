"""Pydantic v2 models: the shapes of data going in and out of the API."""
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Status(str, Enum):
    open = "open"
    in_progress = "in_progress"
    closed = "closed"


class TicketCreate(BaseModel):
    """What a client sends to create a ticket."""
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    priority: Priority = Priority.medium


class TicketUpdate(BaseModel):
    """Partial update: every field is optional (PATCH semantics)."""
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    priority: Priority | None = None
    status: Status | None = None


class TicketOut(BaseModel):
    """What the API returns. from_attributes lets us build it from an ORM row."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    priority: Priority
    status: Status
    created_at: datetime
    updated_at: datetime
