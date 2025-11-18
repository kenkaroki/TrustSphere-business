from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
from typing import Optional
from app.config import get_settings

settings = get_settings()

# MongoDB client
client: Optional[AsyncIOMotorClient] = None
database = None

# Collections
businesses_collection = None
metrics_collection = None
interactions_collection = None

def get_database():
    """Get the MongoDB database instance"""
    return database

def get_businesses_collection():
    """Get businesses collection"""
    return businesses_collection

def get_metrics_collection():
    """Get metrics collection"""
    return metrics_collection

def get_interactions_collection():
    """Get interactions collection"""
    return interactions_collection

async def init_db():
    """Initialize MongoDB connection and create indexes"""
    global client, database, businesses_collection, metrics_collection, interactions_collection
    
    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.database_name]
    
    # Initialize collections
    businesses_collection = database["businesses"]
    metrics_collection = database["business_metrics"]
    interactions_collection = database["ai_interactions"]
    
    # Create indexes
    await businesses_collection.create_index("name")
    await businesses_collection.create_index("owner_email")
    await metrics_collection.create_index("business_id")
    await interactions_collection.create_index("business_id")
    await interactions_collection.create_index("timestamp")

async def close_db():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()

# Helper functions for document conversion
def business_helper(business) -> dict:
    """Convert business document to dict"""
    return {
        "id": str(business["_id"]),
        "name": business["name"],
        "industry": business["industry"],
        "description": business["description"],
        "created_at": business["created_at"],
        "owner_email": business["owner_email"]
    }

def metric_helper(metric) -> dict:
    """Convert metric document to dict"""
    return {
        "id": str(metric["_id"]),
        "business_id": metric["business_id"],
        "metric_type": metric["metric_type"],
        "value": metric["value"],
        "period": metric["period"],
        "timestamp": metric["timestamp"],
        "metadata": metric.get("metadata")
    }

def interaction_helper(interaction) -> dict:
    """Convert interaction document to dict"""
    return {
        "id": str(interaction["_id"]),
        "business_id": interaction["business_id"],
        "query": interaction["query"],
        "response": interaction["response"],
        "interaction_type": interaction["interaction_type"],
        "timestamp": interaction["timestamp"]
    }
