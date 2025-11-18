from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from bson import ObjectId
from datetime import datetime
from app.models.database import (
    get_businesses_collection,
    get_metrics_collection,
    get_interactions_collection,
    business_helper,
    metric_helper,
    interaction_helper
)
from app.models.schemas import AIQuery, AIResponse, BusinessAnalysisRequest, GrowthRecommendation
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/insights/{business_id}")
async def get_business_insights(business_id: str):
    """Get AI-powered business insights"""
    businesses = get_businesses_collection()
    interactions = get_interactions_collection()
    
    try:
        business = await businesses.find_one({"_id": ObjectId(business_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid business ID format")
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    business_data = {
        "name": business["name"],
        "industry": business["industry"],
        "description": business["description"]
    }
    
    insights = await gemini_service.get_business_insights(business_data)
    
    # Store interaction
    interaction_doc = {
        "business_id": business_id,
        "query": "Business insights request",
        "response": insights,
        "interaction_type": "insight",
        "timestamp": datetime.utcnow()
    }
    await interactions.insert_one(interaction_doc)
    
    return {"response": insights, "interaction_type": "insight"}

@router.post("/analyze-metrics/{business_id}")
async def analyze_business_metrics(business_id: str):
    """Analyze business metrics with AI"""
    businesses = get_businesses_collection()
    metrics_coll = get_metrics_collection()
    interactions = get_interactions_collection()
    
    try:
        business = await businesses.find_one({"_id": ObjectId(business_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid business ID format")
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    metrics_data = []
    async for metric in metrics_coll.find({"business_id": business_id}):
        metrics_data.append({
            "metric_type": metric["metric_type"],
            "value": metric["value"],
            "period": metric["period"]
        })
    
    if not metrics_data:
        raise HTTPException(status_code=404, detail="No metrics found for this business")
    
    analysis = await gemini_service.analyze_metrics(metrics_data)
    
    # Store interaction
    interaction_doc = {
        "business_id": business_id,
        "query": "Metrics analysis request",
        "response": analysis,
        "interaction_type": "analysis",
        "timestamp": datetime.utcnow()
    }
    await interactions.insert_one(interaction_doc)
    
    return {"response": analysis, "interaction_type": "analysis"}

@router.post("/growth-plan/{business_id}")
async def generate_growth_plan(
    business_id: str,
    timeframe: str = "6 months"
):
    """Generate a comprehensive growth plan"""
    businesses = get_businesses_collection()
    interactions = get_interactions_collection()
    
    try:
        business = await businesses.find_one({"_id": ObjectId(business_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid business ID format")
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    business_data = {
        "name": business["name"],
        "industry": business["industry"],
        "description": business["description"]
    }
    
    growth_plan = await gemini_service.generate_growth_plan(business_data, timeframe)
    
    # Store interaction
    interaction_doc = {
        "business_id": business_id,
        "query": f"Growth plan request ({timeframe})",
        "response": str(growth_plan),
        "interaction_type": "growth_plan",
        "timestamp": datetime.utcnow()
    }
    await interactions.insert_one(interaction_doc)
    
    return growth_plan

@router.get("/market-insights/{industry}")
async def get_market_insights(industry: str):
    """Get market insights for an industry"""
    insights = await gemini_service.get_market_insights(industry)
    return {"industry": industry, "insights": insights}

@router.post("/ask")
async def ask_question(query: AIQuery):
    """Ask a business question with AI assistance"""
    businesses = get_businesses_collection()
    interactions = get_interactions_collection()
    
    try:
        business = await businesses.find_one({"_id": ObjectId(query.business_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid business ID format")
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    business_context = {
        "name": business["name"],
        "industry": business["industry"],
        "description": business["description"],
        **(query.context or {})
    }
    
    answer = await gemini_service.answer_business_question(query.query, business_context)
    
    # Store interaction
    interaction_doc = {
        "business_id": query.business_id,
        "query": query.query,
        "response": answer,
        "interaction_type": "question",
        "timestamp": datetime.utcnow()
    }
    await interactions.insert_one(interaction_doc)
    
    return {"response": answer, "interaction_type": "question"}

@router.post("/recommendations/{business_id}")
async def get_recommendations(
    business_id: str,
    focus_area: str = "general"
) -> List[GrowthRecommendation]:
    """Get AI-powered growth recommendations"""
    businesses = get_businesses_collection()
    interactions = get_interactions_collection()
    
    try:
        business = await businesses.find_one({"_id": ObjectId(business_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid business ID format")
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    business_data = {
        "name": business["name"],
        "industry": business["industry"],
        "description": business["description"]
    }
    
    recommendations = await gemini_service.generate_recommendations(business_data, focus_area)
    
    # Store interaction
    interaction_doc = {
        "business_id": business_id,
        "query": f"Recommendations request (focus: {focus_area})",
        "response": str(recommendations),
        "interaction_type": "recommendations",
        "timestamp": datetime.utcnow()
    }
    await interactions.insert_one(interaction_doc)
    
    return recommendations

@router.get("/history/{business_id}")
async def get_interaction_history(
    business_id: str,
    limit: int = 10
):
    """Get AI interaction history for a business"""
    interactions = get_interactions_collection()
    
    history = []
    cursor = interactions.find({"business_id": business_id})\
        .sort("timestamp", -1)\
        .limit(limit)
    
    async for interaction in cursor:
        history.append({
            "id": str(interaction["_id"]),
            "query": interaction["query"],
            "response": interaction["response"],
            "type": interaction["interaction_type"],
            "timestamp": interaction["timestamp"]
        })
    
    return history
