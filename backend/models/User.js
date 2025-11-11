/**
 * Modelo de Usuario
 * RF-01 a RF-04: Gestión de usuarios
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../config/constants");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "full_name", // Mapeo explícito a snake_case
      validate: {
        notEmpty: {
          msg: "El nombre completo es requerido",
        },
        len: {
          args: [2, 100],
          msg: "El nombre debe tener entre 2 y 100 caracteres",
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: "Este email ya está registrado",
      },
      validate: {
        isEmail: {
          msg: "Debe ser un email válido",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La contraseña es requerida",
        },
        len: {
          args: [6, 100],
          msg: "La contraseña debe tener al menos 6 caracteres",
        },
      },
    },
    role: {
      type: DataTypes.ENUM(ROLES.USER, ROLES.MERCHANT, ROLES.ADMIN),
      defaultValue: ROLES.USER,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active", // Mapeo explícito a snake_case
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login", // Mapeo explícito a snake_case
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "login_attempts", // Mapeo explícito a snake_case
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "lock_until", // Mapeo explícito a snake_case
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true, // Usar snake_case automáticamente
    hooks: {
      // Hash de contraseña antes de crear usuario
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hash de contraseña antes de actualizar
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

/**
 * Método para comparar contraseñas
 */
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Método para verificar si la cuenta está bloqueada
 */
User.prototype.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/**
 * Incrementar intentos de login fallidos
 */
User.prototype.incrementLoginAttempts = async function () {
  // Si ya existe un bloqueo expirado, resetear
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.update({
      loginAttempts: 1,
      lockUntil: null,
    });
  }

  // Incrementar intentos
  const updates = { loginAttempts: this.loginAttempts + 1 };

  // Bloquear cuenta después de 5 intentos fallidos
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutos
  }

  return await this.update(updates);
};

/**
 * Resetear intentos de login
 */
User.prototype.resetLoginAttempts = async function () {
  return await this.update({
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: new Date(),
  });
};

/**
 * Ocultar campos sensibles al serializar
 */
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.loginAttempts;
  delete values.lockUntil;
  return values;
};

module.exports = User;
