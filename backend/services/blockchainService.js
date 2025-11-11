/**
 * Servicio de Blockchain (Simulación)
 * RF-23: Implementación de blockchain simulada
 * RNF-19 y RNF-20: Implementaciones intercambiables
 */

const { Block, Transaction } = require("../models");
const { BLOCKCHAIN_CONFIG } = require("../config/constants");
const crypto = require("crypto");

/**
 * Clase base de Blockchain (Interfaz)
 */
class BlockchainService {
  constructor() {
    this.difficulty = BLOCKCHAIN_CONFIG.DIFFICULTY;
  }

  async initialize() {
    throw new Error("Método initialize() debe ser implementado");
  }

  async addTransaction(transaction) {
    throw new Error("Método addTransaction() debe ser implementado");
  }

  async mineBlock() {
    throw new Error("Método mineBlock() debe ser implementado");
  }

  async validateChain() {
    throw new Error("Método validateChain() debe ser implementado");
  }
}

/**
 * Implementación A: Blockchain Simple
 * Bloques básicos con proof-of-work
 */
class SimpleBlockchainService extends BlockchainService {
  /**
   * Inicializar blockchain con bloque génesis
   */
  async initialize() {
    try {
      const genesisBlock = await Block.findOne({ where: { blockNumber: 0 } });

      if (!genesisBlock) {
        await this.createGenesisBlock();
        console.log("✅ Bloque génesis creado (Implementación Simple)");
      }

      return true;
    } catch (error) {
      console.error("Error al inicializar blockchain:", error);
      throw error;
    }
  }

  /**
   * Crear bloque génesis
   */
  async createGenesisBlock() {
    const genesisHash = crypto
      .createHash("sha256")
      .update(BLOCKCHAIN_CONFIG.GENESIS_BLOCK)
      .digest("hex");

    return await Block.create({
      blockNumber: 0,
      timestamp: new Date(),
      hash: genesisHash,
      previousHash: "0",
      nonce: 0,
      difficulty: this.difficulty,
      transactionCount: 0,
      isValid: true,
    });
  }

  /**
   * Agregar transacción a un nuevo bloque
   */
  async addTransaction(transaction) {
    try {
      const lastBlock = await this.getLastBlock();
      const newBlock = await this.createBlock(lastBlock, [transaction]);

      // Actualizar transacción con blockId
      await transaction.update({ blockId: newBlock.id });

      return newBlock;
    } catch (error) {
      console.error("Error al agregar transacción:", error);
      throw error;
    }
  }

  /**
   * Crear nuevo bloque
   */
  async createBlock(previousBlock, transactions = []) {
    const blockNumber = previousBlock.blockNumber + 1;
    const timestamp = new Date();
    const previousHash = previousBlock.hash;

    let nonce = 0;
    let hash = this.calculateHash(
      blockNumber,
      timestamp,
      previousHash,
      transactions,
      nonce
    );

    // Proof of Work
    const target = "0".repeat(this.difficulty);
    while (hash.substring(0, this.difficulty) !== target) {
      nonce++;
      hash = this.calculateHash(
        blockNumber,
        timestamp,
        previousHash,
        transactions,
        nonce
      );
    }

    return await Block.create({
      blockNumber,
      timestamp,
      hash,
      previousHash,
      nonce,
      difficulty: this.difficulty,
      transactionCount: transactions.length,
      isValid: true,
    });
  }

