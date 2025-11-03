from fastapi import APIRouter, HTTPException
from app.models.item import Cryptomoneda, CryptomonedaBase
from app.routes.deps.db_session import SessionDep
from sqlmodel import select


criptomoneda_router = APIRouter(prefix="/api/criptomonedas", tags=["Criptomonedas"])

@criptomoneda_router.get("/", response_model=list[Cryptomoneda])
def get_criptomonedas(db: SessionDep):
    criptomonedas = db.exec(select(Cryptomoneda)).all()
    return criptomonedas

@criptomoneda_router.get("/{criptomoneda_id}", response_model=Cryptomoneda)
def get_criptomoneda(criptomoneda_id: int, db: SessionDep):
    criptomoneda = db.get(Cryptomoneda, criptomoneda_id)
    if not criptomoneda:
        raise HTTPException(status_code=404, detail="Criptomoneda no encontrada")
    return criptomoneda

@criptomoneda_router.post("/", response_model=Cryptomoneda, status_code=201)
def create_criptomoneda(criptomoneda: Cryptomoneda, db: SessionDep):
    db_criptomoneda = Cryptomoneda.from_orm(criptomoneda)
    db.add(db_criptomoneda)
    db.commit()
    db.refresh(db_criptomoneda)
    return db_criptomoneda

@criptomoneda_router.delete("/{criptomoneda_id}", status_code=204)
def delete_criptomoneda(criptomoneda_id: int, db: SessionDep):
    criptomoneda = db.get(Cryptomoneda, criptomoneda_id)
    if not criptomoneda:
        raise HTTPException(status_code=404, detail="Criptomoneda no encontrada")
    db.delete(criptomoneda)
    db.commit()