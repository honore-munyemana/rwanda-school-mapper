import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import AdminPage from "./pages/AdminPage";
import ValidatorPage from "./pages/ValidatorPage";
import MapperPage from "./pages/MapperPage";
import SubmitSchoolPage from "./pages/SubmitSchoolPage";
import MapView from "./pages/MapView";
import SchoolsRegistry from "./pages/SchoolsRegistry";
import MobileDataCollection from "./pages/MobileDataCollection";
import Analytics from "./pages/Analytics";
import DataIntegration from "./pages/DataIntegration";
import VerificationQueue from "./pages/VerificationQueue";
import RemoteValidation from "./pages/RemoteValidation";
import QualityAudit from "./pages/QualityAudit";
import Reports from "./pages/Reports";
import CommunityEngagement from "./pages/CommunityEngagement";
import InfrastructureAssessment from "./pages/InfrastructureAssessment";
import SystemSettings from "./pages/SystemSettings";
import UserManagement from "./pages/UserManagement";
import AuditTrail from "./pages/AuditTrail";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Welcome / auth */}
          <Route path="/" element={<Welcome />} />
          <Route path="/signin" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes - Accessible by authenticated users with appropriate roles */}
          {/* Protected Routes - Accessible by authenticated users with appropriate roles */}
          <Route element={<ProtectedRoute roles={["admin", "validator", "mapper"]} />}>
            <Route path="/map" element={<MapView />} />
            <Route path="/schools" element={<SchoolsRegistry />} />
            <Route path="/mobile" element={<MobileDataCollection />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/community" element={<CommunityEngagement />} />
            <Route path="/infrastructure" element={<InfrastructureAssessment />} />
            <Route path="/quality" element={<QualityAudit />} />
            <Route path="/integration" element={<DataIntegration />} />
            <Route path="/settings" element={<SystemSettings />} />
          </Route>

          {/* Admin Restricted */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/audit" element={<AuditTrail />} />
          </Route>

          {/* Validator Restricted */}
          <Route element={<ProtectedRoute roles={["validator"]} />}>
            <Route path="/validator" element={<ValidatorPage />} />
            <Route path="/verification" element={<VerificationQueue />} />
            <Route path="/validation" element={<RemoteValidation />} />
            <Route path="/verifier" element={<Navigate to="/validator" replace />} />
          </Route>

          {/* Mapper Restricted */}
          <Route element={<ProtectedRoute roles={["mapper"]} />}>
            <Route path="/mapper" element={<MapperPage />} />
          </Route>

          {/* School submission - admin & mapper */}
          <Route element={<ProtectedRoute roles={["admin", "mapper"]} />}>
            <Route path="/submit-school" element={<SubmitSchoolPage />} />
          </Route>

          <Route path="/public" element={<Navigate to="/mapper" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
