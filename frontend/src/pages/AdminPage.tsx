import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Shield, Map, LogOut, Users, Settings, School } from "lucide-react";

export default function AdminPage() {
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
              <Shield className="h-6 w-6 text-[#C4622D]" />
              <h1 className="text-3xl font-display font-bold uppercase tracking-wider text-white italic">
                Admin <span className="text-[#D4A847]">Dashboard</span>
              </h1>
            </div>
            <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest mt-1">
              SSEVMS Security & Control Center
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
                Logged In As
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
                Administrative Actions
              </CardTitle>
              <CardDescription className="text-xs text-[#8A9BAD]">
                Manage system data, parameters, and nodes
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
                onClick={() => navigate("/submit-school")}
                className="bg-[#C4622D] hover:bg-[#A85225] text-white font-mono text-xs uppercase tracking-widest h-12 gap-2"
              >
                <School className="h-4 w-4" />
                Add New School
              </Button>
              <Button
                variant="outline"
                className="border-white/10 hover:bg-white/5 text-[#EEE8DC] hover:text-white font-mono text-xs uppercase tracking-widest h-12 gap-2 sm:col-span-2"
              >
                <Users className="h-4 w-4 text-[#D4A847]" />
                User Directories (Placeholder)
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="border border-white/5 bg-[#141C25]/50 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Settings className="h-5 w-5 text-[#D4A847]" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              System Logs & Infrastructure Index
            </h2>
          </div>
          <p className="font-mono text-[10px] text-[#8A9BAD] uppercase leading-relaxed tracking-wider">
            [SYS_LOG] System node: MINEDUC_KIGALI_HQ initialized.<br />
            [SYS_LOG] Database: Connection to pg_ssevms established.<br />
            [SYS_LOG] Status: Fully operational. All telemetry indicators green.
          </p>
        </div>
      </div>
    </div>
  );
}
