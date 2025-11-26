from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional

# Database representation for Users
class User(Document):
    username: str
    hashed_password: str
    role: str  

    class Settings:
        name = "users"  

# Request models (input validation)
class SignupModel(BaseModel):
    username: str
    password: str
    role: str

class LoginModel(BaseModel):
    username: str
    password: str
