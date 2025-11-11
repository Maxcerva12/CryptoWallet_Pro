# CryptoWallet Pro - Frontend 🪙

Frontend de la aplicación CryptoWallet Pro construido con React + TypeScript + Vite.

## 🚀 Stack Tecnológico

- **React 19.1.1** - Biblioteca UI
- **TypeScript** - Type safety
- **Vite 7.1.10** - Build tool y dev server
- **React Router DOM** - Navegación
- **Tailwind CSS v3** - Estilos
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificaciones
- **JWT Decode** - Manejo de tokens

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   └── Navbar.tsx  # Barra de navegación principal
│   ├── context/        # React Context
│   │   └── AuthContext.tsx  # Estado global de autenticación
│   ├── pages/          # Páginas de la aplicación
│   │   ├── Dashboard.tsx    # Panel principal
│   │   ├── Login.tsx        # Inicio de sesión
│   │   ├── Register.tsx     # Registro de usuario
│   │   ├── Transfer.tsx     # Transferencias
│   │   ├── Transactions.tsx # Historial
│   │   ├── QRScan.tsx       # Escaneo QR
│   │   └── Profile.tsx      # Perfil de usuario
│   ├── router/         # Configuración de rutas
│   │   ├── AppRouter.tsx    # Router principal
│   │   ├── PrivateRoute.tsx # Rutas protegidas
│   │   └── PublicRoute.tsx  # Rutas públicas
│   ├── services/       # Servicios API
│   │   ├── api.ts               # Cliente Axios
│   │   ├── auth.service.ts      # Auth
│   │   ├── wallet.service.ts    # Wallet
│   │   └── transaction.service.ts # Transacciones
│   ├── App.tsx         # Componente raíz
│   └── main.tsx        # Entry point
```

## ⚙️ Instalación

```bash
# Instalar dependencias
npm install
```

## 🏃 Ejecución

```bash
# Modo desarrollo (puerto 5174)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🌐 Rutas Disponibles

### Rutas Públicas

- `/login` - Inicio de sesión
- `/register` - Registro de usuario

### Rutas Privadas (requieren autenticación)

- `/dashboard` - Panel principal con balance y transacciones recientes
- `/transfer` - Nueva transferencia de fondos
- `/transactions` - Historial completo de transacciones
- `/qr-scan` - Escanear código QR para pagos
- `/profile` - Perfil y configuración de usuario

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) almacenados en localStorage:

- Token de acceso en `localStorage.getItem('token')`
- Datos de usuario en `localStorage.getItem('user')`

## 🎨 Estilos

Se utiliza Tailwind CSS v3 con clases personalizadas:

```css
/* Colores primarios */
.bg-primary-500 {
  background: #3b82f6;
}
.text-primary-600 {
  color: #2563eb;
}

/* Componentes personalizados */
.btn-primary
  -
  Botón
  primario
  .btn-secondary
  -
  Botón
  secundario
  .card
  -
  Tarjeta
  con
  sombra
  .input-field
  -
  Campo
  de
  entrada
  .spinner
  -
  Indicador
  de
  carga;
```

## 📝 Componentes Principales

### AuthContext

Proporciona estado global de autenticación:

```tsx
const { user, login, register, logout, isAuthenticated } = useAuth();
```

### PrivateRoute

Protege rutas que requieren autenticación:

```tsx
<PrivateRoute>
  <Dashboard />
</PrivateRoute>
```

### Navbar

Barra de navegación con enlaces activos y balance:

```tsx
<Navbar /> // Se muestra en todas las páginas privadas
```

## 🔌 Servicios API

### auth.service.ts

```typescript
login(credentials); // Iniciar sesión
register(data); // Registrar usuario
logout(); // Cerrar sesión
getCurrentUser(); // Obtener usuario actual
isAuthenticated(); // Verificar autenticación
```

### wallet.service.ts

```typescript
getBalance(); // Obtener balance
getMyWallet(); // Obtener wallet completa
transfer(data); // Enviar transferencia
```

### transaction.service.ts

```typescript
getHistory(page, limit); // Obtener historial
getTransactionById(id); // Obtener por ID
```

## 🧪 Credenciales de Prueba

Usuario regular:

- Email: `juan.perez@email.com`
- Password: `User123!`

Comerciante:

- Email: `comercio@tienda.com`
- Password: `Merchant123!`

Admin:

- Email: `admin@cryptowallet.com`
- Password: `Admin123!`

## 🔧 Variables de Entorno

El frontend se conecta por defecto a:

```
VITE_API_URL=http://localhost:5000/api
```

## 📦 Scripts Disponibles

```json
{
  "dev": "vite", // Iniciar servidor desarrollo
  "build": "vite build", // Construir para producción
  "preview": "vite preview" // Vista previa del build
}
```

## 🐛 Solución de Problemas

### Error CORS

Si ves errores de CORS, asegúrate de que el backend esté ejecutándose y tenga configurado:

```javascript
FRONTEND_URL=http://localhost:5174
```

### Error 404 en rutas

Asegúrate de que el backend esté corriendo en `http://localhost:5000`

### Token expirado

Si el token expira, la aplicación te redirigirá automáticamente al login

## 🚀 Características Implementadas

✅ Sistema de autenticación completo (login/register/logout)  
✅ Dashboard con balance y transacciones recientes  
✅ Transferencias entre wallets  
✅ Historial completo de transacciones con filtros  
✅ Escaneo de códigos QR para pagos  
✅ Perfil de usuario con información de wallet  
✅ Navegación con barra superior (Navbar)  
✅ Rutas protegidas con guards  
✅ Manejo de errores con notificaciones toast  
✅ Diseño responsive (móvil y escritorio)  
✅ Indicadores de carga (loading states)  
✅ Validación de formularios

## 📱 Responsive Design

La aplicación es completamente responsive:

- **Móvil** (< 768px): Navegación en dos filas
- **Tablet** (768px - 1024px): Layout optimizado
- **Desktop** (> 1024px): Navegación horizontal completa

## 🎯 Próximas Mejoras

- [ ] Panel de administración
- [ ] Dashboard para comerciantes
- [ ] Cambio de contraseña
- [ ] Autenticación de dos factores
- [ ] Exportar transacciones a CSV
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Tests unitarios y e2e
