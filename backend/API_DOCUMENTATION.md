# 📘 API Documentation - CryptoWallet Pro

## Base URL

```
http://localhost:5000/api
```

## Autenticación

La mayoría de endpoints requieren autenticación mediante JWT Bearer Token.

**Header:**

```
Authorization: Bearer <token>
```

---

## 🔐 Auth Endpoints

### 1. Registrar Usuario

```http
POST /api/auth/register
```

**Body:**

```json
{
  "fullName": "Juan Pérez",
  "email": "juan@email.com",
  "password": "User123!",
  "role": "user"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "uuid",
    "fullName": "Juan Pérez",
    "email": "juan@email.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

### 2. Login

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "juan@email.com",
  "password": "User123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": "uuid",
    "fullName": "Juan Pérez",
    "email": "juan@email.com",
    "role": "user",
    "wallet": {
      "address": "CC1234567890ABC",
      "balance": 1000,
      "currency": "CC"
    }
  },
  "token": "jwt_token_here"
}
```

### 3. Obtener Usuario Actual

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "fullName": "Juan Pérez",
    "email": "juan@email.com",
    "role": "user",
    "wallet": {
      "id": "uuid",
      "address": "CC1234567890ABC",
      "balance": 1000,
      "currency": "CC"
    }
  }
}
```

---

## 💰 Wallet Endpoints

### 1. Obtener Mi Wallet

```http
GET /api/wallets/my-wallet
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "wallet": {
    "id": "uuid",
    "address": "CC1234567890ABC",
    "balance": 1000,
    "currency": "CC",
    "isActive": true,
    "lastTransactionAt": "2024-10-14T10:30:00Z",
    "createdAt": "2024-10-01T08:00:00Z"
  }
}
```

### 2. Obtener Balance

```http
GET /api/wallets/balance
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "balance": {
    "balance": 1000,
    "currency": "CC",
    "address": "CC1234567890ABC",
    "formatted": "1000.00 CC"
  }
}
```

### 3. Transferir Fondos

```http
POST /api/wallets/transfer
Authorization: Bearer <token>
```

**Body:**

```json
{
  "toWalletAddress": "CC9876543210XYZ",
  "amount": 50.5,
  "description": "Pago por servicio"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Transferencia realizada exitosamente",
  "data": {
    "transaction": {
      "id": "uuid",
      "txHash": "abc123...",
      "amount": 50.5,
      "fee": 0.505,
      "status": "completed"
    },
    "newBalance": {
      "balance": 949.495,
      "currency": "CC"
    }
  }
}
```

### 4. Historial de Transacciones

```http
GET /api/wallets/transactions?page=1&limit=10&type=transfer
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "txHash": "abc123...",
        "amount": 50.5,
        "type": "transfer",
        "status": "completed",
        "direction": "sent",
        "fromWallet": {
          "address": "CC1234567890ABC"
        },
        "toWallet": {
          "address": "CC9876543210XYZ"
        },
        "createdAt": "2024-10-14T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

## 📱 QR Endpoints

### 1. Generar QR de Pago (Merchant)

```http
POST /api/qr/generate
Authorization: Bearer <token>
```

**Body:**

```json
{
  "amount": 25.5,
  "description": "Almuerzo ejecutivo"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Código QR generado exitosamente",
  "data": {
    "id": "uuid",
    "token": "qr_token_abc123",
    "qrCode": "data:image/png;base64,iVBORw0KG...",
    "amount": 25.5,
    "currency": "CC",
    "description": "Almuerzo ejecutivo",
    "merchantName": "Restaurante El Buen Sabor",
    "expiresAt": "2024-10-14T11:00:00Z",
    "status": "active"
  }
}
```

### 2. Obtener Info de QR

```http
GET /api/qr/:token
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "token": "qr_token_abc123",
    "amount": 25.5,
    "currency": "CC",
    "description": "Almuerzo ejecutivo",
    "status": "active",
    "isValid": true,
    "isExpired": false,
    "merchant": {
      "id": "uuid",
      "businessName": "Restaurante El Buen Sabor",
      "category": "Restaurante"
    },
    "expiresAt": "2024-10-14T11:00:00Z"
  }
}
```

