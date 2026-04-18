from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AnalyzeRequest(BaseModel):
    workerId: str = Field(..., description="The UUID of the worker to analyze.")

class ShiftLog(BaseModel):
    id: Optional[str] = None
    date: datetime
    grossEarned: float
    platformDeductions: float
    netReceived: float

class AnomalyResult(BaseModel):
    hasAnomaly: bool
    type: Optional[str] = Field(None, description="UNUSUAL_DEDUCTION or SUDDEN_INCOME_DROP")
    explanation: str

class TestRequest(BaseModel):
    logs: List[ShiftLog] = Field(..., description="Array of crafted shift logs to test the mathematical logic.")