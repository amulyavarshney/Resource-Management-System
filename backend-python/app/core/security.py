import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import get_settings

_settings = get_settings()


def _hmac_sha512(key: bytes, data: bytes) -> bytes:
    return hmac.new(key, data, hashlib.sha512).digest()


def create_password_hash(raw_password: str | None) -> tuple[bytes | None, bytes | None]:
    """Return (hash, salt) for a plaintext password, or (None, None) if no password."""
    if raw_password is None:
        return None, None
    salt = os.urandom(64)  # 512-bit random salt, matches .NET HMACSHA512 key length
    password_hash = _hmac_sha512(salt, raw_password.encode())
    return password_hash, salt


def verify_password(raw_password: str | None, password_hash: bytes | None, password_salt: bytes | None) -> bool:
    """Return True if raw_password matches the stored hash/salt pair."""
    if password_hash is None and password_salt is None:
        # No password set: only allow if no raw password was supplied either
        return raw_password is None
    if raw_password is None or password_hash is None or password_salt is None:
        return False
    computed = _hmac_sha512(password_salt, raw_password.encode())
    return hmac.compare_digest(computed, password_hash)


def create_access_token(email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=_settings.jwt_expire_hours)
    payload = {
        "email": email,
        "Role": role,
        "exp": expire,
    }
    return jwt.encode(payload, _settings.jwt_secret, algorithm=_settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, _settings.jwt_secret, algorithms=[_settings.jwt_algorithm])
