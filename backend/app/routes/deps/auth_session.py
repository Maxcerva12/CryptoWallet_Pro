from fastapi import  HTTPException, Depends
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.models.item import User
from app.routes.deps.db_session import SessionDep

from sqlmodel import select

SECRET_KEY = "babilomangoalleywaysecurekeyforjwtgeneration"
ALGORITHM = "RS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/usuarios/login")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: SessionDep) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    
    return user