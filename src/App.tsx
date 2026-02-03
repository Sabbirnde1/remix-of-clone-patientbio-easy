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
import AppointmentsPage from "./pages/dashboard/AppointmentsPage";

// Hospital imports
import HospitalsPage from "./pages/hospital/HospitalsPage";
import HospitalOnboardingPage from "./pages/hospital/HospitalOnboardingPage";
import HospitalAuthPage from "./pages/hospital/HospitalAuthPage";
import ApplyToHospitalPage from "./pages/hospital/ApplyToHospitalPage";
import HospitalLayout from "./pages/hospital/HospitalLayout";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalStaffPage from "./pages/hospital/HospitalStaffPage";
import HospitalApplicationsPage from "./pages/hospital/HospitalApplicationsPage";
import HospitalSettingsPage from "./pages/hospital/HospitalSettingsPage";
import DoctorPatientsPage from "./pages/hospital/DoctorPatientsPage";
import DoctorPrescriptionsPage from "./pages/hospital/DoctorPrescriptionsPage";
import HospitalAppointmentsPage from "./pages/hospital/HospitalAppointmentsPage";
import DoctorAvailabilityPage from "./pages/hospital/DoctorAvailabilityPage";
import HospitalWardsPage from "./pages/hospital/HospitalWardsPage";
import HospitalAdmissionsPage from "./pages/hospital/HospitalAdmissionsPage";
import HospitalBillingPage from "./pages/hospital/HospitalBillingPage";

// Standalone Doctor Portal imports
import DoctorAuthPage from "./pages/doctor/DoctorAuthPage";
import DoctorOnboardingPage from "./pages/doctor/DoctorOnboardingPage";
import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfilePage from "./pages/doctor/DoctorProfilePage";
import DoctorPatientsPageStandalone from "./pages/doctor/DoctorPatientsPage";
import DoctorPrescriptionsPageStandalone from "./pages/doctor/DoctorPrescriptionsPage";
import DoctorQRCodePage from "./pages/doctor/DoctorQRCodePage";

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
            <Route path="/hospitals/register" element={<HospitalOnboardingPage />} />
            <Route path="/hospitals/login" element={<HospitalAuthPage />} />
            <Route path="/hospitals/:hospitalId/apply" element={<ApplyToHospitalPage />} />
            <Route path="/hospital/:hospitalId" element={<HospitalLayout />}>
              <Route index element={<HospitalDashboard />} />
              <Route path="staff" element={<HospitalStaffPage />} />
              <Route path="applications" element={<HospitalApplicationsPage />} />
            <Route path="settings" element={<HospitalSettingsPage />} />
              <Route path="patients" element={<DoctorPatientsPage />} />
              <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
              <Route path="appointments" element={<HospitalAppointmentsPage />} />
              <Route path="availability" element={<DoctorAvailabilityPage />} />
              <Route path="wards" element={<HospitalWardsPage />} />
              <Route path="admissions" element={<HospitalAdmissionsPage />} />
              <Route path="billing" element={<HospitalBillingPage />} />
            </Route>
            
            {/* Standalone Doctor Portal Routes */}
            <Route path="/doctors/login" element={<DoctorAuthPage />} />
            <Route path="/doctor/onboarding" element={<DoctorOnboardingPage />} />
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route index element={<DoctorDashboard />} />
              <Route path="profile" element={<DoctorProfilePage />} />
              <Route path="patients" element={<DoctorPatientsPageStandalone />} />
              <Route path="prescriptions" element={<DoctorPrescriptionsPageStandalone />} />
              <Route path="qr-code" element={<DoctorQRCodePage />} />
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
              <Route path="appointments" element={<AppointmentsPage />} />
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
