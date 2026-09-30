"""The contract for a valid customer row. Anything that fails goes to the dead-letter table."""
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    id: int = Field(gt=0)
    name: str = Field(min_length=1)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    plan: Literal["free", "pro", "enterprise"]
    signup_date: date
