import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Wallet,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle2,
  XCircle,
  Zap,
  Globe,
  TrendingUp,
} from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos obligatorios");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor ingresa un email válido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });

      toast.success("¡Registro exitoso! Bienvenido a CryptoWallet Pro");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0)
      return { strength: 0, label: "", color: "bg-slate-200" };
    if (password.length < 6)
      return { strength: 25, label: "Muy débil", color: "bg-red-500" };
    if (password.length < 8)
      return { strength: 50, label: "Débil", color: "bg-orange-500" };
    if (password.length < 10)
      return { strength: 75, label: "Buena", color: "bg-blue-500" };
    return { strength: 100, label: "Fuerte", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-violet-900 to-blue-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 right-1/4 bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/2 -left-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 -bottom-48 right-1/3 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features */}
          <div className="hidden lg:block space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-blue-500 rounded-xl blur-lg animate-pulse"></div>
                  <Wallet className="relative w-8 h-8 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">
                  CryptoWallet Pro
                </span>
              </div>

              <h2 className="text-5xl font-bold text-white leading-tight">
                Únete a la revolución
                <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  digital financiera
                </span>
              </h2>

              <p className="text-xl text-gray-300 leading-relaxed">
                Miles de usuarios ya confían en nosotros. Crea tu cuenta gratis
                y descubre una nueva forma de gestionar tus activos.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300">
                <Globe className="w-8 h-8 text-violet-400 mb-3" />
                <h3 className="text-3xl font-bold text-white mb-1">150+</h3>
                <p className="text-gray-400 text-sm">Países activos</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300">
                <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                <h3 className="text-3xl font-bold text-white mb-1">2M+</h3>
                <p className="text-gray-400 text-sm">Transacciones</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300">
                <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-3xl font-bold text-white mb-1">99.9%</h3>
                <p className="text-gray-400 text-sm">Uptime</p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    Seguridad Garantizada
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Encriptación de nivel bancario, autenticación de dos
                    factores y monitoreo 24/7 para proteger tus activos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="w-full max-w-lg mx-auto lg:mx-0 animate-in fade-in slide-in-from-right duration-1000">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 mb-4">
                <Wallet className="w-7 h-7 text-white" />
                <span className="text-2xl font-bold text-white">
                  CryptoWallet Pro
                </span>
              </div>
            </div>

            <Card className="border-0 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/50">
              <CardHeader className="space-y-3 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      Crear Cuenta
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Comienza tu viaje digital hoy
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nombre Completo
                      <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("fullName")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Juan Pérez"
                      className={`h-12 bg-white/5 border-2 ${
                        focusedField === "fullName"
                          ? "border-violet-400 bg-white/10"
                          : "border-white/10"
                      } text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-violet-500/20`}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Correo Electrónico
                      <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="tu@email.com"
                      className={`h-12 bg-white/5 border-2 ${
                        focusedField === "email"
                          ? "border-violet-400 bg-white/10"
                          : "border-white/10"
                      } text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-violet-500/20`}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Teléfono
                      <span className="text-gray-400 text-xs font-normal">
                        (Opcional)
                      </span>
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="+57 300 123 4567"
                      className={`h-12 bg-white/5 border-2 ${
                        focusedField === "phone"
                          ? "border-violet-400 bg-white/10"
                          : "border-white/10"
                      } text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-violet-500/20`}
                      autoComplete="tel"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Contraseña
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Mínimo 6 caracteres"
                        className={`h-12 bg-white/5 border-2 ${
                          focusedField === "password"
                            ? "border-violet-400 bg-white/10"
                            : "border-white/10"
                        } text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-violet-500/20 pr-12`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            />
                          </div>
                          {passwordStrength.label && (
                            <span className="text-xs font-bold text-white min-w-[70px]">
                              {passwordStrength.label}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Confirmar Contraseña
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("confirmPassword")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Repite tu contraseña"
                        className={`h-12 bg-white/5 border-2 ${
                          focusedField === "confirmPassword"
                            ? "border-violet-400 bg-white/10"
                            : "border-white/10"
                        } text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-violet-500/20 pr-12`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div>
                        {formData.password !== formData.confirmPassword ? (
                          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-medium">
                              Las contraseñas no coinciden
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-medium">
                              Las contraseñas coinciden
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 transform hover:scale-[1.02] mt-6 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creando tu cuenta...
                      </>
                    ) : (
                      <>
                        Crear Cuenta
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
                {/* Login Link */}
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <span className="text-sm">¿Ya tienes cuenta?</span>
                  <Link
                    to="/login"
                    className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-2 underline-offset-4"
                  >
                    Iniciar sesión
                  </Link>
                </div>

                {/* Terms */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Al registrarte, aceptas nuestros{" "}
                    <a
                      href="#"
                      className="text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Términos de Servicio
                    </a>{" "}
                    y{" "}
                    <a
                      href="#"
                      className="text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Política de Privacidad
                    </a>
                  </p>
                </div>
              </CardFooter>
            </Card>

            {/* Security Badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-gray-300">
              <Shield className="w-4 h-4 text-green-400" />
              <p className="text-xs font-medium">
                Protegido con encriptación de grado militar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
