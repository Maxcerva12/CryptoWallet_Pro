import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import walletService from "../services/wallet.service";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Wallet, AlertCircle, Loader2 } from "lucide-react";

const Transfer = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<string>("0");

  // Cargar balance al montar el componente
  useEffect(() => {
    const loadBalance = async () => {
      try {
        await refreshUser();
        const balanceValue = await walletService.getBalance();
        setCurrentBalance(String(balanceValue ?? 0));
      } catch (error) {
        console.error("Error al cargar balance:", error);
      }
    };
    loadBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo cargar una vez al montar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!toAddress || !amount) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);

    try {
      await walletService.transfer({
        toAddress,
        amount: parseFloat(amount),
        description,
      });

      toast.success("¡Transferencia exitosa!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al realizar la transferencia"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = () => {
    if (!amount) return 0;
    return parseFloat(amount) * 0.01;
  };

  const calculateTotal = () => {
    if (!amount) return 0;
    return parseFloat(amount) + calculateFee();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Transferir Fondos
              </h1>
              <p className="text-gray-600">Envía CryptoCoins de forma segura</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transfer Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span>Detalles de la Transferencia</span>
                </CardTitle>
                <CardDescription>
                  Completa la información para realizar la transferencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Destination Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Dirección de Destino *
                    </label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        placeholder="CC1234567890abcdef..."
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>
                        Verifica que la dirección sea correcta antes de enviar
                      </span>
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Monto (CC) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        CC
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-12 text-lg font-semibold"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Balance disponible:{" "}
                      <span className="font-semibold text-gray-700">
                        {parseFloat(currentBalance || "0").toFixed(2)} CC
                      </span>
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Descripción{" "}
                      <span className="text-gray-400">(Opcional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej: Pago de servicios, Regalo, etc."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-11"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Confirmar Transferencia
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      asChild
                      className="flex-1 h-11"
                    >
                      <Link to="/dashboard">Cancelar</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Balance Actual</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {parseFloat(currentBalance || "0").toFixed(2)}{" "}
                    <span className="text-lg text-gray-600">CC</span>
                  </p>
                </div>

                <Separator />

                {/* Transaction Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Monto a enviar
                    </span>
                    <span className="font-semibold text-gray-900">
                      {amount || "0.00"} CC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comisión (1%)</span>
                    <Badge variant="secondary" className="font-mono">
                      {calculateFee().toFixed(2)} CC
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-gray-900">
                      Total a Debitar
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {calculateTotal().toFixed(2)} CC
                    </span>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-semibold mb-1">Importante:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Las transferencias son irreversibles</li>
                        <li>Verifica la dirección de destino</li>
                        <li>La comisión es del 1% del monto</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Transfer;
