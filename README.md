# 🪙 CryptoWallet Pro - Sistema de Pagos con Criptomonedas

## 📋 Descripción del Proyecto

Sistema MVP de pagos con criptomonedas simuladas para entorno académico. Implementa gestión de wallets virtuales, pagos mediante códigos QR y simulación de blockchain.

## 🎯 Requisitos Funcionales Implementados

### Gestión de Usuarios (RF-01 a RF-04)

- ✅ Registro con email, contraseña y nombre completo
- ✅ Autenticación mediante login
- ✅ Actualización de perfil
- ✅ Cierre de sesión seguro

### Gestión de Wallets (RF-05 a RF-09)

- ✅ Creación automática de wallet al registro
- ✅ Balance inicial de 1000 CryptoCoins (CC)
- ✅ Consulta de saldo actual
- ✅ ID único de wallet por usuario
- ✅ Historial de transacciones

### Sistema de Pagos QR (RF-10 a RF-15)

- ✅ Generación de códigos QR únicos
- ✅ Escaneo/validación de QR
- ✅ Validación de saldo suficiente
- ✅ Procesamiento de pagos
- ✅ Confirmación de transacciones

### Gestión de Comercios (RF-16 a RF-19)

- ✅ Registro de comercios
- ✅ Panel de generación de QR
- ✅ Historial de pagos recibidos
- ✅ Consulta de balance

### Simulación Blockchain (RF-20 a RF-23)

- ✅ Registro inmutable de transacciones
- ✅ Bloques encadenados con hash
- ✅ Consulta de transacciones por ID

### Panel Administrativo (RF-24 a RF-26)

- ✅ Rol de administrador
- ✅ Estadísticas del sistema
- ✅ Listado de todas las transacciones

## 🛠️ Stack Tecnológico

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL
- **ORM:** Sequelize
- **Autenticación:** JWT + bcrypt
- **Validación:** express-validator
- **Generación QR:** qrcode

### Frontend

- **Framework:** React.js 18+
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **UI:** Material-UI / TailwindCSS
- **Estado:** Context API
- **QR Scanner:** html5-qrcode

### DevOps

- **Control de versiones:** Git
- **Gestión de paquetes:** npm
- **Variables de entorno:** dotenv

## 📦 Instalación

### Prerrequisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm o yarn
- Git

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd CryptoWallet_Pro
```

### 2. Configurar Base de Datos

```sql
-- Ejecutar en PostgreSQL
CREATE DATABASE Wallet_db;
```

### 3. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Wallet_db
DB_USER=postgres
DB_PASSWORD=123456

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_2024
JWT_EXPIRES_IN=30m

# App Config
INITIAL_BALANCE=1000
TRANSACTION_FEE=0.01
```

Inicializar la base de datos:

