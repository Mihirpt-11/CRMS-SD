from fastapi import FastAPI, HTTPException, Depends
from database import init_db
from models import User, SignupModel, LoginModel
from auth_utils import hash_password, verify_password, create_token, get_current_user

app = FastAPI(title="Auth Service")

@app.on_event("startup")
async def start_db():
    await init_db()

# Signup Endpoint

@app.post("/auth/signup")
async def signup(payload: SignupModel):
    # check existing user
    exists = await User.find_one(User.username == payload.username)
    if exists:
        raise HTTPException(400, "Username already exists")

    new_user = User(
        username=payload.username,
        hashed_password=hash_password(payload.password),
        role=payload.role
    )
    await new_user.insert()

    return {"message": "User created successfully"}


# Login endpoint

@app.post("/auth/login")
async def login(payload: LoginModel):
    user = await User.find_one(User.username == payload.username)
    if not user:
        raise HTTPException(404, "User not found")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Invalid password")

    token = create_token(str(user.id), user.username, user.role)

    return {"access_token": token, "token_type": "bearer"}


# Protected route example

@app.get("/auth/me")
async def me(current = Depends(get_current_user)):
    return {"user": current}
