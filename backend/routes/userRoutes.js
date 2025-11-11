/**
 * Rutas de Usuario
 * Gestión de perfil y configuración
 */

const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { authenticate } = require("../middleware/auth");
const { isOwnerOrAdmin } = require("../middleware/roleCheck");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { sanitizeInput } = require("../middleware/validation");

router.use(authenticate);
router.use(sanitizeInput);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener información de un usuario
 * @access  Private (owner or admin)
 */
router.get(
  "/:id",
  isOwnerOrAdmin("id"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    res.status(200).json({
      success: true,
      user,
    });
  })
);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario
 * @access  Private (owner or admin)
 */
router.put(
  "/:id",
  isOwnerOrAdmin("id"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, phone } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    await user.update({
      fullName: fullName || user.fullName,
      phone: phone !== undefined ? phone : user.phone,
    });

    res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  })
);

module.exports = router;
