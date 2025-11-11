import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import walletService from "../services/wallet.service";
import transactionService from "../services/transaction.service";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ArrowUpRight,
  History,
  TrendingUp,
  Copy,
  Check,
  Loader2,
  Send,
  Receipt,
} from "lucide-react";

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState<string>("0");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [walletMissing, setWalletMissing] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo cargar una vez al montar el componente

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setWalletMissing(false);

      // Refrescar información del usuario primero
      await refreshUser();

      // Intentar cargar balance directamente
      const balanceValue = await walletService.getBalance();
      setBalance(String(balanceValue ?? 0));

      // Cargar transacciones
      const txRes = await transactionService.getHistory(1, 5);
      setTransactions(txRes.transactions || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Usuario no tiene wallet
        setWalletMissing(true);
        setBalance("0");
        setTransactions([]);
      } else {
        toast.error("Error al cargar datos del dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    try {
      await walletService.createWallet();
      toast.success("Wallet creada correctamente");
      // Recargar usuario y dashboard
      window.location.reload();
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al crear wallet";
      if (message.includes("ya tiene una wallet")) {
        toast.error("Ya tienes una wallet creada. Recargando página...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(message);
      }
    } finally {
      setCreatingWallet(false);
    }
  };

  const copyAddress = async () => {
    if (user?.wallet?.address) {
      try {
        await navigator.clipboard.writeText(user.wallet.address);
        setCopiedAddress(true);
        toast.success("Dirección copiada al portapapeles");
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (error) {
        toast.error("Error al copiar dirección");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (walletMissing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Wallet className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              No tienes una wallet creada
            </h2>
            <p className="mb-6 text-gray-600">
              Para usar la plataforma necesitas crear tu billetera digital.
            </p>
            <Button
              onClick={handleCreateWallet}
              disabled={creatingWallet}
              className="px-8 py-3 text-lg"
            >
              {creatingWallet ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Crear Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wallet className="w-8 h-8 mr-3 text-blue-600" />
            ¡Bienvenido, {user?.fullName}!
          </h2>
          <p className="text-gray-600 mt-1 ml-11">
            Gestiona tu billetera digital de forma segura
          </p>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-200" />
                    <p className="text-blue-100 text-sm font-medium">
                      Balance Total
                    </p>
                  </div>
                  <h3 className="text-5xl font-bold mt-2 mb-4">
                    {parseFloat(balance).toFixed(2)}{" "}
                    <span className="text-2xl text-blue-200">CC</span>
                  </h3>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-4">
                    <p className="text-blue-100 text-xs mb-1">
                      Dirección de Wallet
                    </p>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono text-white">
                        {user?.wallet?.address?.substring(0, 32)}...
                      </code>
                      <button
                        onClick={copyAddress}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                        title="Copiar dirección"
                      >
                        {copiedAddress ? (
                          <Check className="w-4 h-4 text-green-300" />
                        ) : (
                          <Copy className="w-4 h-4 text-blue-200" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <Wallet className="w-20 h-20 text-white/20" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center space-x-2">
                <Receipt className="w-4 h-4" />
                <span>Actividad Reciente</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900 mb-1">
                {transactions.length}
              </p>
              <p className="text-sm text-gray-500">Últimas transacciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/transfer">
            <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Send className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Transferir
                </h3>
                <p className="text-sm text-gray-600">Envía CC a otra wallet</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/transactions">
            <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <History className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Historial
                </h3>
                <p className="text-sm text-gray-600">
                  Ver todas las transacciones
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-xl">Últimas Transacciones</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link
                  to="/transactions"
                  className="flex items-center space-x-1"
                >
                  <span>Ver todas</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 mb-1">
                  No hay transacciones aún
                </p>
                <p className="text-sm">
                  Realiza tu primera transferencia para ver el historial
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          tx.type === "transfer"
                            ? "bg-blue-100"
                            : "bg-green-100"
                        }`}
                      >
                        {tx.type === "transfer" ? (
                          <Send className="w-6 h-6 text-blue-600" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {tx.description || "Transferencia"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        {tx.amount}{" "}
                        <span className="text-sm text-gray-500">CC</span>
                      </p>
                      <Badge
                        variant={
                          tx.status === "completed" ? "success" : "warning"
                        }
                        className="mt-1"
                      >
                        {tx.status === "completed" ? "Completada" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
