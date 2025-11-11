-- Script SQL para crear manualmente todas las tablas de CryptoWallet Pro
-- Ejecutar este script en pgAdmin o desde psql si hay problemas con Sequelize

-- Limpiar schema público
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Crear tipos ENUM
CREATE TYPE enum_users_role AS ENUM('user', 'merchant', 'admin');
CREATE TYPE enum_transactions_type AS ENUM('transfer', 'qr_payment', 'reward', 'fee');
CREATE TYPE enum_transactions_status AS ENUM('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE enum_qr_payments_status AS ENUM('active', 'used', 'expired', 'cancelled');

-- Tabla: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role enum_users_role NOT NULL DEFAULT 'user',
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: wallets
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  address VARCHAR(255) NOT NULL UNIQUE,
  balance DECIMAL(20,8) NOT NULL DEFAULT 1000,
  currency VARCHAR(10) NOT NULL DEFAULT 'CC',
  is_active BOOLEAN DEFAULT true,
  last_transaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN wallets.address IS 'Dirección única de la wallet (simulada)';

-- Tabla: blocks
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_number SERIAL UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  hash VARCHAR(64) NOT NULL UNIQUE,
  previous_hash VARCHAR(64) NOT NULL,
  nonce INTEGER NOT NULL DEFAULT 0,
  difficulty INTEGER NOT NULL DEFAULT 2,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  merkle_root VARCHAR(64),
  mined_by UUID,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN blocks.hash IS 'Hash SHA-256 del bloque actual';
COMMENT ON COLUMN blocks.previous_hash IS 'Hash del bloque anterior (encadenamiento)';
COMMENT ON COLUMN blocks.nonce IS 'Número usado una vez para el proof-of-work';
COMMENT ON COLUMN blocks.merkle_root IS 'Raíz del árbol de Merkle de transacciones';
COMMENT ON COLUMN blocks.mined_by IS 'Usuario que "minó" el bloque (simulado)';

CREATE UNIQUE INDEX blocks_block_number ON blocks(block_number);
CREATE INDEX blocks_hash ON blocks(hash);
CREATE INDEX blocks_previous_hash ON blocks(previous_hash);

-- Tabla: transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash VARCHAR(255) NOT NULL UNIQUE,
  from_wallet_id UUID NOT NULL REFERENCES wallets(id),
  to_wallet_id UUID NOT NULL REFERENCES wallets(id),
  amount DECIMAL(20,8) NOT NULL,
  fee DECIMAL(20,8) NOT NULL DEFAULT 0,
  total_amount DECIMAL(20,8) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'CC',
  type enum_transactions_type NOT NULL DEFAULT 'transfer',
  status enum_transactions_status NOT NULL DEFAULT 'pending',
  description VARCHAR(255),
  metadata JSONB,
  block_id UUID REFERENCES blocks(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN transactions.tx_hash IS 'Hash único de la transacción (simulación blockchain)';
COMMENT ON COLUMN transactions.total_amount IS 'Monto total = amount + fee';
COMMENT ON COLUMN transactions.metadata IS 'Información adicional (QR ID, comercio, etc.)';
COMMENT ON COLUMN transactions.block_id IS 'ID del bloque que contiene esta transacción';

-- Tabla: merchants
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  business_name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  logo VARCHAR(255),
  address VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),
  tax_id VARCHAR(50),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  total_sales DECIMAL(20,8) NOT NULL DEFAULT 0,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN merchants.logo IS 'URL o path del logo del comercio';
COMMENT ON COLUMN merchants.tax_id IS 'RUC o identificación tributaria';
COMMENT ON COLUMN merchants.is_verified IS 'Comercio verificado por administrador';
COMMENT ON COLUMN merchants.total_sales IS 'Total acumulado de ventas';
COMMENT ON COLUMN merchants.total_transactions IS 'Número total de transacciones';
COMMENT ON COLUMN merchants.metadata IS 'Información adicional del comercio';

CREATE INDEX merchants_user_id ON merchants(user_id);
CREATE INDEX merchants_category ON merchants(category);
CREATE INDEX merchants_is_active_is_verified ON merchants(is_active, is_verified);

-- Tabla: qr_payments
CREATE TABLE qr_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT NOT NULL UNIQUE,
  qr_token VARCHAR(255) NOT NULL UNIQUE,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  merchant_wallet_id UUID NOT NULL REFERENCES wallets(id),
  amount DECIMAL(20,8) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'CC',
  description VARCHAR(255),
  status enum_qr_payments_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES users(id),
  transaction_id UUID REFERENCES transactions(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN qr_payments.qr_code IS 'Código QR en formato base64';
COMMENT ON COLUMN qr_payments.qr_token IS 'Token único del QR para validación';
COMMENT ON COLUMN qr_payments.used_by IS 'Usuario que realizó el pago';
COMMENT ON COLUMN qr_payments.metadata IS 'Información adicional del pago';

CREATE UNIQUE INDEX qr_payments_qr_token ON qr_payments(qr_token);
CREATE INDEX qr_payments_merchant_id ON qr_payments(merchant_id);
CREATE INDEX qr_payments_status ON qr_payments(status);
CREATE INDEX qr_payments_expires_at ON qr_payments(expires_at);

-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
