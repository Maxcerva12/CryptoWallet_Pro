import { useState } from "react";
import authService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Wallet,
  Calendar,
  Copy,
  Check,
  Shield,
  LogOut,
  Settings,
  Loader2,
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(user?.phone || "");
  const [savingPhone, setSavingPhone] = useState(false);
  const handleEditPhone = () => {
    setEditingPhone(true);
  };

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      await authService.updateProfile({ phone: phoneValue });
      toast.success("Teléfono actualizado");
      window.location.reload();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al actualizar teléfono"
      );
    } finally {
      setSavingPhone(false);
      setEditingPhone(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Dirección copiada al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada correctamente");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  const getRoleBadge = () => {
    switch (user.role) {
      case "admin":
        return {
          label: "Administrador",
          variant: "default" as const,
          icon: <Shield className="w-3 h-3" />,
        };
      case "merchant":
        return {
          label: "Comerciante",
          variant: "secondary" as const,
          icon: <Settings className="w-3 h-3" />,
        };
      default:
        return {
          label: "Usuario",
          variant: "outline" as const,
          icon: <User className="w-3 h-3" />,
        };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">
            Gestiona tu información personal y configuración
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0">
              <CardContent className="p-6 text-center">
                {/* Avatar */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full text-3xl font-bold mb-4 shadow-lg">
                  {user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                {/* Name and Email */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {user.fullName}
                </h2>
                <p className="text-sm text-gray-500 mb-4 break-all">
                  {user.email}
                </p>

                {/* Role Badge */}
                <Badge variant={roleBadge.variant} className="mb-6">
                  {roleBadge.icon}
                  <span className="ml-1">{roleBadge.label}</span>
                </Badge>

                <Separator className="my-6" />

                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Información Personal</span>
                </CardTitle>
                <CardDescription>Datos básicos de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                      <User className="w-4 h-4" />
                      <span>Nombre Completo</span>
                    </div>
                    <p className="text-gray-900 font-semibold pl-6">
                      {user.fullName}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                    <p className="text-gray-900 font-semibold pl-6 break-all">
                      {user.email}
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                      <Phone className="w-4 h-4" />
                      <span>Teléfono</span>
                    </div>
                    <div className="flex items-center pl-6">
                      {editingPhone ? (
                        <>
                          <input
                            type="text"
                            className="border rounded px-2 py-1 text-gray-900 mr-2"
                            value={phoneValue}
                            onChange={(e) => setPhoneValue(e.target.value)}
                            placeholder="Teléfono"
                          />
                          <Button
                            size="sm"
                            onClick={handleSavePhone}
                            disabled={savingPhone}
                          >
                            {savingPhone ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Guardar"
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-900 font-semibold">
                            {user.phone || (
                              <span className="text-gray-400 italic">
                                No especificado
                              </span>
                            )}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={handleEditPhone}
                          >
                            Editar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Member Since */}
                  {user.createdAt && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Miembro desde</span>
                      </div>
                      <p className="text-gray-900 font-semibold pl-6">
                        {new Date(user.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Wallet Information */}
            {user.wallet && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    <span>Información de Wallet</span>
                  </CardTitle>
                  <CardDescription>
                    Detalles de tu billetera digital
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Balance */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center border-2 border-blue-100">
                    <p className="text-sm text-gray-600 mb-2">Balance Actual</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {user.wallet?.balance || "0"}
                    </p>
                    <p className="text-gray-600 mt-1">CryptoCoins</p>
                  </div>

                  {/* Wallet Address */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Dirección de Wallet
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg text-sm font-mono break-all border border-gray-200">
                        {user.wallet?.address}
                      </code>
                      <Button
                        onClick={() =>
                          copyToClipboard(user.wallet?.address || "")
                        }
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Comparte esta dirección para recibir pagos
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <span>Seguridad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Mantén tu cuenta segura
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>No compartas tu contraseña con nadie</li>
                      <li>
                        Verifica siempre las direcciones de wallet antes de
                        transferir
                      </li>
                      <li>Cierra sesión en dispositivos compartidos</li>
                      <li>Mantén tu información actualizada</li>
                    </ul>
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

export default Profile;
