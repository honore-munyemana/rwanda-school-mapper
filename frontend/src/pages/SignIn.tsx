/** @deprecated Legacy localStorage auth — routes redirect to /login. Retained for reference only. */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getAllUsers, setAuthState, getDashboardPathForRole } from '@/routes/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, MapPin, UserCheck, Globe } from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const users = getAllUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      setError('System Access Denied: Invalid Credentials');
      return;
    }

    // Trigger simulated MFA step
    setMfaStep(true);
  };

  const handleMfaVerify = () => {
    const users = getAllUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return;

    setAuthState({
      userId: user.id,
      role: user.role,
      isAuthenticated: true,
    });

    toast.success(`Access Authorized. Welcome back, Commissioner ${user.fullName.split(' ')[0]}.`);
    const target = from && from.startsWith('/') ? from : getDashboardPathForRole(user.role);
    navigate(target);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#070C11] overflow-hidden px-4 font-sans selection:bg-[#C4622D]/30">
      {/* Dynamic Cartography Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 blur-[2px]"
        style={{ backgroundImage: 'url("/rwanda-terrain.png")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0F1923] via-transparent to-[#0F1923]" />

      {/* Decorative Grid Pin */}
      <div className="absolute top-10 right-20 flex flex-col items-end opacity-20 pointer-events-none">
        <span className="font-mono text-[10px] text-[#D4A847] tracking-[0.5em] uppercase mb-4">Geolocation Node Alpha</span>
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
              Security <span className="text-[#D4A847]">Checkpoint</span>
            </CardTitle>
            <CardDescription className="font-label text-xs uppercase tracking-[0.2em] text-[#8A9BAD] mt-2">
              Ministry of Education • Infrastructure Data Authority
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              {!mfaStep ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                    <Label htmlFor="email" className="font-label text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest pl-1">
                      Personnel ID (Email)
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        className="bg-black/20 border-white/10 border-b-2 border-b-transparent focus:border-b-[#C4622D] rounded-none h-12 text-[#EEE8DC] focus-visible:ring-0 transition-all font-mono pl-10"
                        placeholder="MINEDUC_PERSONNEL_ID"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Globe className="absolute left-3 top-3.5 h-5 w-5 text-[#8A9BAD]/40" />
                    </div>
                  </div>

                  <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                    <Label htmlFor="password" className="font-label text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest pl-1">
                      Access Key (Password)
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
                      <p className="text-[10px] font-mono uppercase text-red-500 tracking-wider font-bold">{error}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button type="submit" className="w-full h-12 bg-[#C4622D] hover:bg-[#A85225] text-white font-label font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#C4622D]/10 rounded-none transition-all hover:scale-[1.01]">
                      Initiate Access
                    </Button>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8A9BAD]/60 uppercase tracking-widest">
                    <span>Alpha Build 0.4.1</span>
                    <button type="button" className="hover:text-[#C4622D] transition-colors" onClick={() => navigate('/signup')}>New Unit Registration</button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="mfa"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="h-1 bg-[#D4A847] w-8 mx-0.5" />
                    <div className="h-1 bg-[#D4A847] w-2 mx-0.5" />
                    <div className="h-1 bg-[#D4A847] w-8 mx-0.5" />
                  </div>
                  <p className="font-label text-xs uppercase tracking-widest text-[#8A9BAD]">
                    Personnel Multi-Factor Auth Required
                  </p>
                  <Input
                    maxLength={6}
                    className="bg-black/40 border-white/10 h-14 text-center text-3xl font-mono tracking-[0.8em] focus-visible:ring-[#D4A847]"
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                  />
                  <p className="text-[10px] font-mono text-[#8A9BAD]/40 italic">
                    (Prototype Bypass: Any code valid)
                  </p>
                  <Button
                    onClick={handleMfaVerify}
                    className="w-full h-12 bg-[#D4A847] hover:bg-[#B38C3B] text-white font-label font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#D4A847]/10 rounded-none"
                  >
                    Verify & Connect
                  </Button>
                  <button
                    onClick={() => setMfaStep(false)}
                    className="text-[10px] font-mono uppercase tracking-widest text-[#8A9BAD] hover:text-[#C4622D]"
                  >
                    ← Back to primary access
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Background Motifs */}
      <div className="absolute bottom-10 left-10 opacity-10 pointer-events-none hidden md:block group">
        <div className="flex gap-1 mb-2">
          <div className="h-1 w-1 bg-white" />
          <div className="h-1 w-1 bg-white" />
          <div className="h-1 w-1 bg-white" />
        </div>
        <p className="font-mono text-[8px] text-[#EEE8DC] uppercase tracking-[0.4em] transform rotate-[-90deg] origin-left offset-x-[-10px]">
          Precision Log v04
        </p>
      </div>
    </div>
  );
}
