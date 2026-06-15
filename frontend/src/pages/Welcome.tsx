import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

function getDashboardPathForJwtRole(role: string): string {
  if (role === 'admin') return '/admin';
  if (role === 'validator') return '/validator';
  if (role === 'mapper') return '/mapper';
  return '/map';
}

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;
    navigate(getDashboardPathForJwtRole(user.role));
  }, [navigate, isAuthenticated, user, loading]);

  return (
    <div className="relative min-h-screen w-full bg-[#0F1923] overflow-hidden flex flex-col font-sans text-[#EEE8DC]">
      {/* Fullscreen Terrain Map Background */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url("/rwanda-terrain.png")' }}
      />

      {/* Animated Scan Line effect */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-[linear-gradient(rgba(26,107,107,0.1)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/5 bg-[#0F1923]/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#C4622D] shadow-[0_0_15px_rgba(196,98,45,0.4)] flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold tracking-tight text-xl leading-none">SSEVMS</span>
              <span className="text-[10px] font-mono font-bold text-[#D4A847] uppercase tracking-[0.2em] mt-1">Rwanda Unified Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="font-label text-sm uppercase tracking-widest hover:text-[#C4622D] hover:bg-white/5"
              onClick={() => navigate('/login')}
            >
              Access System
            </Button>
            <Button
              className="bg-[#C4622D] hover:bg-[#A85225] text-white font-label text-sm uppercase tracking-widest px-6"
              onClick={() => navigate('/login')}
            >
              Register Unit
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-8"
        >
          {/* Imigongo Divider Fragment */}
          <div className="flex justify-center mb-6">
            <div className="h-0.5 w-12 bg-[#C4622D]" />
            <div className="h-0.5 w-4 bg-[#D4A847] mx-1" />
            <div className="h-0.5 w-12 bg-[#C4622D]" />
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight text-white">
            Precision <span className="text-[#C4622D]">Cartography</span><br />
            meets Education Authority
          </h1>

          <p className="font-sans text-xl md:text-2xl text-[#8A9BAD] max-w-2xl mx-auto leading-relaxed">
            Rwanda's Smart School Existence Verification & Mapping System.
            A national mission-control for architectural and GIS infrastructure monitoring.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
            <Button
              size="lg"
              className="bg-[#C4622D] hover:bg-[#A85225] text-white font-label h-14 px-10 rounded-xl shadow-lg ring-1 ring-[#C4622D]/50 transition-all hover:scale-[1.02]"
              onClick={() => navigate('/login')}
            >
              Launch Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 hover:bg-white/5 font-label h-14 px-10 rounded-xl backdrop-blur-sm transition-all hover:scale-[1.02]"
              onClick={() => navigate('/map')}
            >
              Explore National Map
            </Button>
          </div>

          <div className="mt-16 flex justify-center gap-12 text-[#8A9BAD] font-mono text-xs uppercase tracking-[0.3em]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[#D4A847] text-lg font-bold">2.4k</span>
              Verified Units
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[#D4A847] text-lg font-bold">30</span>
              Districts Active
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[#D4A847] text-lg font-bold">100%</span>
              GPS Precision
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Design Motif (Imigongo inspired pattern strip) */}
      <footer className="relative z-10 py-8 px-6 border-t border-white/5 bg-[#0F1923]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-mono text-[#8A9BAD] uppercase tracking-widest">
            Ministry of Education • GIS Logistics Division • v4.1
          </p>
          <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            {/* Logo placeholders or small icons */}
            <div className="h-6 w-12 bg-white/10 rounded" />
            <div className="h-6 w-12 bg-white/10 rounded" />
          </div>
        </div>
      </footer>
    </div>
  );
}
