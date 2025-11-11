import { useState, useEffect } from "react";
import transactionService from "../services/transaction.service";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Send,
  ArrowDownLeft,
  Gift,
  Receipt,
  Loader2,
  Filter,
  Download,
  Search,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Transaction {
  id: number;
  hash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { transactions } = await transactionService.getHistory(1, 10);
      // Mapear al shape mostrado por la UI
      const mapped = (transactions || []).map((tx: any) => ({
        id: tx.id,
        hash: tx.txHash,
        fromAddress: tx.fromWallet?.address || "",
        toAddress: tx.toWallet?.address || "",
        amount: parseFloat(tx.amount || 0),
        type: tx.type,
        status: tx.status,
        description: tx.description || "",
        createdAt: tx.createdAt,
      }));
      setTransactions(mapped);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Si no hay wallet o transacciones, mostrar lista vacía
        setTransactions([]);
      } else {
        toast.error("Error al cargar transacciones");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "transfer":
        return "bg-blue-100 text-blue-800";
      case "reward":
        return "bg-green-100 text-green-800";
      case "fee":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return <Send className="w-5 h-5" />;
      case "reward":
        return <Gift className="w-5 h-5" />;
      case "fee":
        return <ArrowDownLeft className="w-5 h-5" />;
      default:
        return <Receipt className="w-5 h-5" />;
    }
  };

  const getStatusBadgeVariant = (
    status: string
  ): "success" | "warning" | "destructive" | "secondary" => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Historial de Transacciones
                  </h1>
                  <p className="text-gray-600">
                    {filteredTransactions.length}{" "}
                    {filteredTransactions.length === 1
                      ? "transacción"
                      : "transacciones"}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Hash, descripción..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas</option>
                  <option value="transfer">Transferencias</option>
                  <option value="reward">Recompensas</option>
                  <option value="fee">Comisiones</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="completed">Completadas</option>
                  <option value="pending">Pendientes</option>
                  <option value="failed">Fallidas</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                No hay transacciones
              </p>
              <p className="text-gray-500">
                Las transacciones aparecerán aquí cuando realices operaciones
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <Card
                key={tx.id}
                className="shadow-md border-0 hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(
                          tx.type
                        )}`}
                      >
                        {getTypeIcon(tx.type)}
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {tx.type === "transfer" && "Transferencia"}
                            {tx.type === "reward" && "Recompensa"}
                            {tx.type === "fee" && "Comisión"}
                          </Badge>
                          <Badge
                            variant={getStatusBadgeVariant(tx.status)}
                            className="text-xs"
                          >
                            {tx.status === "completed" && "Completada"}
                            {tx.status === "pending" && "Pendiente"}
                            {tx.status === "failed" && "Fallida"}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-gray-900 font-semibold mb-3">
                          {tx.description || "Sin descripción"}
                        </p>

                        {/* Transaction Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-start space-x-2">
                              <span className="text-gray-500 min-w-[60px]">
                                Hash:
                              </span>
                              <code className="font-mono text-xs text-gray-900 break-all">
                                {tx.hash}
                              </code>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-gray-500 min-w-[60px]">
                                De:
                              </span>
                              <code className="font-mono text-xs text-gray-700 break-all">
                                {tx.fromAddress}
                              </code>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-start space-x-2">
                              <span className="text-gray-500 min-w-[60px]">
                                A:
                              </span>
                              <code className="font-mono text-xs text-gray-700 break-all">
                                {tx.toAddress}
                              </code>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600 text-xs">
                                {new Date(tx.createdAt).toLocaleString(
                                  "es-ES",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-2xl font-bold text-gray-900">
                          {tx.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">CC</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Transactions;
