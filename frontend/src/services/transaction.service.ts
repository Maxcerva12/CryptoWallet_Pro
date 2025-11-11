import api from "./api";

export interface Transaction {
  id: string;
  txHash: string;
  fromWalletId: string;
  toWalletId: string;
  amount: string;
  fee: string;
  totalAmount: string;
  currency: string;
  type: "transfer" | "qr_payment" | "reward" | "fee";
  status: "pending" | "completed" | "failed" | "cancelled";
  description?: string;
  confirmedAt?: string;
  createdAt: string;
}

class TransactionService {
  async getHistory(page = 1, limit = 10) {
    // Backend expone el historial en /api/wallets/transactions
    const response = await api.get(
      `/wallets/transactions?page=${page}&limit=${limit}`
    );
    // El controlador devuelve { success, data: { transactions, pagination } }
    return response.data?.data ?? { transactions: [], pagination: null };
  }

  async getTransactionById(id: string) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  }
}

export default new TransactionService();
