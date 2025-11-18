from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from datetime import datetime
from app.models.database import (
    get_businesses_collection,
    get_metrics_collection,
    business_helper,
    metric_helper
)
from app.models.schemas import BusinessCreate, BusinessResponse, MetricCreate, MetricResponse
from app.services.gemini_service import gemini_service
from app.routers.auth import get_current_user
from app.config import Settings

router = APIRouter(prefix="/api/business", tags=["business"])

@router.post("/", response_model=BusinessResponse)
async def create_business(business: BusinessCreate):
    """Create a new business"""
    businesses = get_businesses_collection()
    
    business_dict = business.model_dump()
    business_dict["created_at"] = datetime.utcnow()
    
    result = await businesses.insert_one(business_dict)
    new_business = await businesses.find_one({"_id": result.inserted_id})
    
    return business_helper(new_business)

@router.get("/", response_model=List[BusinessResponse])
async def list_businesses(current_user: dict = Depends(get_current_user)):
    """List the business for the current user"""
    businesses = get_businesses_collection()
    
    business = await businesses.find_one({"_id": ObjectId(current_user["business_id"])})
    
    if not business:
        return []
        
    return [business_helper(business)]

@router.get("/{business_id}", response_model=BusinessResponse)
async def get_business(business_id: str):
    """Get a specific business"""
    businesses = get_businesses_collection()
    
    try:
        business = await businesses.find_one({"_id": ObjectId(business_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid business ID format")
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    return business_helper(business)

@router.post("/metrics", response_model=MetricResponse)
async def add_metric(metric: MetricCreate):
    """Add a business metric"""
    metrics = get_metrics_collection()
    
    metric_dict = metric.model_dump()
    metric_dict["timestamp"] = datetime.utcnow()
    
    result = await metrics.insert_one(metric_dict)
    new_metric = await metrics.find_one({"_id": result.inserted_id})
    
    return metric_helper(new_metric)

@router.post("/metrics/batch", response_model=List[MetricResponse])
async def add_metrics_batch(metrics_data: List[MetricCreate]):
    """Add a batch of business metrics"""
    metrics = get_metrics_collection()
    
    new_metrics = []
    for metric in metrics_data:
        metric_dict = metric.model_dump()
        metric_dict["timestamp"] = datetime.utcnow()
        new_metrics.append(metric_dict)
    
    if not new_metrics:
        raise HTTPException(status_code=400, detail="No metrics provided")

    result = await metrics.insert_many(new_metrics)
    
    inserted_ids = result.inserted_ids
    
    created_metrics = []
    cursor = metrics.find({"_id": {"$in": inserted_ids}})
    async for metric in cursor:
        created_metrics.append(metric_helper(metric))
        
    return created_metrics

@router.get("/{business_id}/metrics", response_model=List[MetricResponse])
async def get_metrics(business_id: str):
    """Get metrics for a business"""
    metrics = get_metrics_collection()
    
    metric_list = []
    cursor = metrics.find({"business_id": business_id})
    async for metric in cursor:
        metric_list.append(metric_helper(metric))
    
    return metric_list

@router.get("/{business_id}/kpis", response_model=dict)
async def get_kpis(business_id: str):
    """Get key performance indicators for a business"""
    metrics = get_metrics_collection()
    
    kpis = {
        "monthly_revenue": 0,
        "monthly_revenue_change": 0,
        "customer_growth": 0,
        "customer_growth_change": 0,
        "conversion_rate": 0,
        "conversion_rate_change": 0
    }

    revenue_metrics = await metrics.find({"business_id": business_id, "metric_type": "revenue"}).sort("period", -1).to_list(length=2)
    if len(revenue_metrics) > 0:
        kpis["monthly_revenue"] = revenue_metrics[0]["value"]
        if len(revenue_metrics) > 1:
            kpis["monthly_revenue_change"] = (revenue_metrics[0]["value"] - revenue_metrics[1]["value"]) / revenue_metrics[1]["value"] if revenue_metrics[1]["value"] != 0 else 0

    customer_metrics = await metrics.find({"business_id": business_id, "metric_type": "customers"}).sort("period", -1).to_list(length=2)
    if len(customer_metrics) > 0:
        kpis["customer_growth"] = customer_metrics[0]["value"]
        if len(customer_metrics) > 1:
            kpis["customer_growth_change"] = (customer_metrics[0]["value"] - customer_metrics[1]["value"]) / customer_metrics[1]["value"] if customer_metrics[1]["value"] != 0 else 0

    conversion_metrics = await metrics.find({"business_id": business_id, "metric_type": "conversion_rate"}).sort("period", -1).to_list(length=2)
    if len(conversion_metrics) > 0:
        kpis["conversion_rate"] = conversion_metrics[0]["value"]
        if len(conversion_metrics) > 1:
            kpis["conversion_rate_change"] = (conversion_metrics[0]["value"] - conversion_metrics[1]["value"]) / conversion_metrics[1]["value"] if conversion_metrics[1]["value"] != 0 else 0

    return kpis

@router.get("/{business_id}/revenue-trends", response_model=list)
async def get_revenue_trends(business_id: str):
    """Get revenue and customer trends for a business"""
    metrics = get_metrics_collection()
    
    # Aggregate revenue by period
    revenue_pipeline = [
        {"$match": {"business_id": business_id, "metric_type": "revenue"}},
        {"$group": {
            "_id": "$period",
            "revenue": {"$sum": "$value"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    # Aggregate customers by period
    customers_pipeline = [
        {"$match": {"business_id": business_id, "metric_type": "customers"}},
        {"$group": {
            "_id": "$period",
            "customers": {"$sum": "$value"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    revenue_data = await metrics.aggregate(revenue_pipeline).to_list(length=None)
    customers_data = await metrics.aggregate(customers_pipeline).to_list(length=None)
    
    # Create a dictionary for easy lookup
    customers_dict = {item["_id"]: item["customers"] for item in customers_data}
    
    # Combine the data
    trends = []
    for item in revenue_data:
        period = item["_id"]
        trends.append({
            "month": period,
            "revenue": item["revenue"],
            "customers": customers_dict.get(period, 0)
        })
    
    return trends

@router.get("/{business_id}/growth-by-category", response_model=list)
async def get_growth_by_category(business_id: str):
    """Get growth by category for a business"""
    metrics = get_metrics_collection()
    
    pipeline = [
        {"$match": {"business_id": business_id}},
        {"$sort": {"period": 1}},
        {"$group": {
            "_id": "$metric_type",
            "first": {"$first": "$value"},
            "last": {"$last": "$value"}
        }},
        {"$project": {
            "category": "$_id",
            "growth": {
                "$cond": [
                    {"$eq": ["$first", 0]},
                    0,
                    {"$multiply": [{"$divide": [{"$subtract": ["$last", "$first"]}, "$first"]}, 100]}
                ]
            }
        }}
    ]
    
    growth_data = await metrics.aggregate(pipeline).to_list(length=None)
    return growth_data


@router.get("/debug/all-metrics")
async def debug_all_metrics():
    """Debug: Get ALL metrics from database"""
    metrics = get_metrics_collection()
    all_metrics = await metrics.find({}).to_list(length=None)
    return {
        "count": len(all_metrics),
        "database": Settings.database_name,
        "metrics": [metric_helper(m) for m in all_metrics]
    }