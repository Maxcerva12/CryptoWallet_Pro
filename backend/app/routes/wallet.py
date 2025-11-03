from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Annotated, List, Optional
from app.config.db import engine
from app.models.item import Wallet, WalletBase, User, Cryptomoneda
from app.routes.deps.db_session import SessionDep
from app.routes.usuario import get_current_user

router = APIRouter(prefix="/api/wallets", tags=["Wallets"])


@router.post("/", response_model=Wallet, status_code=201)
def crear_wallet(
    wallet: WalletBase,
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    usuario = db.get(User, current_user.id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    cryptomoneda = db.get(Cryptomoneda, wallet.cryptomoneda_id)
    if not cryptomoneda:
        raise HTTPException(status_code=404, detail="Criptomoneda no encontrada")
    
    existing_wallet = db.exec(
        select(Wallet).where(
            Wallet.usuario_id == current_user.id,
            Wallet.cryptomoneda_id == wallet.cryptomoneda_id
        )
    ).first()
    
    if existing_wallet:
        raise HTTPException(status_code=400, detail="Ya tienes una wallet para esta criptomoneda")
    
    db_wallet = Wallet(
        direccion_wallet=wallet.direccion_wallet,
        usuario_id=current_user.id,
        cryptomoneda_id=wallet.cryptomoneda_id
    )
    
    db.add(db_wallet)
    db.commit()
    db.refresh(db_wallet)
    return db_wallet


@router.get("/", response_model=List[Wallet])
def obtener_wallets(
    skip: int = 0,
    limit: int = 100,
    usuario_id: Optional[int] = Query(None),
    cryptomoneda_id: Optional[int] = Query(None),
    db: SessionDep = None
):
    query = select(Wallet)
    
    if usuario_id:
        query = query.where(Wallet.usuario_id == usuario_id)
    if cryptomoneda_id:
        query = query.where(Wallet.cryptomoneda_id == cryptomoneda_id)
    
    query = query.offset(skip).limit(limit)
    wallets = db.exec(query).all()
    return wallets


@router.get("/{wallet_id}", response_model=Wallet)
def obtener_wallet(wallet_id: int, db: SessionDep):
    wallet = db.get(Wallet, wallet_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet no encontrada")
    return wallet


@router.put("/{wallet_id}", response_model=Wallet)
def actualizar_wallet(
    wallet_id: int,
    wallet_update: WalletBase,
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    wallet = db.get(Wallet, wallet_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet no encontrada")
    
    if wallet.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para actualizar esta wallet")
    
    wallet_data = wallet_update.dict(exclude_unset=True)
    for key, value in wallet_data.items():
        setattr(wallet, key, value)
    
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet


@router.delete("/{wallet_id}", status_code=204)
def eliminar_wallet(
    wallet_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    wallet = db.get(Wallet, wallet_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet no encontrada")
    
    if wallet.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta wallet")
    
    db.delete(wallet)
    db.commit()


@router.get("/usuario/{usuario_id}", response_model=List[Wallet])
def obtener_wallets_usuario(usuario_id: int, db: SessionDep):
    usuario = db.get(User, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    query = select(Wallet).where(Wallet.usuario_id == usuario_id)
    wallets = db.exec(query).all()
    return wallets


@router.get("/mi-perfil/mis-wallets", response_model=List[Wallet])
def obtener_mis_wallets(
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    query = select(Wallet).where(Wallet.usuario_id == current_user.id)
    wallets = db.exec(query).all()
    return wallets