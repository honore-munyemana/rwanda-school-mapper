import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Key, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ActivateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password strength state
  const [strength, setStrength] = useState<"Weak" | "Medium" | "Strong" | "">("");
  const [strengthColor, setStrengthColor] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No activation token provided. Please check your email link or request a new one.");
    }
  }, [token]);

  // Handle password strength calculation
  useEffect(() => {
    if (!password) {
      setStrength("");
      return;
    }

    if (password.length < 8) {
      setStrength("Weak");
      setStrengthColor("text-red-500 bg-red-500/10 border-red-500/20");
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    const metCriteria = [hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;

    if (metCriteria === 3) {
      setStrength("Strong");
      setStrengthColor("text-emerald-500 bg-emerald-500/10 border-emerald-500/20");
    } else {
      setStrength("Medium");
      setStrengthColor("text-amber-500 bg-amber-500/10 border-amber-500/20");
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("No activation token present.");
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, otp, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast.success("Account activated successfully!");
      } else {
        setError(data.error || "Activation failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to the server.");
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
          Activation Node
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

          {success ? (
            <CardContent className="px-8 py-12 text-center space-y-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <CardTitle className="font-display text-3xl font-bold tracking-tight text-white uppercase italic">
                  Activation <span className="text-[#D4A847]">Complete</span>
                </CardTitle>
                <p className="text-[#8A9BAD] text-sm">
                  Your node credentials have been verified and updated in the secure directory.
                </p>
              </div>
              <div className="pt-4">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full h-12 bg-[#C4622D] hover:bg-[#A85225] text-white font-label font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#C4622D]/10 rounded-none transition-all"
                >
                  Proceed to Login
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="text-center pb-6 pt-10">
                <div className="mx-auto h-16 w-16 mb-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-[#C4622D]" />
                </div>
                <CardTitle className="font-display text-3xl font-bold tracking-tight text-white uppercase italic">
                  Node <span className="text-[#D4A847]">Activation</span>
                </CardTitle>
                <CardDescription className="font-label text-xs uppercase tracking-[0.2em] text-[#8A9BAD] mt-2">
                  Verify Credentials • Setup Secure Passcode
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-10">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* OTP Input */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="otp"
                      className="font-label text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest pl-1"
                    >
                      One-Time Password (OTP)
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      disabled={loading || !token}
                      className="bg-black/20 border-white/10 border-b-2 border-b-transparent focus:border-b-[#C4622D] rounded-none h-12 text-center text-xl text-[#EEE8DC] tracking-[0.4em] focus-visible:ring-0 transition-all font-mono"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center pr-1">
                      <Label
                        htmlFor="password"
                        className="font-label text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest pl-1"
                      >
                        Create Password
                      </Label>
                      {strength && (
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border rounded ${strengthColor}`}>
                          {strength}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        disabled={loading || !token}
                        className="bg-black/20 border-white/10 border-b-2 border-b-transparent focus:border-b-[#C4622D] rounded-none h-12 text-[#EEE8DC] focus-visible:ring-0 transition-all font-mono pl-10 pr-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Key className="absolute left-3 top-3.5 h-5 w-5 text-[#8A9BAD]/40" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-[#8A9BAD]/60 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirmPassword"
                      className="font-label text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest pl-1"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        disabled={loading || !token}
                        className="bg-black/20 border-white/10 border-b-2 border-b-transparent focus:border-b-[#C4622D] rounded-none h-12 text-[#EEE8DC] focus-visible:ring-0 transition-all font-mono pl-10"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <Key className="absolute left-3 top-3.5 h-5 w-5 text-[#8A9BAD]/40" />
                    </div>
                  </div>

                  {/* Password helper instructions */}
                  <div className="text-[10px] font-mono text-[#8A9BAD]/50 space-y-1 pl-1">
                    <p>Password requirements:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li className={password.length >= 8 ? "text-[#D4A847]/80" : ""}>Minimum 8 characters</li>
                      <li className={/[A-Z]/.test(password) ? "text-[#D4A847]/80" : ""}>At least one uppercase letter</li>
                      <li className={/[a-z]/.test(password) ? "text-[#D4A847]/80" : ""}>At least one lowercase letter</li>
                      <li className={/\d/.test(password) ? "text-[#D4A847]/80" : ""}>At least one number</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-mono uppercase text-red-500 tracking-wider font-bold leading-normal">
                        {error}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading || !token}
                      className="w-full h-12 bg-[#C4622D] hover:bg-[#A85225] text-white font-label font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#C4622D]/10 rounded-none transition-all hover:scale-[1.01] disabled:opacity-55 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        "Activate Account"
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-[#8A9BAD]/60 gap-4 pt-2">
                    <Link
                      to="/resend-activation"
                      className="text-[#D4A847] hover:text-[#C4622D] transition-colors flex items-center gap-1.5 uppercase tracking-widest font-bold"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Request New Activation
                    </Link>
                    <Link
                      to="/login"
                      className="hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Back to Login
                    </Link>
                  </div>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
