import api from "./api";

export interface Wallet {
  id: string;
  address: string;
  balance: string;
  currency: string;
  isActive: boolean;
  lastTransactionAt?: string;
}

export interface TransferData {
  toAddress: string;
  amount: number;
  description?: string;
}

class WalletService {
  async getBalance() {
    const response = await api.get("/wallets/balance");
    // Backend responde: { success, balance: { balance, currency, address, formatted } }
    const details = response.data?.balance;
    return details?.balance ?? 0;
  }

  async createWallet() {
    // POST /wallets/create (o la ruta que tengas en backend)
    // Si tu backend usa /api/wallets, ajusta la ruta aquí
    const response = await api.post("/wallets/create");
    return response.data;
  }

  async transfer(data: TransferData) {
    // Convertir toAddress a toWalletAddress para el backend
    const payload = {
      toWalletAddress: data.toAddress,
      amount: data.amount,
      description: data.description,
    };
    const response = await api.post("/wallets/transfer", payload);
    return response.data;
  }

  async getMyWallet() {
    // Ruta correcta en backend: /api/wallets/my-wallet
    const response = await api.get("/wallets/my-wallet");
    return response.data;
  }
}

export default new WalletService();
