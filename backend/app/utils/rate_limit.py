import time
from fastapi import Request, HTTPException, status
from collections import defaultdict

# IP-based rate limiting dictionary
# Format: { "ip": [timestamp1, timestamp2, ...] }
_rate_limits = defaultdict(list)

def check_rate_limit(request: Request, max_requests: int = 20, window_seconds: int = 60):
    """
    Lightweight in-memory rate limiter to prevent simple abuse.
    Not suitable for distributed deployments without a shared cache (like Redis).
    """
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Filter out timestamps older than the window
    _rate_limits[client_ip] = [t for t in _rate_limits[client_ip] if now - t < window_seconds]
    
    if len(_rate_limits[client_ip]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )
        
    _rate_limits[client_ip].append(now)
