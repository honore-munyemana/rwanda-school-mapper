import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapPin, Map, LogOut, Navigation } from "lucide-react";

export default function MapperPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-[#EEE8DC] font-sans selection:bg-[#C4622D]/30 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-[#C4622D]" />
              <h1 className="text-3xl font-display font-bold uppercase tracking-wider text-white italic">
                Mapper <span className="text-[#D4A847]">Dashboard</span>
              </h1>
            </div>
            <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest mt-1">
              SSEVMS Geographic Field Data Capture
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-white/10 hover:bg-white/5 text-[#EEE8DC] hover:text-white font-mono text-xs uppercase tracking-widest gap-2"
          >
            <LogOut className="h-4 w-4 text-[#C4622D]" />
            Terminate Session
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-[#141C25]/85 border-white/5 shadow-xl text-[#EEE8DC]">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-[#D4A847]">
                Mapper Session
              </CardTitle>
              <CardDescription className="text-xs text-[#8A9BAD]">
                Active Session Info
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-xs">
              <p>
                <span className="opacity-45">ID:</span> {user?.id}
              </p>
              <p>
                <span className="opacity-45">Name:</span> {user?.name}
              </p>
              <p>
                <span className="opacity-45">Email:</span> {user?.email}
              </p>
              <p>
                <span className="opacity-45">Role:</span>{" "}
                <span className="text-[#C4622D] font-bold uppercase">{user?.role}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#141C25]/85 border-white/5 shadow-xl text-[#EEE8DC] md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-white">
                Mapping Operations
              </CardTitle>
              <CardDescription className="text-xs text-[#8A9BAD]">
                Record schools, trace boundaries, and submit coordinates
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Button
                onClick={() => navigate("/map")}
                className="bg-[#C4622D] hover:bg-[#A85225] text-white font-mono text-xs uppercase tracking-widest h-12 gap-2"
              >
                <Map className="h-4 w-4" />
                Launch System Map
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/submit-school")}
                className="border-white/10 hover:bg-white/5 text-[#EEE8DC] hover:text-white font-mono text-xs uppercase tracking-widest h-12 gap-2"
              >
                <Navigation className="h-4 w-4 text-[#D4A847]" />
                Field Collection
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="border border-white/5 bg-[#141C25]/50 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Navigation className="h-5 w-5 text-[#D4A847]" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              Field Mapping Checklist
            </h2>
          </div>
          <p className="font-mono text-[10px] text-[#8A9BAD] uppercase leading-relaxed tracking-wider">
            1. Calibrate device GPS sensor and ensure accuracy within 5 meters.<br />
            2. Record GPS coordinates at the main school administration block.<br />
            3. Fill in all registration details (Name, Sector, District, and Level) before submission.
          </p>
        </div>
      </div>
    </div>
  );
}
