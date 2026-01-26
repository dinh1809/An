import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/contexts/ThemeProvider";

// Layouts
import { ParentLayout } from "@/components/layout/ParentLayout";
import { TherapistLayout } from "@/components/layout/TherapistLayout";
import { FocusLayout } from "@/components/layout/FocusLayout";
import { ClinicianLayout } from "@/components/layout/ClinicianLayout";
import { ParentPortalLayout } from "@/components/layout/ParentPortalLayout";

// Auth
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import ModeSelection from "./pages/ModeSelection";

// Parent pages
import ParentHome from "./pages/parent/ParentHome";
import UnifiedDashboard from "./pages/parent/UnifiedDashboard";
import ParentTrack from "./pages/parent/ParentTrack";
import ParentAnalyze from "./pages/parent/ParentAnalyze";
import ParentAdvise from "./pages/parent/ParentAdvise";
import ParentProfile from "./pages/parent/ParentProfile";
import FindTherapist from "./pages/parent/FindTherapist";
import FamilyHub from "./pages/parent/FamilyHub";
// DEPRECATED: Moved to src/_deprecated/career/
// import Opportunities from "./pages/Opportunities";

// Therapist pages
import TherapistDashboard from "./pages/therapist/TherapistDashboard";
import MissionControlDashboard from "./pages/therapist/MissionControlDashboard";
import PatientManagement from "./pages/therapist/PatientManagement";
import TherapistPatients from "./pages/therapist/TherapistPatients";
import TherapistPatientDetail from "./pages/therapist/TherapistPatientDetail";
import TherapistAnalytics from "./pages/therapist/TherapistAnalytics";
import TherapistSchedule from "./pages/therapist/TherapistSchedule";
import TherapistProfile from "./pages/therapist/TherapistProfile";

// Assessment pages
import AssessmentHome from "./pages/assessment/AssessmentHome";
import DetailSpotter from "./pages/assessment/DetailSpotter";
import RuleSwitcher from "./pages/assessment/RuleSwitcher";
import RuleSwitcherTutorial from "./pages/assessment/RuleSwitcherTutorial";
import SequenceMemory from "./pages/assessment/SequenceMemory";
import DispatcherAssessment from "./pages/assessment/DispatcherAssessment";
import MatrixAssessment from "./pages/assessment/MatrixAssessment";
import AssessmentResult from "./pages/assessment/AssessmentResult";
import TaskBoard from "./pages/workspace/TaskBoard";

// Shared pages
import Connect from "./pages/Connect";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { ThemeWrapper } from "./components/layout/ThemeWrapper";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ThemeWrapper>
              <Routes>
                {/* Redirect root to auth */}
                <Route path="/" element={<Navigate to="/auth" replace />} />

                {/* Auth routes - Public */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/select-role" element={<RoleSelection />} />

                {/* Mode Selection - For Parents after login */}
                <Route path="/select-mode" element={<ProtectedRoute allowedRole="parent"><ModeSelection /></ProtectedRoute>} />

                {/* Magic link connection route */}
                <Route path="/connect" element={<Connect />} />

                {/* Redirect shortcuts */}
                <Route path="/parent" element={<Navigate to="/select-mode" replace />} />
                <Route path="/therapist" element={<Navigate to="/therapist/dashboard" replace />} />

                {/* NEW: Parent Routes with Redesigned ParentPortalLayout */}
                <Route element={<ProtectedRoute allowedRole="parent"><ParentPortalLayout /></ProtectedRoute>}>
                  <Route path="/parent/hub" element={<FamilyHub />} />
                </Route>

                {/* OLD: Legacy Parent Routes */}
                <Route element={<ProtectedRoute allowedRole="parent"><ParentLayout /></ProtectedRoute>}>
                  <Route path="/parent/dashboard" element={<UnifiedDashboard />} />
                  <Route path="/parent/home" element={<ParentHome />} />
                  <Route path="/parent/track" element={<ParentTrack />} />
                  <Route path="/parent/analyze" element={<ParentAnalyze />} />
                  <Route path="/parent/advise" element={<ParentAdvise />} />
                  <Route path="/parent/profile" element={<ParentProfile />} />
                  <Route path="/parent/map" element={<FindTherapist />} />
                </Route>

                {/* --- ASSESSMENT MODE --- */}
                <Route element={<FocusLayout />}>
                  <Route path="/assessment" element={<AssessmentHome />} />
                  <Route path="/assessment/detail-spotter" element={<DetailSpotter />} />
                  <Route path="/assessment/rule-switcher" element={<RuleSwitcher />} />
                  <Route path="/assessment/rule-switcher/tutorial" element={<RuleSwitcherTutorial />} />
                  <Route path="/assessment/piano" element={<SequenceMemory />} />
                  <Route path="/assessment/sequence-memory" element={<SequenceMemory />} />
                  <Route path="/assessment/dispatcher" element={<DispatcherAssessment />} />
                  <Route path="/assessment/matrix" element={<MatrixAssessment />} />
                  <Route path="/assessment/result" element={<AssessmentResult />} />
                </Route>

                {/* --- WORKSPACE MODE (Digital Factory) --- */}
                <Route element={<ProtectedRoute allowedRole="parent"><FocusLayout /></ProtectedRoute>}>
                  <Route path="/workspace/task" element={<TaskBoard />} />
                </Route>

                {/* NEW: Therapist Routes with Redesigned ClinicianLayout */}
                <Route element={<ProtectedRoute allowedRole="therapist"><ClinicianLayout /></ProtectedRoute>}>
                  <Route path="/therapist/dashboard" element={<MissionControlDashboard />} />
                  <Route path="/therapist/patients" element={<PatientManagement />} />
                  <Route path="/therapist/patient/:parentId" element={<TherapistPatientDetail />} />
                  <Route path="/therapist/analytics" element={<TherapistAnalytics />} />
                  <Route path="/therapist/schedule" element={<TherapistSchedule />} />
                  <Route path="/therapist/profile" element={<TherapistProfile />} />
                </Route>

                {/* OLD: Legacy Therapist Routes - Will be deprecated */}
                {/* 
                <Route element={<ProtectedRoute allowedRole="therapist"><TherapistLayout /></ProtectedRoute>}>
                  <Route path="/therapist/old-dashboard" element={<TherapistDashboard />} />
                </Route>
                */}

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ThemeWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
