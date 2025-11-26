import os
import jwt
import datetime
from passlib.context import CryptContext
from fastapi import HTTPException, Header

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")

# Hash passwords
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Verify passwords
def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

# Create JWT token
def create_token(user_id: str, username: str, role: str):
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=6)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# Decode and verify JWT
def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Dependency to extract user from Authorization header
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer":
        raise HTTPException(401, "Invalid auth scheme")

    return decode_token(token)
