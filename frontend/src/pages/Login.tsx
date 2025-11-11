import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
  Loader2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("¡Bienvenido de vuelta!");
      navigate("/dashboard");
    } catch (error: any) {
      let msg = "Error al iniciar sesión";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/3 -right-48 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 -bottom-48 left-1/3 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-lg animate-pulse"></div>
                  <Wallet className="relative w-8 h-8 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">
                  CryptoWallet Pro
                </span>
              </div>

              <h2 className="text-5xl font-bold text-white leading-tight">
                Tu futuro financiero
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  comienza aquí
                </span>
              </h2>

              <p className="text-xl text-gray-300 leading-relaxed">
                Gestiona, invierte y haz crecer tus activos digitales con la
                plataforma más segura y moderna del mercado.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 group">
                <Shield className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold mb-1">Seguridad</h3>
                <p className="text-gray-400 text-xs">Encriptación militar</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 group">
                <Zap className="w-8 h-8 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold mb-1">Velocidad</h3>
                <p className="text-gray-400 text-xs">
                  Transacciones instantáneas
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 group">
                <TrendingUp className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold mb-1">Crecimiento</h3>
                <p className="text-gray-400 text-xs">Rendimientos óptimos</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 animate-in fade-in slide-in-from-right duration-1000">
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
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      ¡Bienvenido!
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Inicia sesión en tu cuenta
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        className={`h-14 bg-white/5 border-2 ${
                          focusedField === "email"
                            ? "border-cyan-400 bg-white/10"
                            : "border-white/10"
                        } text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-cyan-500/20`}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Contraseña
                      </label>
                      <a
                        href="#"
                        className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        className={`h-14 bg-white/5 border-2 ${
                          focusedField === "password"
                            ? "border-cyan-400 bg-white/10"
                            : "border-white/10"
                        } text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-cyan-500/20`}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 hover:from-cyan-600 hover:via-blue-600 hover:to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] mt-6 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        Iniciar Sesión
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                {/* Register Link */}
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <span className="text-sm">¿Nuevo aquí?</span>
                  <Link
                    to="/register"
                    className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-2 underline-offset-4"
                  >
                    Crear cuenta
                  </Link>
                </div>

                {/* Test Credentials */}
                <div className="w-full">
                  <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-4">
                    <p className="text-xs font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Credenciales de prueba
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-400 min-w-[75px]">
                          Usuario:
                        </span>
                        <span className="text-xs font-mono text-gray-300 break-all">
                          juan.perez@email.com
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-400 min-w-[75px]">
                          Contraseña:
                        </span>
                        <span className="text-xs font-mono text-gray-300">
                          User123!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6">
              © 2025 CryptoWallet Pro · Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
