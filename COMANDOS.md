# 🚀 Scripts de Desarrollo - CryptoWallet Pro

## Backend

```powershell
# Iniciar servidor backend
cd backend
npm run dev

# Seed de base de datos
cd backend
npm run db:seed

# Tests API
cd backend
.\test-api.ps1
```

## Frontend

```powershell
# Iniciar servidor frontend
cd frontend
npm run dev

# Build para producción
cd frontend
npm run build

# Preview del build
cd frontend
npm run preview
```

## Ambos Servidores

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## URLs

- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## Credenciales de Prueba

### Usuario Regular

- Email: `juan.perez@email.com`
- Password: `User123!`

### Administrador

- Email: `admin@cryptowallet.com`
- Password: `Admin123!`

### Comercio

- Email: `comercio1@cryptowallet.com`
- Password: `Merchant123!`
