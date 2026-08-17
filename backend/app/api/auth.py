from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import register_user, authenticate_user
from app.utils.dependencies import get_current_user
from app.models.user import serialize_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(request: RegisterRequest):
    """Register a new user account."""
    try:
        result = await register_user(
            name=request.name,
            email=request.email,
            password=request.password,
        )
        return {"success": True, "message": "Account created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ConnectionError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database not available")


@router.post("/login")
async def login(request: LoginRequest):
    """Authenticate user and return JWT token."""
    try:
        result = await authenticate_user(
            email=request.email,
            password=request.password,
        )
        result["success"] = True
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except ConnectionError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database not available")


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return {"success": True, "user": serialize_user(current_user)}


@router.post("/logout")
async def logout():
    """
    Logout endpoint. JWT is stateless, so the client simply discards the token.
    This endpoint exists for API completeness.
    """
    return {"success": True, "message": "Logged out successfully"}
