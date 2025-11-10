from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.models.item import User, UserCreate, UserRead, UserUpdate, UserProfile
from app.routes.deps.db_session import SessionDep
from sqlmodel import select

from app.routes.deps.auth_session import get_current_user

SECRET_KEY = "babilomangoalleywaysecurekeyforjwtgeneration"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/usuarios/login")

usuario_router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt




@usuario_router.post("/register", response_model=UserRead, status_code=201)
def register_user(user: UserCreate, db: SessionDep):
    query = select(User).where(User.email == user.email)
    if db.exec(query).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    query = select(User).where(User.username == user.username)
    if db.exec(query).first():
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@usuario_router.post("/login")
def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: SessionDep):
    query = select(User).where(User.email == form_data.username)
    user = db.exec(query).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email o contraseña inválidos")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }


@usuario_router.get("/profile/me", response_model=UserProfile)
def get_my_profile(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@usuario_router.get("/{user_id}", response_model=UserProfile)
def get_user(user_id: int, db: SessionDep):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not user.is_active:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@usuario_router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para actualizar este usuario")
    
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user_update.email and user_update.email != user.email:
        query = select(User).where(User.email == user_update.email)
        if db.exec(query).first():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    if user_update.username and user_update.username != user.username:
        query = select(User).where(User.username == user_update.username)
        if db.exec(query).first():
            raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    user_data = user_update.dict(exclude_unset=True)
    for key, value in user_data.items():
        setattr(user, key, value)
    
    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@usuario_router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este usuario")
    
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(user)
    db.commit()


@usuario_router.post("/logout", status_code=200)
def logout_user(current_user: Annotated[User, Depends(get_current_user)]):
    return {"message": "Sesión cerrada exitosamente"}