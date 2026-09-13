import os
import hashlib
import secrets
from typing import Tuple

ITERATIONS = 100_000

def hash_password(password: str) -> str:
    """Hashes a plain text password using PBKDF2-HMAC-SHA256 with a unique random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        ITERATIONS
    )
    return f"pbkdf2_sha256${salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against stored pbkdf2_sha256 hash using constant-time comparison."""
    if not hashed_password or not hashed_password.startswith("pbkdf2_sha256$"):
        return False
    
    try:
        parts = hashed_password.split("$")
        if len(parts) != 3:
            return False
        
        _, salt, stored_key_hex = parts
        computed_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            ITERATIONS
        )
        return secrets.compare_digest(computed_key.hex(), stored_key_hex)
    except Exception:
        return False

def generate_session_token() -> str:
    """Generates a secure cryptographically random session token."""
    return secrets.token_urlsafe(32)
