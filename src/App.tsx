
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Import các trang
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Parent Pages
import UnifiedDashboard from "./pages/parent/UnifiedDashboard";
import FamilyHub from "./pages/parent/FamilyHub";
import ParentTrack from "./pages/parent/ParentTrack";
import ExerciseAssignments from "./pages/parent/ExerciseAssignments";
import ParentAnalyze from "./pages/parent/ParentAnalyze";
import Forum from "./pages/parent/Forum";
import ParentProfile from "./pages/parent/ParentProfile";

// Assessment Pages (Hướng nghiệp)
import AssessmentHome from "./pages/assessment/AssessmentHome";

// Therapist Pages
import TherapistDashboard from "./pages/therapist/Dashboard";
import TherapistPatients from "./pages/therapist/TherapistPatients";
import VideoReview from "./pages/therapist/VideoReview";
import TherapistLibrary from "./pages/therapist/Library";
import TherapistSessions from "./pages/therapist/Sessions";
import TherapistReports from "./pages/therapist/Reports";
import TherapistMessages from "./pages/therapist/Messages";
import TherapistSettings from "./pages/therapist/Settings";
import TherapistProfile from "./pages/therapist/TherapistProfile";
import TherapistPatientDetail from "./pages/therapist/TherapistPatientDetail";

const queryClient = new QueryClient();

// Component điều hướng thông minh
const AppRoutes = () => {
    const { session } = useAuth();
    const { role, loading } = useUserRole();

    // 1. Màn hình chờ (tránh nhấp nháy trắng)
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // 2. Chưa đăng nhập -> Hiện trang Auth
    if (!session) {
        return (
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        );
    }

    // 3. Đã đăng nhập -> Điều hướng theo Role (Chặt chẽ hơn)
    const dashboardPath = role === "therapist"
        ? "/therapist/dashboard"
        : (role === "parent" ? "/parent/hub" : "/auth");

    return (
        <Routes>
            {/* Redirect root to appropriate dashboard */}
            <Route path="/" element={<Navigate to={dashboardPath} replace />} />

            {/* Parent Routes protected by role guard */}
            <Route path="/parent" element={<Navigate to="/parent/hub" replace />} />
            <Route path="/parent/dashboard" element={<ProtectedRoute allowedRole="parent"><UnifiedDashboard /></ProtectedRoute>} />
            <Route path="/parent/hub" element={<ProtectedRoute allowedRole="parent"><FamilyHub /></ProtectedRoute>} />
            <Route path="/parent/track" element={<ProtectedRoute allowedRole="parent"><ParentTrack /></ProtectedRoute>} />
            <Route path="/parent/exercises" element={<ProtectedRoute allowedRole="parent"><ExerciseAssignments /></ProtectedRoute>} />
            <Route path="/parent/analyze" element={<ProtectedRoute allowedRole="parent"><ParentAnalyze /></ProtectedRoute>} />
            <Route path="/parent/forum" element={<ProtectedRoute allowedRole="parent"><Forum /></ProtectedRoute>} />
            <Route path="/parent/profile" element={<ProtectedRoute allowedRole="parent"><ParentProfile /></ProtectedRoute>} />

            {/* Assessment Routes (Shared for now) */}
            <Route path="/assessment" element={<AssessmentHome />} />

            {/* Therapist Routes protected by role guard */}
            <Route path="/therapist" element={<Navigate to="/therapist/dashboard" replace />} />
            <Route path="/therapist/dashboard" element={<ProtectedRoute allowedRole="therapist"><TherapistDashboard /></ProtectedRoute>} />
            <Route path="/therapist/patients" element={<ProtectedRoute allowedRole="therapist"><TherapistPatients /></ProtectedRoute>} />
            <Route path="/therapist/review" element={<ProtectedRoute allowedRole="therapist"><VideoReview /></ProtectedRoute>} />
            <Route path="/therapist/library" element={<ProtectedRoute allowedRole="therapist"><TherapistLibrary /></ProtectedRoute>} />
            <Route path="/therapist/sessions" element={<ProtectedRoute allowedRole="therapist"><TherapistSessions /></ProtectedRoute>} />
            <Route path="/therapist/reports" element={<ProtectedRoute allowedRole="therapist"><TherapistReports /></ProtectedRoute>} />
            <Route path="/therapist/messages" element={<ProtectedRoute allowedRole="therapist"><TherapistMessages /></ProtectedRoute>} />
            <Route path="/therapist/settings" element={<ProtectedRoute allowedRole="therapist"><TherapistProfile /></ProtectedRoute>} />
            <Route path="/therapist/profile" element={<ProtectedRoute allowedRole="therapist"><TherapistProfile /></ProtectedRoute>} />
            <Route path="/therapist/patient/:parentId" element={<ProtectedRoute allowedRole="therapist"><TherapistPatientDetail /></ProtectedRoute>} />

            {/* Auth route (in case user navigates here while logged in) */}
            <Route path="/auth" element={<Navigate to={dashboardPath} replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
