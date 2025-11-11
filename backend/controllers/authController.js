/**
 * Controlador de Autenticación
 * Maneja registro, login y perfil de usuario
 */

const authService = require("../services/authService");
const { asyncHandler } = require("../middleware/errorHandler");
const { body } = require("express-validator");
const { validate } = require("../middleware/validation");

/**
 * Validaciones para registro
 */
const registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("El nombre completo es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("role")
    .optional()
    .isIn(["user", "merchant", "admin"])
    .withMessage("Rol no válido"),

  validate,
];

/**
 * Validaciones para login
 */
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido"),

  body("password").notEmpty().withMessage("La contraseña es requerida"),

  validate,
];

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json(result);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json(result);
});

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.userId);

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.userId, req.body);

  res.status(200).json(result);
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await authService.changePassword(
    req.userId,
    currentPassword,
    newPassword
  );

  res.status(200).json(result);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (cliente debe eliminar el token)
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // En implementación JWT stateless, el logout se maneja en el cliente
  // eliminando el token. Aquí solo confirmamos la acción.

  res.status(200).json({
    success: true,
    message: "Sesión cerrada exitosamente",
  });
});

module.exports = {
  register,
  registerValidation,
  login,
  loginValidation,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
};
