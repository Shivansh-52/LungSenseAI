from fastapi import APIRouter, HTTPException, Depends, status, Request
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import register_user, authenticate_user
from app.utils.dependencies import get_current_user
from app.models.user import serialize_user
from app.utils.rate_limit import check_rate_limit

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(request: Request, body: RegisterRequest):
    """Register a new user account."""
    check_rate_limit(request, max_requests=10, window_seconds=60)
    try:
        result = await register_user(
            name=body.name,
            email=body.email,
            password=body.password,
        )
        return {"success": True, "message": "Account created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ConnectionError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database not available")


@router.post("/login")
async def login(request: Request, body: LoginRequest):
    """Authenticate user and return JWT token."""
    check_rate_limit(request, max_requests=20, window_seconds=60)
    try:
        result = await authenticate_user(
            email=body.email,
            password=body.password,
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
