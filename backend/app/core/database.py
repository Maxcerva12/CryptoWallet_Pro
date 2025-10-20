from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Crear el engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Muestra las queries SQL en consola si DEBUG=True
    pool_pre_ping=True,  # Verifica la conexión antes de usar
    pool_size=10,  # Número de conexiones en el pool
    max_overflow=20  # Conexiones adicionales si se necesitan
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para los modelos ORM
Base = declarative_base()


# Dependency para obtener la sesión de BD
def get_db():
    """
    Generador que proporciona una sesión de base de datos.
    Se usa como dependencia en los endpoints de FastAPI.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
