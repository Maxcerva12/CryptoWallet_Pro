# Sistema de Pagos con Criptomonedas - Backend

Sistema de pagos con criptomonedas simuladas usando FastAPI y PostgreSQL.

## Requisitos

- Python 3.10+
- PostgreSQL 13+
- pip

## Instalación

1. Clonar el repositorio y navegar a la carpeta backend:

```
cd backend
```

2. Crear y activar entorno virtual:

```
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
```

3. Instalar dependencias:

```
pip install -r requirements.txt
```

4. Configurar variables de entorno:

```
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

5. Crear la base de datos en PostgreSQL:

```
CREATE DATABASE crypto_payment_db;
```

## Ejecución

```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

La API estará disponible en: http://localhost:8000

Documentación interactiva: http://localhost:8000/docs

## Estructura del Proyecto

```
backend/
├── app/
│   ├── main.py              # Punto de entrada de la aplicación
│   ├── core/                # Configuración global
│   ├── api/                 # Endpoints de la API
│   ├── models/              # Modelos de base de datos
│   ├── schemas/             # Esquemas Pydantic
│   ├── services/            # Lógica de negocio
│   └── utils/               # Utilidades
├── tests/                   # Tests unitarios e integración
└── requirements.txt         # Dependencias
```
