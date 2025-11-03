from fastapi import FastAPI
from sqlmodel import SQLModel
from app.config.db import engine
from app import models
from app.routes.criptomoneda import criptomoneda_router
from app.routes.transacciones import router as transacciones_router
from app.routes.usuario import usuario_router
from app.routes.wallet import router as wallet_router

SQLModel.metadata.create_all(engine)

app = FastAPI()

app.include_router(criptomoneda_router)
app.include_router(transacciones_router)
app.include_router(usuario_router)
app.include_router(wallet_router)