```bash
npm run migrate
npm run seed # (opcional - datos de prueba)
```

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=CryptoWallet Pro
```

## 🚀 Ejecución

### Modo Desarrollo

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

La aplicación estará disponible en:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Modo Producción

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

## 👥 Usuarios de Prueba

### Administrador

- **Email:** admin@cryptowallet.com
- **Password:** Admin123!

### Usuario Regular

- **Email:** user@example.com
- **Password:** User123!

### Comercio

- **Email:** comercio@example.com
- **Password:** Comercio123!

## 📚 Estructura del Proyecto

```
CryptoWallet_Pro/
├── backend/
│   ├── config/
│   │   ├── database.js          # Configuración de PostgreSQL
│   │   └── constants.js         # Constantes del sistema
│   ├── controllers/
│   │   ├── authController.js    # Login/Register
│   │   ├── userController.js    # Gestión usuarios
│   │   ├── walletController.js  # Gestión wallets
│   │   ├── qrController.js      # Generación/validación QR
│   │   ├── transactionController.js
│   │   ├── merchantController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Wallet.js
│   │   ├── Transaction.js
│   │   ├── Block.js             # Simulación blockchain
│   │   ├── Merchant.js
│   │   └── QRPayment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── walletRoutes.js
│   │   ├── qrRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── merchantRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── auth.js              # Validación JWT
│   │   ├── roleCheck.js         # Verificación de roles
│   │   ├── validation.js        # Validaciones input
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── blockchainService.js # Simulación blockchain
│   │   ├── walletService.js
│   │   ├── qrService.js
│   │   └── transactionService.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── hashGenerator.js
│   │   └── validators.js
│   ├── migrations/              # Migraciones DB
│   ├── seeders/                 # Datos de prueba
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── wallet/
│   │   │   │   ├── WalletBalance.jsx
│   │   │   │   ├── TransactionHistory.jsx
│   │   │   │   └── SendCrypto.jsx
│   │   │   ├── qr/
│   │   │   │   ├── QRGenerator.jsx
│   │   │   │   ├── QRScanner.jsx
│   │   │   │   └── PaymentConfirmation.jsx
│   │   │   ├── merchant/
│   │   │   │   ├── MerchantDashboard.jsx
│   │   │   │   ├── GeneratePaymentQR.jsx
│   │   │   │   └── ReceivedPayments.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       └── SystemStats.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WalletPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── MerchantPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── services/
│   │   │   ├── api.js           # Cliente Axios
│   │   │   ├── authService.js
│   │   │   ├── walletService.js
│   │   │   ├── qrService.js
│   │   │   └── transactionService.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── WalletContext.jsx
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── docs/
    ├── arquitectura.md
    ├── casos_de_uso.md
    ├── manual_usuario.md
    ├── manual_tecnico.md
    └── diagramas/
        ├── caso_uso.png
        ├── clases.png
        ├── secuencia.png
        └── componentes.png
```

## 🔐 Seguridad Implementada

- ✅ Passwords hasheadas con bcrypt (RNF-04)
- ✅ JWT con expiración de 30 minutos (RNF-05)
- ✅ Validación de inputs (RNF-06)
- ✅ Validación server-side de transacciones (RNF-07)
- ✅ Protección contra SQL Injection y XSS
- ✅ CORS configurado
- ✅ Rate limiting en endpoints sensibles

## 📊 Arquitectura del Sistema

### Patrón de Diseño: MVC + Repository

- **Models:** Definición de entidades (Sequelize ORM)
- **Controllers:** Lógica de negocio y manejo de requests
- **Routes:** Definición de endpoints REST
- **Services:** Lógica de negocio compleja (Blockchain, Wallets)
- **Middleware:** Autenticación, validación, manejo de errores

### Simulación Blockchain

Implementa una estructura de bloques encadenados:

- Cada bloque contiene: hash, previousHash, timestamp, transactions, nonce
- Hash calculado con SHA-256
- Validación de integridad de la cadena
- 2 implementaciones intercambiables (Simulation A y B)

## 🧪 Pruebas

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📖 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuario actual

### Wallets

- `GET /api/wallets/balance` - Consultar saldo
- `GET /api/wallets/transactions` - Historial
- `POST /api/wallets/transfer` - Transferir CC

### QR Payments

- `POST /api/qr/generate` - Generar QR de pago
- `POST /api/qr/validate` - Validar y procesar pago
- `GET /api/qr/:id` - Consultar info de QR

### Comercios

- `POST /api/merchants/register` - Registro comercio
- `GET /api/merchants/payments` - Pagos recibidos
- `GET /api/merchants/balance` - Balance comercio

### Admin

- `GET /api/admin/stats` - Estadísticas sistema
- `GET /api/admin/users` - Lista usuarios
- `GET /api/admin/transactions` - Todas las transacciones

## 🤝 Contribución

Este es un proyecto académico. Para contribuir:

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Licencia

Proyecto académico - Universidad Universidad Cooperativa de Colombia - 2025

## 👨‍💻 Equipo de Desarrollo

- Estudiante 1 - Nicoalas Pinzon
- Estudiante 2 - Maxymiliano Cervantes
- Estudiante 3 - Juan Nuñez
- Estudiante 4 - Juan Arevalo
## 📞 Contacto

Para preguntas sobre el proyecto: maximiliano.cervante@campusucc.edu.co

---

**Nota:** Este es un proyecto con fines educativos. No usar en producción con fondos reales.