  /**
   * Calcular hash del bloque
   */
  calculateHash(blockNumber, timestamp, previousHash, transactions, nonce) {
    const data = `${blockNumber}${timestamp}${previousHash}${JSON.stringify(
      transactions
    )}${nonce}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Obtener último bloque
   */
  async getLastBlock() {
    return await Block.findOne({
      order: [["blockNumber", "DESC"]],
    });
  }

  /**
   * Validar integridad de la cadena
   */
  async validateChain() {
    const blocks = await Block.findAll({
      order: [["blockNumber", "ASC"]],
    });

    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i - 1];

      // Verificar hash del bloque
      const recalculatedHash = this.calculateHash(
        currentBlock.blockNumber,
        currentBlock.timestamp,
        currentBlock.previousHash,
        [],
        currentBlock.nonce
      );

      if (currentBlock.hash !== recalculatedHash) {
        return {
          isValid: false,
          error: `Hash inválido en bloque ${currentBlock.blockNumber}`,
        };
      }

      // Verificar encadenamiento
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          error: `Encadenamiento roto en bloque ${currentBlock.blockNumber}`,
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Obtener estadísticas de la blockchain
   */
  async getStats() {
    const blockCount = await Block.count();
    const transactionCount = await Transaction.count();
    const lastBlock = await this.getLastBlock();

    return {
      totalBlocks: blockCount,
      totalTransactions: transactionCount,
      lastBlock: lastBlock
        ? {
            number: lastBlock.blockNumber,
            hash: lastBlock.hash,
            timestamp: lastBlock.timestamp,
          }
        : null,
      difficulty: this.difficulty,
    };
  }
}

/**
 * Implementación B: Blockchain Avanzada
 * Con merkle tree y validaciones adicionales
 */
class AdvancedBlockchainService extends SimpleBlockchainService {
  /**
   * Calcular Merkle Root de transacciones
   */
  calculateMerkleRoot(transactions) {
    if (transactions.length === 0) return "";

    let hashes = transactions.map((tx) =>
      crypto.createHash("sha256").update(JSON.stringify(tx)).digest("hex")
    );

    while (hashes.length > 1) {
      const newHashes = [];

      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        const combined = crypto
          .createHash("sha256")
          .update(left + right)
          .digest("hex");
        newHashes.push(combined);
      }

      hashes = newHashes;
    }

    return hashes[0];
  }

  /**
   * Crear bloque con Merkle Root
   */
  async createBlock(previousBlock, transactions = []) {
    const blockNumber = previousBlock.blockNumber + 1;
    const timestamp = new Date();
    const previousHash = previousBlock.hash;
    const merkleRoot = this.calculateMerkleRoot(transactions);

    let nonce = 0;
    let hash = this.calculateHash(
      blockNumber,
      timestamp,
      previousHash,
      transactions,
      nonce
    );

    // Proof of Work con dificultad ajustable
    const target = "0".repeat(this.difficulty);
    while (hash.substring(0, this.difficulty) !== target) {
      nonce++;
      hash = this.calculateHash(
        blockNumber,
        timestamp,
        previousHash,
        transactions,
        nonce
      );
    }

    return await Block.create({
      blockNumber,
      timestamp,
      hash,
      previousHash,
      nonce,
      difficulty: this.difficulty,
      transactionCount: transactions.length,
      merkleRoot,
      isValid: true,
    });
  }

  /**
   * Validar bloque individual
   */
  async validateBlock(block) {
    // Verificar proof of work
    const target = "0".repeat(block.difficulty);
    if (block.hash.substring(0, block.difficulty) !== target) {
      return { isValid: false, error: "Proof of work inválido" };
    }

    // Verificar hash
    const transactions = await Transaction.findAll({
      where: { blockId: block.id },
    });
    const recalculatedHash = this.calculateHash(
      block.blockNumber,
      block.timestamp,
      block.previousHash,
      transactions,
      block.nonce
    );

    if (block.hash !== recalculatedHash) {
      return { isValid: false, error: "Hash del bloque inválido" };
    }

    // Verificar merkle root si existe
    if (block.merkleRoot) {
      const calculatedMerkleRoot = this.calculateMerkleRoot(transactions);
      if (block.merkleRoot !== calculatedMerkleRoot) {
        return { isValid: false, error: "Merkle root inválido" };
      }
    }

    return { isValid: true };
  }
}

/**
 * Factory para crear instancia de blockchain
 */
class BlockchainFactory {
  static create(type = "simple") {
    switch (type) {
      case "advanced":
        return new AdvancedBlockchainService();
      case "simple":
      default:
        return new SimpleBlockchainService();
    }
  }
}

// Instancia global del servicio (por defecto Simple)
let blockchainInstance = null;

const getBlockchainService = (type = "simple") => {
  if (!blockchainInstance) {
    blockchainInstance = BlockchainFactory.create(type);
  }
  return blockchainInstance;
};

module.exports = {
  BlockchainService,
  SimpleBlockchainService,
  AdvancedBlockchainService,
  BlockchainFactory,
  getBlockchainService,
};
