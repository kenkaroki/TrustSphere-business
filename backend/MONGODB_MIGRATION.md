# MongoDB Migration Guide

## Changes Made

Successfully replaced all SQLite usage with MongoDB in the backend server.

### Modified Files

1. **app/models/database.py**
   - Replaced SQLAlchemy with Motor (async MongoDB driver)
   - Removed SQLAlchemy models (Business, BusinessMetric, AIInteraction)
   - Added MongoDB connection setup with AsyncIOMotorClient
   - Created helper functions for document conversion
   - Added index creation for optimized queries

2. **app/routers/business.py**
   - Removed SQLAlchemy Session dependency
   - Converted all database queries to MongoDB operations
   - Changed business_id from int to string (MongoDB ObjectId)
   - Updated CRUD operations to use async MongoDB methods

3. **app/routers/ai.py**
   - Removed SQLAlchemy Session dependency
   - Converted all database queries to MongoDB operations
   - Changed business_id from int to string (MongoDB ObjectId)
   - Updated all AI interaction endpoints to use MongoDB

4. **app/models/schemas.py**
   - Changed all ID fields from `int` to `str` (for MongoDB ObjectIds)
   - Updated business_id references in all schemas

5. **app/main.py**
   - Updated startup event to use async init_db()
   - Added shutdown event to close MongoDB connection

## Next Steps

### 1. Install Dependencies

The MongoDB dependencies are already in requirements.txt. Install them:

```powershell
cd "C:\Users\kenka\Desktop\Trust sphere v2\backend"
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configure MongoDB

Ensure your `.env` file has the MongoDB configuration:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=business_growth
```

### 3. Start MongoDB

Make sure MongoDB is running locally:

```powershell
# If using MongoDB Community Edition
mongod

# Or if installed as a service
net start MongoDB
```

### 4. Test the Server

Start the FastAPI server:

```powershell
cd "C:\Users\kenka\Desktop\Trust sphere v2\backend"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

## Key Changes

### Database Structure

**Before (SQLite with SQLAlchemy):**
- Integer primary keys (auto-increment)
- Foreign key relationships with integers
- Synchronous database operations
- SQLAlchemy ORM models

**After (MongoDB with Motor):**
- String IDs using MongoDB ObjectId
- Document references using string IDs
- Async database operations
- Direct document manipulation with helper functions

### API Changes

**Important:** All business_id parameters in API endpoints now expect **string** values instead of integers.

Example:
- Before: `GET /api/business/1`
- After: `GET /api/business/507f1f77bcf86cd799439011`

### Collections

The following MongoDB collections will be created:
- `businesses` - Stores business information
- `business_metrics` - Stores business metrics
- `ai_interactions` - Stores AI interaction history

### Indexes

The following indexes are automatically created on startup:
- `businesses.name`
- `businesses.owner_email`
- `business_metrics.business_id`
- `ai_interactions.business_id`
- `ai_interactions.timestamp`

## Migration Notes

- No data migration script is provided since this appears to be a new project
- If you have existing SQLite data, you'll need to export it and import to MongoDB
- All existing API clients will need to update their business_id handling from integers to strings