### 3. Procesar Pago QR

```http
POST /api/qr/pay
Authorization: Bearer <token>
```

**Body:**

```json
{
  "qrToken": "qr_token_abc123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "txHash": "xyz789...",
    "amount": 25.5,
    "currency": "CC",
    "merchantName": "Restaurante El Buen Sabor",
    "description": "Pago QR: Almuerzo ejecutivo",
    "timestamp": "2024-10-14T10:45:00Z"
  },
  "newBalance": {
    "balance": 974.5,
    "currency": "CC"
  }
}
```

---

## 🏪 Merchant Endpoints

### 1. Registrar Comercio

```http
POST /api/merchants/register
Authorization: Bearer <token>
```

**Body:**

```json
{
  "businessName": "Mi Tienda",
  "category": "Tecnología",
  "description": "Venta de productos tech",
  "phone": "+51 987654321",
  "address": "Av. Principal 123"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Comercio registrado exitosamente",
  "merchant": {
    "id": "uuid",
    "businessName": "Mi Tienda",
    "category": "Tecnología",
    "isVerified": false
  }
}
```

### 2. Obtener Mi Comercio

```http
GET /api/merchants/my-business
Authorization: Bearer <token>
```

### 3. Pagos Recibidos

```http
GET /api/merchants/payments?page=1&limit=10
Authorization: Bearer <token>
```

### 4. Balance del Comercio

```http
GET /api/merchants/balance
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "balance": {
    "balance": 1250.5,
    "currency": "CC"
  },
  "stats": {
    "totalSales": 1250.5,
    "totalTransactions": 45,
    "rating": 4.5
  }
}
```

---

## 👑 Admin Endpoints

### 1. Estadísticas del Sistema

```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 150,
      "active": 145,
      "merchants": 25,
      "recentRegistrations": 12
    },
    "wallets": {
      "total": 150,
      "totalBalance": 150000
    },
    "transactions": {
      "total": 1250,
      "completed": 1200,
      "pending": 50,
      "totalVolume": 45000,
      "recent": 89
    },
    "blockchain": {
      "totalBlocks": 125,
      "totalTransactions": 1200
    }
  }
}
```

### 2. Listar Usuarios

```http
GET /api/admin/users?page=1&limit=20&role=user
Authorization: Bearer <admin_token>
```

### 3. Listar Transacciones

```http
GET /api/admin/transactions?page=1&limit=20
Authorization: Bearer <admin_token>
```

### 4. Verificar Comercio

```http
PUT /api/admin/merchants/:merchantId/verify
Authorization: Bearer <admin_token>
```

### 5. Validar Blockchain

```http
GET /api/admin/blockchain/validate
Authorization: Bearer <admin_token>
```

---

## 📊 Códigos de Estado

| Código | Descripción                                |
| ------ | ------------------------------------------ |
| 200    | OK - Solicitud exitosa                     |
| 201    | Created - Recurso creado                   |
| 400    | Bad Request - Datos inválidos              |
| 401    | Unauthorized - No autenticado              |
| 403    | Forbidden - Sin permisos                   |
| 404    | Not Found - Recurso no encontrado          |
| 409    | Conflict - Conflicto (ej: email duplicado) |
| 500    | Internal Server Error - Error del servidor |

---

## 🔒 Roles

- **user**: Usuario regular, puede hacer transferencias y pagos
- **merchant**: Comercio, puede generar QR y recibir pagos
- **admin**: Administrador del sistema, acceso total

---

## 💡 Notas Importantes

1. **JWT Expiration**: Los tokens expiran en 30 minutos
2. **Rate Limiting**: Máximo 100 requests cada 15 minutos
3. **QR Expiration**: Los códigos QR expiran en 15 minutos
4. **Currency**: Todos los montos son en CryptoCoins (CC)
5. **Precision**: Los montos se manejan con 8 decimales

---

## 🧪 Testing con Postman

1. Importar la colección desde: `/docs/postman_collection.json`
2. Configurar variable de entorno `BASE_URL = http://localhost:5000`
3. Después del login, copiar el token a la variable `TOKEN`

---

## 📞 Soporte

Para dudas sobre la API, contactar al equipo de desarrollo.
