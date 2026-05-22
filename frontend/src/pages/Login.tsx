import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Shield, Key, Globe } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      
      // On success, redirect based on role. We fetch from localStorage or state.
      // Wait, we can get the role from the token decoding or by reading user in AuthContext.
      // Since setUser is async (triggered in state), we can decode token directly or query our backend user payload
      // or we can read it from the localStorage/state immediately. Let's decode or fetch user details.
      // Actually, since login finishes, the user details are set. Let's just decode the role or fetch from backend response
      // or parse the token payload.
      // Let's see: the login response from endpoint 2 returns:
      // {
      //   "token": "...",
      //   "user": {
      //     "id": 1,
      //     "name": "Admin One",
      //     "role": "admin"
      //   }
      // }
      // So our login function in AuthContext saves the user object in state and returns.
      // But wait! React state update is asynchronous. If we immediately read `user.role` from state, it might be null.
      // To prevent this, let's make our `login` function in `AuthContext` return the user object, or decode the token payload.
      // Let's see: in `AuthContext.tsx`, our login is:
      // const login = async (email, password) => { ... const data = await res.json(); ... setUser(data.user); }
      // If we make `login` return `data.user`, then `Login.tsx` can do:
      // const user = await login(email, password);
      // and then redirect based on `user.role`! That is incredibly robust and clean!
      // Let's modify our AuthContext code or write it this way in Login.tsx.
      // Let's parse the JWT token ourselves in Login.tsx or fetch it.
      // Wait! Let's check how JWT can be decoded. A simple base64 decode of the token payload is easy:
      // const payload = JSON.parse(atob(token.split('.')[1]));
      // Yes! This is native, simple, standard and doesn't require extra packages!
      // Let's read it:
      const storedToken = localStorage.getItem("ssevms_token");
      if (storedToken) {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        const role = payload.role; // 'admin', 'validator', or 'mapper'
        if (role === "admin") navigate("/admin");
        else if (role === "validator") navigate("/validator");
        else if (role === "mapper") navigate("/mapper");
        else navigate("/map");
      }
    } catch (err: any) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#070C11] overflow-hidden px-4 font-sans selection:bg-[#C4622D]/30">
      {/* Terrain Decoration Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0F1923] via-transparent to-[#0F1923]" />

      {/* Geolocation Meta Data */}
      <div className="absolute top-10 right-20 flex flex-col items-end opacity-20 pointer-events-none">
        <span className="font-mono text-[10px] text-[#D4A847] tracking-[0.5em] uppercase mb-4">
          Auth Node Active
        </span>
        <div className="h-0.5 w-24 bg-[linear-gradient(to_left,#C4622D,transparent)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="bg-[#141C25]/80 backdrop-blur-2xl border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C4622D] to-transparent opacity-50" />

          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto h-16 w-16 mb-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center">
              <Shield className="h-8 w-8 text-[#C4622D]" />
            </div>
            <CardTitle className="font-display text-3xl font-bold tracking-tight text-white uppercase italic">
              SSEVMS <span className="text-[#D4A847]">Login</span>
            </CardTitle>
            <CardDescription className="font-label text-xs uppercase tracking-[0.2em] text-[#8A9BAD] mt-2">
              Ministry of Education • School Mapping Portal
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="font-label text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest pl-1"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    className="bg-black/20 border-white/10 border-b-2 border-b-transparent focus:border-b-[#C4622D] rounded-none h-12 text-[#EEE8DC] focus-visible:ring-0 transition-all font-mono pl-10"
                    placeholder="personnel@ssevms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Globe className="absolute left-3 top-3.5 h-5 w-5 text-[#8A9BAD]/40" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="font-label text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest pl-1"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    className="bg-black/20 border-white/10 border-b-2 border-b-transparent focus:border-b-[#C4622D] rounded-none h-12 text-[#EEE8DC] focus-visible:ring-0 transition-all font-mono pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Key className="absolute left-3 top-3.5 h-5 w-5 text-[#8A9BAD]/40" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-[10px] font-mono uppercase text-red-500 tracking-wider font-bold">
                    {error}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#C4622D] hover:bg-[#A85225] text-white font-label font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#C4622D]/10 rounded-none transition-all hover:scale-[1.01] disabled:opacity-55"
                >
                  {loading ? "Authenticating..." : "Login"}
                </Button>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-[#8A9BAD]/60 uppercase tracking-widest">
                <span>Production Version</span>
                <span className="text-[#8A9BAD]/40">Secured Node</span>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
