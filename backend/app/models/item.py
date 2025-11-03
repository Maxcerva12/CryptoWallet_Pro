from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DECIMAL, func, DateTime
from pydantic import EmailStr


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: EmailStr = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True, min_length=3, max_length=50)
    hashed_password: str
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    
    wallets: List["Wallet"] = Relationship(back_populates="usuario")
    transacciones: List["Transaction"] = Relationship(back_populates="usuario")


class UserCreate(SQLModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)


class UserRead(SQLModel):
    id: int
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    is_active: bool
    created_at: datetime


class UserUpdate(SQLModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    is_active: Optional[bool] = None


class UserProfile(SQLModel):
    id: int
    email: EmailStr
    username: str
    first_name: str
    last_name: str


class UserLogin(SQLModel):
    email: EmailStr
    password: str


class CryptomonedaBase(SQLModel):
    nombre: str
    simbolo: str
    red: Optional[str] = None
    

class Cryptomoneda(CryptomonedaBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    valor_usd: Decimal = Field(
        default=Decimal("0.0"), 
        sa_column=Column(DECIMAL(precision=18, scale=8))
    )
    
    wallets: List["Wallet"] = Relationship(back_populates="cryptomoneda") 
    transacciones: List["Transaction"] = Relationship(back_populates="cryptomoneda")


class WalletBase(SQLModel):
    direccion_wallet: str
    

class Wallet(WalletBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id")
    cryptomoneda_id: int = Field(foreign_key="cryptomoneda.id")
    balance: Decimal = Field(
        default=Decimal("0.0"), 
        sa_column=Column(DECIMAL(precision=18, scale=8))
    )
    
    usuario: "User" = Relationship(back_populates="wallets")
    cryptomoneda: "Cryptomoneda" = Relationship(back_populates="wallets")
    
class WalletCreate(WalletBase):
    usuario_id: int
    cryptomoneda_id: int

class WalletRead(WalletBase):
    id: int
    usuario_id: int
    cryptomoneda_id: int
    balance: Decimal

class WalletUpdate(WalletBase):
    direccion_wallet: Optional[str] = None
    balance: Optional[Decimal] = None


class TransactionType(str, Enum):
    Transfer = "Transfer"


class TransactionStatus(str, Enum):
    Pending = "Pending"
    Completed = "Completed"
    Failed = "Failed"
    Cancelled = "Cancelled"


class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id")
    cryptomoneda_id: int = Field(foreign_key="cryptomoneda.id")
    wallet_origen_id: Optional[int] = Field(default=None, foreign_key="wallet.id")
    wallet_destino_id: Optional[int] = Field(default=None, foreign_key="wallet.id")
    
    tipo: TransactionType
    estado: TransactionStatus = Field(default=TransactionStatus.Pending)

    cantidad: Decimal = Field(sa_column=Column(DECIMAL(precision=18, scale=8)))
    precio_unitario: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(precision=18, scale=8)))
    total_usd: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(precision=18, scale=2)))
    comision: Optional[Decimal] = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(precision=18, scale=8)))

    hash_transaccion: Optional[str] = Field(default=None, max_length=255)
    direccion_destino: Optional[str] = Field(default=None, max_length=255)

    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    completed_at: Optional[datetime] = Field(default=None)

    usuario: "User" = Relationship(back_populates="transacciones")
    cryptomoneda: "Cryptomoneda" = Relationship(back_populates="transacciones")
    wallet_origen: Optional["Wallet"] = Relationship(sa_relationship_kwargs={"foreign_keys": "[Transaction.wallet_origen_id]"})
    wallet_destino: Optional["Wallet"] = Relationship(sa_relationship_kwargs={"foreign_keys": "[Transaction.wallet_destino_id]"})


class TransactionCreate(SQLModel):
    usuario_id: int
    cryptomoneda_id: int
    wallet_origen_id: Optional[int] = None
    wallet_destino_id: Optional[int] = None
    tipo: TransactionType
    cantidad: Decimal
    precio_unitario: Optional[Decimal] = None
    direccion_destino: Optional[str] = None


class TransactionRead(SQLModel):
    id: int
    usuario_id: int
    cryptomoneda_id: int
    tipo: TransactionType
    estado: TransactionStatus
    cantidad: Decimal
    precio_unitario: Optional[Decimal] = None
    total_usd: Optional[Decimal] = None
    comision: Optional[Decimal] = None
    hash_transaccion: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class TransactionUpdate(SQLModel):
    estado: Optional[TransactionStatus] = None
    hash_transaccion: Optional[str] = None
    completed_at: Optional[datetime] = None


class TransactionFilter(SQLModel):
    usuario_id: Optional[int] = None
    cryptomoneda_id: Optional[int] = None
    tipo: Optional[TransactionType] = None
    estado: Optional[TransactionStatus] = None