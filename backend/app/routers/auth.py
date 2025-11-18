from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from bson import ObjectId
from app.models.database import get_businesses_collection
from app.config import get_settings
import hashlib
from typing import Optional

settings = get_settings()
security = HTTPBearer()

router = APIRouter(prefix="/api/auth", tags=["authentication"])

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    industry: str
    description: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    business_id: str
    email: str
    name: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """Sign up and create a new business account"""
    businesses = get_businesses_collection()
    
    # Check if email already exists
    existing_business = await businesses.find_one({"owner_email": request.email})
    if existing_business:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(request.password)
    
    # Create business document
    business_doc = {
        "name": request.name,
        "industry": request.industry,
        "description": request.description,
        "owner_email": request.email,
        "password_hash": hashed_password,
        "created_at": datetime.now(timezone.utc),
        "has_completed_metrics": False  # Track if user has added initial metrics
    }
    
    result = await businesses.insert_one(business_doc)
    business_id = str(result.inserted_id)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": request.email, "business_id": business_id}
    )
    
    return AuthResponse(
        access_token=access_token,
        business_id=business_id,
        email=request.email,
        name=request.name
    )

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Login to existing account"""
    businesses = get_businesses_collection()
    
    # Find business by email
    business = await businesses.find_one({"owner_email": request.email})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    is_password_valid = verify_password(request.password, business["password_hash"] )
    if not is_password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    business_id = str(business["_id"])
    
    # Create access token
    access_token = create_access_token(
        data={"sub": request.email, "business_id": business_id}
    )
    
    return AuthResponse(
        access_token=access_token,
        business_id=business_id,
        email=request.email,
        name=business["name"]
    )

@router.get("/me")
async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Get current user information from token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        business_id: str = payload.get("business_id")
        
        if email is None or business_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims"
            )
        
        businesses = get_businesses_collection()
        business = await businesses.find_one({"_id": ObjectId(business_id)})
        
        if not business:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return {
            "business_id": business_id,
            "email": business["owner_email"],
            "name": business["name"],
            "industry": business["industry"],
            "has_completed_metrics": business.get("has_completed_metrics", False)
        }
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@router.post("/complete-metrics/{business_id}")
async def mark_metrics_completed(business_id: str):
    """Mark that user has completed initial metrics setup"""
    businesses = get_businesses_collection()
    
    try:
        result = await businesses.update_one(
            {"_id": ObjectId(business_id)},
            {"$set": {"has_completed_metrics": True}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Business not found")
        
        return {"message": "Metrics completion status updated"}
    except:
        raise HTTPException(status_code=400, detail="Invalid business ID")
