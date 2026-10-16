from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class IssueCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(default="", max_length=5000)
    priority: Literal["low", "medium", "high", "critical"] = "medium"


class IssueUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    priority: Literal["low", "medium", "high", "critical"] | None = None
    status: Literal["open", "in_progress", "resolved", "closed"] | None = None


class IssueResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)