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
import { ThemeWrapper } from "./components/layout/ThemeWrapper";

// Auth
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";

// Parent pages
import UnifiedDashboard from "./pages/parent/UnifiedDashboard";
import TrackingPage from "./pages/parent/TrackingPage";
import ParentAnalyze from "./pages/parent/ParentAnalyze";
import ParentAdvise from "./pages/parent/ParentAdvise";
import ParentProfile from "./pages/parent/ParentProfile";
import FindTherapist from "./pages/parent/FindTherapist";
import FamilyHub from "./pages/parent/FamilyHub";
import SchedulePage from "./pages/parent/SchedulePage";
import Forum from "./pages/parent/Forum";
import ExerciseAssignments from "./pages/parent/ExerciseAssignments";

// Therapist pages
import TherapistDashboard from "./pages/therapist/Dashboard";
import TherapistPatients from "./pages/therapist/Patients";
import TherapistVideoReview from "./pages/therapist/VideoReview";
import TherapistLibrary from "./pages/therapist/Library";
import TherapistSessions from "./pages/therapist/Sessions";
import TherapistReports from "./pages/therapist/Reports";
import TherapistMessages from "./pages/therapist/Messages";
import TherapistSettings from "./pages/therapist/Settings";
import TherapistPatientDetail from "./pages/therapist/TherapistPatientDetail";

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
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                {/* Landing Page - Public */}
                <Route path="/" element={<Landing />} />

                {/* Auth routes - Public */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/select-role" element={<RoleSelection />} />

                {/* Magic link connection route */}
                <Route path="/connect" element={<Connect />} />
                <Route path="/parent/connect" element={<Connect />} />

                {/* Redirect shortcuts */}
                <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
                <Route path="/therapist" element={<Navigate to="/therapist/dashboard" replace />} />

                {/* Parent Routes */}
                <Route element={<ProtectedRoute allowedRole="parent"><ParentLayout /></ProtectedRoute>}>
                  <Route path="/parent/hub" element={<FamilyHub />} />
                  <Route path="/parent/dashboard" element={<UnifiedDashboard />} />
                  <Route path="/parent/home" element={<Navigate to="/parent/dashboard" replace />} />
                  <Route path="/parent/track" element={<TrackingPage />} />
                  <Route path="/parent/schedule" element={<SchedulePage />} />
                  <Route path="/parent/analyze" element={<ParentAnalyze />} />
                  <Route path="/parent/advise" element={<ParentAdvise />} />
                  <Route path="/parent/profile" element={<ParentProfile />} />
                  <Route path="/parent/map" element={<FindTherapist />} />
                  <Route path="/parent/forum" element={<Forum />} />
                  <Route path="/parent/exercises" element={<ExerciseAssignments />} />
                </Route>

                {/* ASSESSMENT MODE */}
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

                {/* WORKSPACE MODE */}
                <Route element={<ProtectedRoute allowedRole="parent"><FocusLayout /></ProtectedRoute>}>
                  <Route path="/workspace/task" element={<TaskBoard />} />
                </Route>

                {/* Therapist Routes */}
                <Route element={<ProtectedRoute allowedRole="therapist"><TherapistLayout /></ProtectedRoute>}>
                  <Route path="/therapist/dashboard" element={<TherapistDashboard />} />
                  <Route path="/therapist/patients" element={<TherapistPatients />} />
                  <Route path="/therapist/review" element={<TherapistVideoReview />} />
                  <Route path="/therapist/library" element={<TherapistLibrary />} />
                  <Route path="/therapist/sessions" element={<TherapistSessions />} />
                  <Route path="/therapist/reports" element={<TherapistReports />} />
                  <Route path="/therapist/messages" element={<TherapistMessages />} />
                  <Route path="/therapist/settings" element={<TherapistSettings />} />
                  <Route path="/therapist/patient/:parentId" element={<TherapistPatientDetail />} />
                </Route>

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
