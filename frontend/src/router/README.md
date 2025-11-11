# 📁 Router

Esta carpeta contiene toda la configuración de rutas de la aplicación.

## Archivos

### `AppRouter.tsx`

Componente principal que define todas las rutas de la aplicación (públicas y privadas).

### `PrivateRoute.tsx`

Componente HOC (Higher Order Component) que protege rutas que requieren autenticación.

- Verifica si el usuario está autenticado
- Redirige a `/login` si no está autenticado
- Muestra un loader mientras verifica la autenticación

### `PublicRoute.tsx`

Componente HOC para rutas públicas (como login, registro).

- Redirige a `/dashboard` si el usuario ya está autenticado
- Evita que usuarios autenticados accedan a la página de login

### `index.ts`

Archivo de barrel que exporta todos los componentes del router.

## Uso

```tsx
import { AppRouter } from "./router";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## Agregar Nuevas Rutas

### Ruta Privada (requiere autenticación)

```tsx
<Route
  path="/nueva-ruta"
  element={
    <PrivateRoute>
      <NuevaPage />
    </PrivateRoute>
  }
/>
```

### Ruta Pública

```tsx
<Route
  path="/publica"
  element={
    <PublicRoute>
      <PublicaPage />
    </PublicRoute>
  }
/>
```

### Ruta Normal (sin protección)

```tsx
<Route path="/about" element={<AboutPage />} />
```
