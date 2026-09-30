"""API-key auth as a reusable FastAPI dependency."""
import os
import secrets

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_api_key(key: str | None = Security(api_key_header)) -> str:
    expected = os.getenv("API_KEY")
    if not expected:
        # Fail closed: a server with no key configured should not be open to everyone.
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "API_KEY is not configured")
    if key is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing X-API-Key header")
    # compare_digest avoids leaking the key through response timing.
    if not secrets.compare_digest(key, expected):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Invalid API key")
    return key
