import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  name: "",
  district: "",
  latitude: "",
  longitude: "",
  has_internet: false,
  has_smart_classroom: false,
  has_playground: false,
  has_electricity: false,
};

export default function SubmitSchoolPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }

    setCapturingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setForm((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));
        setCapturingLocation(false);
        toast.success("Location captured successfully.");
      },
      (error) => {
        setCapturingLocation(false);
        const messages: Record<number, string> = {
          1: "Location access denied. Enable location permissions and try again.",
          2: "Location unavailable. Move to an open area and try again.",
          3: "Location request timed out. Please try again.",
        };
        toast.error(messages[error.code] ?? "Failed to capture location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "School name is required.";
    if (!form.district.trim()) return "District is required.";
    if (!form.latitude || !form.longitude) return "Capture your location before submitting.";
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return "Invalid coordinates. Capture location again.";
    }
    if (latitude < -90 || latitude > 90) return "Latitude must be between -90 and 90.";
    if (longitude < -180 || longitude > 180) return "Longitude must be between -180 and 180.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!token) {
      toast.error("You must be logged in to submit a school.");
      return;
    }

    setSubmitting(true);

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);

    try {
      const res = await fetch("http://localhost:5000/schools", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          district: form.district.trim(),
          latitude: lat,
          longitude: lng,
          has_internet: form.has_internet,
          has_smart_classroom: form.has_smart_classroom,
          has_playground: form.has_playground,
          has_electricity: form.has_electricity,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : data.message ?? "Failed to submit school.";
        toast.error(message);
        return;
      }

      toast.success("School submitted successfully.");
      setForm(initialForm);
      navigate(user?.role === "admin" ? "/admin" : "/mapper");
    } catch {
      toast.error("Network error. Check that the backend is running and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-[#EEE8DC] font-sans selection:bg-[#C4622D]/30 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-[#C4622D]" />
              <h1 className="text-3xl font-display font-bold uppercase tracking-wider text-white italic">
                Submit <span className="text-[#D4A847]">School</span>
              </h1>
            </div>
            <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest mt-1">
              SSEVMS Field School Registration
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-white/10 hover:bg-white/5 text-[#EEE8DC] hover:text-white font-mono text-xs uppercase tracking-widest gap-2"
          >
            <ArrowLeft className="h-4 w-4 text-[#C4622D]" />
            Back
          </Button>
        </header>

        <Card className="bg-[#141C25]/85 border-white/5 shadow-xl text-[#EEE8DC]">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-white">
              School Submission Form
            </CardTitle>
            <CardDescription className="text-xs text-[#8A9BAD]">
              Record school details and GPS coordinates at the administration block
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-[#8A9BAD]">
                  School Name <span className="text-[#C4622D]">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Kigali Primary School"
                  className="bg-[#0F1923] border-white/10 text-[#EEE8DC] font-mono text-sm placeholder:text-[#8A9BAD]/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="font-mono text-xs uppercase tracking-widest text-[#8A9BAD]">
                  District <span className="text-[#C4622D]">*</span>
                </Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
                  placeholder="e.g. Gasabo"
                  className="bg-[#0F1923] border-white/10 text-[#EEE8DC] font-mono text-sm placeholder:text-[#8A9BAD]/50"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="font-mono text-xs uppercase tracking-widest text-[#8A9BAD]">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    value={form.latitude}
                    readOnly
                    placeholder="Capture location first"
                    className="bg-[#0F1923]/60 border-white/10 text-[#8A9BAD] font-mono text-sm cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="font-mono text-xs uppercase tracking-widest text-[#8A9BAD]">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    value={form.longitude}
                    readOnly
                    placeholder="Capture location first"
                    className="bg-[#0F1923]/60 border-white/10 text-[#8A9BAD] font-mono text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-mono text-xs uppercase tracking-widest text-[#8A9BAD] font-bold">
                  Infrastructure Indicators
                </Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center space-x-3 bg-[#0F1923]/60 p-4 rounded-md border border-white/10">
                    <input
                      type="checkbox"
                      id="has_internet"
                      checked={form.has_internet}
                      onChange={(e) => setForm((prev) => ({ ...prev, has_internet: e.target.checked }))}
                      className="h-4 w-4 rounded border-white/20 bg-[#0F1923] text-[#C4622D] focus:ring-[#C4622D] focus:ring-offset-0 cursor-pointer accent-[#C4622D]"
                    />
                    <Label htmlFor="has_internet" className="font-mono text-xs uppercase tracking-widest text-[#8A9BAD] cursor-pointer select-none">
                      Has Internet
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 bg-[#0F1923]/60 p-4 rounded-md border border-white/10">
                    <input
                      type="checkbox"
                      id="has_smart_classroom"
                      checked={form.has_smart_classroom}
                      onChange={(e) => setForm((prev) => ({ ...prev, has_smart_classroom: e.target.checked }))}
                      className="h-4 w-4 rounded border-white/20 bg-[#0F1923] text-[#C4622D] focus:ring-[#C4622D] focus:ring-offset-0 cursor-pointer accent-[#C4622D]"
                    />
                    <Label htmlFor="has_smart_classroom" className="font-mono text-xs uppercase tracking-widest text-[#8A9BAD] cursor-pointer select-none">
                      Has Smart Classroom
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 bg-[#0F1923]/60 p-4 rounded-md border border-white/10">
                    <input
                      type="checkbox"
                      id="has_playground"
                      checked={form.has_playground}
                      onChange={(e) => setForm((prev) => ({ ...prev, has_playground: e.target.checked }))}
                      className="h-4 w-4 rounded border-white/20 bg-[#0F1923] text-[#C4622D] focus:ring-[#C4622D] focus:ring-offset-0 cursor-pointer accent-[#C4622D]"
                    />
                    <Label htmlFor="has_playground" className="font-mono text-xs uppercase tracking-widest text-[#8A9BAD] cursor-pointer select-none">
                      Has Playground
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 bg-[#0F1923]/60 p-4 rounded-md border border-white/10">
                    <input
                      type="checkbox"
                      id="has_electricity"
                      checked={form.has_electricity}
                      onChange={(e) => setForm((prev) => ({ ...prev, has_electricity: e.target.checked }))}
                      className="h-4 w-4 rounded border-white/20 bg-[#0F1923] text-[#C4622D] focus:ring-[#C4622D] focus:ring-offset-0 cursor-pointer accent-[#C4622D]"
                    />
                    <Label htmlFor="has_electricity" className="font-mono text-xs uppercase tracking-widest text-[#8A9BAD] cursor-pointer select-none">
                      Has Electricity
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCaptureLocation}
                  disabled={capturingLocation || submitting}
                  className="border-white/10 hover:bg-white/5 text-[#EEE8DC] hover:text-white font-mono text-xs uppercase tracking-widest h-12 gap-2 flex-1"
                >
                  {capturingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#D4A847]" />
                  ) : (
                    <Navigation className="h-4 w-4 text-[#D4A847]" />
                  )}
                  {capturingLocation ? "Capturing Location..." : "Capture My Location"}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || capturingLocation}
                  className="bg-[#C4622D] hover:bg-[#A85225] text-white font-mono text-xs uppercase tracking-widest h-12 gap-2 flex-1"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {submitting ? "Submitting..." : "Submit School"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
