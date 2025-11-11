import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Transfer from "../pages/Transfer";
import Transactions from "../pages/Transactions";
import Profile from "../pages/Profile";

const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Ruta raíz redirige a login o dashboard según autenticación */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas Privadas */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/transfer"
        element={
          <PrivateRoute>
            <Transfer />
          </PrivateRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Ruta 404 - No encontrada */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900">404</h1>
              <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
              <a href="/" className="mt-8 inline-block btn-primary">
                Volver al inicio
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRouter;
