from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select
from typing import Annotated, List, Optional
from app.models.item import Transaction, TransactionCreate, TransactionRead, TransactionUpdate, TransactionStatus, TransactionType, User
from datetime import datetime
from decimal import Decimal
from app.routes.deps.db_session import SessionDep
from app.routes.usuario import get_current_user

router = APIRouter(prefix="/api/transacciones", tags=["Transacciones"])


@router.post("/", response_model=TransactionRead, status_code=201)
def create_transaction(
    transaction: TransactionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    db_transaction = Transaction(
        usuario_id=current_user.id,
        cryptomoneda_id=transaction.cryptomoneda_id,
        wallet_origen_id=transaction.wallet_origen_id,
        wallet_destino_id=transaction.wallet_destino_id,
        tipo=transaction.tipo,
        cantidad=transaction.cantidad,
        precio_unitario=transaction.precio_unitario,
        direccion_destino=transaction.direccion_destino,
        estado=TransactionStatus.Pending
    )

    if transaction.precio_unitario:
        db_transaction.total_usd = transaction.cantidad * transaction.precio_unitario

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.get("/", response_model=List[TransactionRead])
def read_transactions(
    skip: int = 0,
    limit: int = 100,
    
    usuario_id: Optional[int] = Query(None),
    cryptomoneda_id: Optional[int] = Query(None),
    tipo: Optional[TransactionType] = Query(None),
    estado: Optional[TransactionStatus] = Query(None),
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: SessionDep = None
):
    query = select(Transaction)

    if usuario_id:
        query = query.where(Transaction.usuario_id == usuario_id)
    if cryptomoneda_id:
        query = query.where(Transaction.cryptomoneda_id == cryptomoneda_id)
    if tipo:
        query = query.where(Transaction.tipo == tipo)
    if estado:
        query = query.where(Transaction.estado == estado)

    query = query.offset(skip).limit(limit)
    transacciones = db.exec(query).all()
    return transacciones


@router.get("/{transaction_id}", response_model=TransactionRead)
def obtener_transaccion(transaction_id: int, current_user: Annotated[User, Depends(get_current_user)],  db: SessionDep):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    return transaction


@router.put("/{transaction_id}", response_model=TransactionRead)
def actualizar_transaccion(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    if transaction.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para actualizar esta transacción")
    
    transaccion_data = transaction_update.dict(exclude_unset=True)
    for key, value in transaccion_data.items():
        setattr(transaction, key, value)

    if transaction_update.estado == TransactionStatus.Completed and not transaction.completed_at:
        transaction.completed_at = datetime.utcnow()

    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/usuario/{usuario_id}", response_model=List[TransactionRead])
def obtener_transacciones_usuario(usuario_id: int, db: SessionDep, current_user: Annotated[User, Depends(get_current_user)]):
    usuario = db.get(User, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    query = select(Transaction).where(Transaction.usuario_id == usuario_id)
    transacciones = db.exec(query).all()
    return transacciones


@router.get("/mi-perfil/mis-transacciones", response_model=List[TransactionRead])
def obtener_mis_transacciones(
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    query = select(Transaction).where(Transaction.usuario_id == current_user.id)
    transacciones = db.exec(query).all()
    return transacciones


@router.patch("/{transaccion_id}/estado", response_model=TransactionRead)
def cambiar_estado_transaccion(
    transaccion_id: int,
    nuevo_estado: TransactionStatus,
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    transaccion = db.get(Transaction, transaccion_id)
    if not transaccion:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    if transaccion.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para cambiar el estado de esta transacción")
    
    transaccion.estado = nuevo_estado
    
    if nuevo_estado == TransactionStatus.Completed:
        transaccion.completed_at = datetime.utcnow()
    
    db.add(transaccion)
    db.commit()
    db.refresh(transaccion)
    return transaccion


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: SessionDep
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    if transaction.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta transacción")
    
    db.delete(transaction)
    db.commit()