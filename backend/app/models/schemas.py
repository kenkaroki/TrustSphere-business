from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class BusinessCreate(BaseModel):
    name: str
    industry: str
    description: str
    owner_email: EmailStr

class BusinessResponse(BaseModel):
    id: str
    name: str
    industry: str
    description: str
    created_at: datetime
    owner_email: str
    
    class Config:
        from_attributes = True

class MetricCreate(BaseModel):
    business_id: str
    metric_type: str
    value: float
    period: str
    metadata: Optional[Dict[str, Any]] = None

class MetricResponse(BaseModel):
    id: str
    business_id: str
    metric_type: str
    value: float
    period: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]]
    
    class Config:
        from_attributes = True

class AIQuery(BaseModel):
    business_id: str
    query: str
    context: Optional[Dict[str, Any]] = None

class AIResponse(BaseModel):
    response: str
    interaction_type: str
    suggestions: Optional[List[str]] = None
    
class BusinessAnalysisRequest(BaseModel):
    business_id: str
    analysis_type: str  # growth, market, competitor, financial
    data: Optional[Dict[str, Any]] = None

class GrowthRecommendation(BaseModel):
    title: str
    description: str
    priority: str  # high, medium, low
    category: str  # marketing, operations, finance, etc.
    action_items: List[str]
