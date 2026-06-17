import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResendActivation() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-activation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast.success("New activation email sent!");
      } else {
        setError(data.error || "Failed to resend activation.");
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
          Resend Request Node
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
                  Email <span className="text-[#D4A847]">Dispatched</span>
                </CardTitle>
                <p className="text-[#8A9BAD] text-sm">
                  A new activation email with a fresh OTP has been sent to <strong>{email}</strong>. 
                  Please check your inbox (and spam folder) and verify within 15 minutes.
                </p>
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <Link to="/login" className="w-full">
                  <Button className="w-full h-12 bg-transparent border border-white/10 hover:bg-white/5 text-white font-label font-bold uppercase tracking-[0.2em] rounded-none transition-all">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="text-center pb-6 pt-10">
                <div className="mx-auto h-16 w-16 mb-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-[#C4622D]" />
                </div>
                <CardTitle className="font-display text-3xl font-bold tracking-tight text-white uppercase italic">
                  Request <span className="text-[#D4A847]">Activation</span>
                </CardTitle>
                <CardDescription className="font-label text-xs uppercase tracking-[0.2em] text-[#8A9BAD] mt-2">
                  Regenerate OTP and Link Credentials
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-10">
                <form className="space-y-5" onSubmit={handleSubmit}>
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
                        disabled={loading}
                        className="bg-black/20 border-white/10 border-b-2 border-b-transparent focus:border-b-[#C4622D] rounded-none h-12 text-[#EEE8DC] focus-visible:ring-0 transition-all font-mono pl-10"
                        placeholder="personnel@ssevms.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#8A9BAD]/40" />
                    </div>
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
                      disabled={loading}
                      className="w-full h-12 bg-[#C4622D] hover:bg-[#A85225] text-white font-label font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#C4622D]/10 rounded-none transition-all hover:scale-[1.01] disabled:opacity-55 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Resend Activation Link"
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-center text-[10px] font-mono text-[#8A9BAD]/60 pt-2">
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
