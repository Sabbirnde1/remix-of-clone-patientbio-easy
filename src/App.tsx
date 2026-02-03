import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import FeaturesPage from "./pages/FeaturesPage";
import DemoPage from "./pages/DemoPage";
import AboutPage from "./pages/AboutPage";
import TeamPage from "./pages/TeamPage";
import InvestorsPage from "./pages/InvestorsPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFound from "./pages/NotFound";
import ShareViewPage from "./pages/ShareViewPage";
import InstallPage, { InstallPromptBanner } from "./pages/InstallPage";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import TeamAdminPage from "./pages/admin/TeamAdminPage";
import ContentPage from "./pages/admin/ContentPage";
import MessagesPage from "./pages/admin/MessagesPage";

// Dashboard imports
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilePage from "./pages/dashboard/ProfilePage";
import HealthDataPage from "./pages/dashboard/HealthDataPage";
import PrescriptionsPage from "./pages/dashboard/PrescriptionsPage";
import UploadPage from "./pages/dashboard/UploadPage";
import ShareDataPage from "./pages/dashboard/ShareDataPage";
import MyDoctorsPage from "./pages/dashboard/MyDoctorsPage";
import QRCodePage from "./pages/dashboard/QRCodePage";

// Hospital imports
import HospitalsPage from "./pages/hospital/HospitalsPage";
import RegisterHospitalPage from "./pages/hospital/RegisterHospitalPage";
import ApplyToHospitalPage from "./pages/hospital/ApplyToHospitalPage";
import HospitalLayout from "./pages/hospital/HospitalLayout";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalStaffPage from "./pages/hospital/HospitalStaffPage";
import HospitalApplicationsPage from "./pages/hospital/HospitalApplicationsPage";
import HospitalSettingsPage from "./pages/hospital/HospitalSettingsPage";
import DoctorPatientsPage from "./pages/hospital/DoctorPatientsPage";
import DoctorPrescriptionsPage from "./pages/hospital/DoctorPrescriptionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <InstallPromptBanner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/investors" element={<InvestorsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/share/:token" element={<ShareViewPage />} />
            
            {/* Hospital Routes */}
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/hospitals/register" element={<RegisterHospitalPage />} />
            <Route path="/hospitals/:hospitalId/apply" element={<ApplyToHospitalPage />} />
            <Route path="/hospital/:hospitalId" element={<HospitalLayout />}>
              <Route index element={<HospitalDashboard />} />
              <Route path="staff" element={<HospitalStaffPage />} />
              <Route path="applications" element={<HospitalApplicationsPage />} />
              <Route path="settings" element={<HospitalSettingsPage />} />
              <Route path="patients" element={<DoctorPatientsPage />} />
              <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
            </Route>
            
            {/* Patient Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="health-data" element={<HealthDataPage />} />
              <Route path="prescriptions" element={<PrescriptionsPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="share" element={<ShareDataPage />} />
              <Route path="doctors" element={<MyDoctorsPage />} />
              <Route path="qr-code" element={<QRCodePage />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="team" element={<TeamAdminPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="messages" element={<MessagesPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
