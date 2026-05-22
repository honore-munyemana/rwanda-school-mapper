import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ClipboardCheck, Map, LogOut, FileText } from "lucide-react";

export default function ValidatorPage() {
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
              <ClipboardCheck className="h-6 w-6 text-[#C4622D]" />
              <h1 className="text-3xl font-display font-bold uppercase tracking-wider text-white italic">
                Validator <span className="text-[#D4A847]">Dashboard</span>
              </h1>
            </div>
            <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest mt-1">
              SSEVMS School Records Validation Portal
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
                Validator Session
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
                Validation Workspaces
              </CardTitle>
              <CardDescription className="text-xs text-[#8A9BAD]">
                Approve, reject, or audit school records
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
                className="border-white/10 hover:bg-white/5 text-[#EEE8DC] hover:text-white font-mono text-xs uppercase tracking-widest h-12 gap-2"
              >
                <FileText className="h-4 w-4 text-[#D4A847]" />
                Validation Queue (Placeholder)
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="border border-white/5 bg-[#141C25]/50 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <FileText className="h-5 w-5 text-[#D4A847]" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              Validation Guidelines
            </h2>
          </div>
          <p className="font-mono text-[10px] text-[#8A9BAD] uppercase leading-relaxed tracking-wider">
            1. Ensure the field operator is within 100 meters of the school location before validating.<br />
            2. Verify infrastructure details conform to the MINEDUC mapping index.<br />
            3. Review geo-tagged photographs and coordinates before marking as Verified.
          </p>
        </div>
      </div>
    </div>
  );
}
