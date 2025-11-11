/**
 * Rutas de Transacciones
 * Consultas de transacciones individuales
 */

const express = require('express');
const router = express.Router();
const { Transaction, Wallet, User, Block } = require('../models');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @route   GET /api/transactions/:txHash
 * @desc    Obtener detalles de una transacción por hash
 * @access  Public
 */
router.get('/:txHash', asyncHandler(async (req, res) => {
  const { txHash } = req.params;
  
  const transaction = await Transaction.findOne({
    where: { txHash },
    include: [
      {
        model: Wallet,
        as: 'fromWallet',
        attributes: ['address'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['fullName']
        }]
      },
      {
        model: Wallet,
        as: 'toWallet',
        attributes: ['address'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['fullName']
        }]
      },
      {
        model: Block,
        as: 'block',
        attributes: ['blockNumber', 'hash', 'timestamp']
      }
    ]
  });
  
  if (!transaction) {
    throw new AppError('Transacción no encontrada', 404);
  }
  
  res.status(200).json({
    success: true,
    transaction
  });
}));

/**
 * @route   GET /api/transactions/:id/details
 * @desc    Obtener detalles de transacción por ID
 * @access  Private
 */
router.get('/:id/details',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: Wallet,
          as: 'fromWallet',
          attributes: ['address'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['fullName', 'email']
          }]
        },
        {
          model: Wallet,
          as: 'toWallet',
          attributes: ['address'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['fullName', 'email']
          }]
        },
        {
          model: Block,
          as: 'block'
        }
      ]
    });
    
    if (!transaction) {
      throw new AppError('Transacción no encontrada', 404);
    }
    
    res.status(200).json({
      success: true,
      transaction
    });
  })
);

module.exports = router;
