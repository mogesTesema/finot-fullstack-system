// src/AppRoutes.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../layouts/MainLayout";
import HomePage from "../pages/home/HomePage";
import AboutPage from "../pages/about/AboutPage";
import ContactPage from "../pages/contact/ContactPage";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordConfirmPage from "../pages/auth/ResetPasswordConfirmPage";
import StudentDashboard from "../pages/dashboard/StudentDashboard";
import DashboardQA from "../pages/dashboard/DashboardQA";
import ProfileDetail from "../pages/profile/ProfileDetail";
import EditProfile from "../pages/profile/EditProfile";
import AnonymousIntro from "../pages/qa/AnonymousIntro";
import QuestionList from "../pages/qa/QuestionList";
import AskQuestion from "../pages/qa/AskQuestion";
import {
  DonationOutside,
  DonationInside,
  DonationHistory,
  DonationProfile,
  DonationSuccess,
} from "../pages/donation";
import ServiceGroupList from "../pages/service/ServiceGroupList";
import ServiceGroupDetail from "../pages/service/ServiceGroupDetail";
import PreferenceForm from "../pages/service/PreferenceForm";
import FamilyPage from "../pages/service/FamilyPage";
import AttendancePage from "../pages/service/AttendancePage";
import ServicesPage from "../pages/service/ServicesPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import GroupAdminDashboard from "../pages/admin/GroupAdminDashboard";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* public */}
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="password-reset/confirm/:uid/:token"
            element={<ResetPasswordConfirmPage />}
          />
          <Route path="anonymous" element={<AnonymousIntro />} />
          <Route path="anonymous/questions" element={<QuestionList />} />
          <Route path="anonymous/ask" element={<AskQuestion />} />
          <Route path="donate" element={<DonationOutside />} />
          <Route path="donate/success" element={<DonationSuccess />} />
          <Route path="donation/success" element={<DonationSuccess />} />

          {/* Protected routes – all logged‑in users */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["student", "service_admin", "super_admin"]}
              />
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="dashboard/qa" element={<DashboardQA />} />
            <Route path="profile" element={<ProfileDetail />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="donate/inside" element={<DonationInside />} />
            <Route path="donate/history" element={<DonationHistory />} />
            <Route path="donate/profile" element={<DonationProfile />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="service-groups" element={<ServiceGroupList />} />
            <Route path="service-groups/:id" element={<ServiceGroupDetail />} />
            <Route path="service-groups/select" element={<PreferenceForm />} />
            <Route path="service/family" element={<FamilyPage />} />
            <Route path="service/attendance" element={<AttendancePage />} />
          </Route>

          {/* Admin‑only routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["service_admin", "super_admin"]} />
            }
          >
            <Route path="group-admin" element={<GroupAdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}