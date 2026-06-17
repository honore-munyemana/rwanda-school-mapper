import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { FileText, Loader2, Download } from 'lucide-react';

interface SchoolItem {
  id: number;
  name: string;
  district: string;
}

export default function Reports() {
  const { stats } = useData();
  const { token, user } = useAuth();
  const location = useLocation();
  const [reportType, setReportType] = useState<string>(() => {
    return location.state && typeof location.state === 'object' && 'reportType' in location.state
      ? (location.state as any).reportType
      : 'summary';
  });
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(() => {
    return location.state && typeof location.state === 'object' && 'selectedSchoolId' in location.state
      ? String((location.state as any).selectedSchoolId)
      : '';
  });
  const [schoolsList, setSchoolsList] = useState<SchoolItem[]>([]);
  const [loadingSchools, setLoadingSchools] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [realStats, setRealStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const isAdminOrValidator = user?.role === 'admin' || user?.role === 'validator';

  // Load real aggregate statistics from backend summary API
  useEffect(() => {
    if (token) {
      setLoadingStats(true);
      fetch("http://localhost:5000/reports/summary", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load metrics");
          return res.json();
        })
        .then((data) => {
          setRealStats(data);
        })
        .catch((err) => console.error("Error loading real summary stats:", err))
        .finally(() => setLoadingStats(false));
    }
  }, [token]);

  // Load schools list if individual detail report is chosen
  useEffect(() => {
    if (reportType === 'detail' && schoolsList.length === 0 && token) {
      const fetchSchools = async () => {
        setLoadingSchools(true);
        try {
          const res = await fetch("http://localhost:5000/schools", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!res.ok) throw new Error("Failed to fetch schools list");
          const geojson = await res.json();
          const list = (geojson.features || []).map((f: any) => ({
            id: f.properties.id,
            name: f.properties.name,
            district: f.properties.district
          })).sort((a: any, b: any) => a.name.localeCompare(b.name));
          
          setSchoolsList(list);
          if (list.length > 0) {
            setSelectedSchoolId(prev => prev || String(list[0].id));
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to load school list for dropdown selection");
        } finally {
          setLoadingSchools(false);
        }
      };
      fetchSchools();
    }
  }, [reportType, schoolsList.length, token]);

  // Handle actual PDF report generation and download
  const handleExport = async () => {
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    if (reportType === 'detail' && !selectedSchoolId) {
      toast.error("Please select a school to export.");
      return;
    }

    setGenerating(true);
    const toastId = toast.loading("Generating vector PDF report...");

    try {
      let url = "";
      let filename = "";

      if (reportType === 'summary') {
        url = "http://localhost:5000/reports/summary/pdf";
        filename = "ssevms-system-summary.pdf";
      } else if (reportType === 'districts') {
        url = "http://localhost:5000/reports/districts/pdf";
        filename = "ssevms-districts-report.pdf";
      } else if (reportType === 'audit') {
        url = "http://localhost:5000/reports/audit/pdf";
        filename = "ssevms-verification-audit-report.pdf";
      } else if (reportType === 'compliance') {
        url = "http://localhost:5000/reports/compliance/pdf";
        filename = "ssevms-school-compliance-report.pdf";
      } else if (reportType === 'detail') {
        url = `http://localhost:5000/reports/schools/${selectedSchoolId}/pdf`;
        const selectedSchool = schoolsList.find(s => String(s.id) === selectedSchoolId);
        const schoolCleanName = selectedSchool 
          ? selectedSchool.name.toLowerCase().replace(/[^a-z0-9]/g, "-") 
          : selectedSchoolId;
        filename = `ssevms-school-${schoolCleanName}.pdf`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 403) {
        toast.dismiss(toastId);
        toast.error("Access Denied: You do not have permissions to generate this report.");
        return;
      }

      if (!res.ok) {
        throw new Error(`Report generation failed on server (Status: ${res.status})`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.dismiss(toastId);
      toast.success("PDF Report downloaded successfully.");
    } catch (error: any) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to download PDF report.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight">Reports Command Center</h1>
          <p className="text-[#8A9BAD] font-mono text-xs uppercase tracking-widest mt-1">
            Generate and export official national registry records in secure PDF format.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Controls Card */}
          <Card className="bg-[#141C25] border-white/5 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#D4A847]" />
                PDF Report Configuration
              </CardTitle>
              <CardDescription className="text-[#8A9BAD]">
                Configure parameters and compile data queries into branded SSEVMS document formats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-[#8A9BAD] font-mono">Select Report Type</Label>
                <Select value={reportType} onValueChange={(val) => setReportType(val)}>
                  <SelectTrigger className="bg-black/20 border-white/5 focus:ring-[#C4622D] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141C25] border-white/10 text-white">
                    <SelectItem value="summary">System Summary Report</SelectItem>
                    <SelectItem value="districts">District Performance Breakdown</SelectItem>
                    <SelectItem value="compliance">Smart School Compliance Checklist</SelectItem>
                    {isAdminOrValidator && (
                      <SelectItem value="audit">Verification Audit Log Trail</SelectItem>
                    )}
                    <SelectItem value="detail">Individual School Detail Profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic School Selector if Detail is chosen */}
              {reportType === 'detail' && (
                <div className="space-y-2 animate-fade-in">
                  <Label className="text-xs uppercase tracking-wider text-[#8A9BAD] font-mono">Select School Profile</Label>
                  {loadingSchools ? (
                    <div className="flex items-center gap-2 text-xs text-[#8A9BAD] font-mono h-10 px-3 bg-black/20 border border-white/5 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-[#D4A847]" />
                      Querying school registry node...
                    </div>
                  ) : (
                    <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                      <SelectTrigger className="bg-black/20 border-white/5 focus:ring-[#C4622D] text-white">
                        <SelectValue placeholder="Search/Select a school" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141C25] border-white/10 text-white max-h-60">
                        {schoolsList.map((school) => (
                          <SelectItem key={school.id} value={String(school.id)}>
                            {school.name} ({school.district})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8A9BAD]/40 uppercase tracking-widest">
                  Secure AES-256 Compile Node
                </span>
                <Button 
                  onClick={handleExport} 
                  disabled={generating || (reportType === 'detail' && !selectedSchoolId)}
                  className="bg-[#C4622D] hover:bg-[#A85225] text-white font-label text-xs uppercase tracking-widest px-6 rounded-lg shadow-lg transition-all"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Compile &amp; Download PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Preview Card */}
          <Card className="bg-[#141C25] border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Active Database Snapshot</CardTitle>
              <CardDescription className="text-[#8A9BAD]">
                Real-time metrics pulled from national database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-[#EEE8DC]">
              {loadingStats ? (
                <div className="flex items-center gap-2 text-xs text-[#8A9BAD] font-mono py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[#D4A847]" />
                  Querying node metrics...
                </div>
              ) : realStats ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#8A9BAD] uppercase">Total Schools:</span>
                    <span className="font-bold text-white">{realStats.totalSchools}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#8A9BAD] uppercase">Verified:</span>
                    <span className="font-bold text-[#3D7A5C]">
                      {realStats.verifiedSchools} ({Math.round((realStats.verifiedSchools / (realStats.totalSchools || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#8A9BAD] uppercase">Unverified:</span>
                    <span className="font-bold text-[#C4622D]">{realStats.unverifiedSchools}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/5">
                    <span className="text-[#8A9BAD] uppercase">Avg Smart Score:</span>
                    <span className="font-bold text-[#D4A847]">{realStats.averageSmartScore} / 4.0</span>
                  </div>
                  <div className="pt-2 text-[10px] text-[#8A9BAD]/40 uppercase tracking-widest text-center">
                    Sync status: operational
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#8A9BAD] uppercase">Total Schools:</span>
                    <span className="font-bold text-white">{stats.total}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#8A9BAD] uppercase">Verified:</span>
                    <span className="font-bold text-[#3D7A5C]">{stats.verified} ({stats.verificationRate}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A9BAD] uppercase">Pending:</span>
                    <span className="font-bold text-[#D4A847]">{stats.pending}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
