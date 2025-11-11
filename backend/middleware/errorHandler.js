/**
 * Middleware global de manejo de errores
 * Captura errores y devuelve respuestas consistentes
 */

const { Sequelize } = require("sequelize");

/**
 * Manejador de errores central
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Error de validación de Sequelize
  if (err instanceof Sequelize.ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Error de constraint único de Sequelize
  if (err instanceof Sequelize.UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: "El recurso ya existe",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: `${e.path} ya está en uso`,
      })),
    });
  }

  // Error de foreign key de Sequelize
  if (err instanceof Sequelize.ForeignKeyConstraintError) {
    return res.status(400).json({
      success: false,
      message: "Referencia inválida",
      error: "El recurso referenciado no existe",
    });
  }

  // Error de conexión de base de datos
  if (err instanceof Sequelize.ConnectionError) {
    return res.status(503).json({
      success: false,
      message: "Error de conexión con la base de datos",
    });
  }

  // Error personalizado con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "Error en la operación",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Error 404
  if (err.message === "Not Found") {
    return res.status(404).json({
      success: false,
      message: "Recurso no encontrado",
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Error interno del servidor"
        : err.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};

/**
 * Manejador de rutas no encontradas (404)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Wrapper para funciones async en rutas
 * Captura errores automáticamente
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Crear error personalizado
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError,
};
