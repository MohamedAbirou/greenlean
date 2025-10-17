import { Analytics } from "@vercel/analytics/react";
import { AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
// Layout
import Layout from "./components/layout/Layout";
// Pages
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "react-hot-toast";
import AdminBootstrap from "./components/admin/AdminBootstrap";
import CookieConsent from "./components/CookieConsent";
import { PlatformProvider } from "./contexts/PlatformContext";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import AuthCallback from "./pages/AuthCallback";
import Challenges from "./pages/Challenges";
import CommunityPhotos from "./pages/CommunityPhotos";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import DietPlanDetails from "./pages/DietPlanDetails";
import DietPlans from "./pages/DietPlans";
import ExerciseDetails from "./pages/ExerciseDetails";
import FAQ from "./pages/FAQ";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ProgressPhotos from "./pages/ProgressPhotos";
import Quiz from "./pages/Quiz";
import QuizHistory from "./pages/QuizHistory";
import QuizResult from "./pages/QuizResult";
import ResetPassword from "./pages/ResetPassword";
import WeightLoss from "./pages/WeightLoss";

function App() {
  const queryClient = new QueryClient();
  const hasConsent = Cookies.get("cookie-consent") === "accepted";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlatformProvider>
          <Router>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Auth callback route outside of layout */}
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Password reset route outside of layout */}
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="quiz" element={<Quiz />} />
                  <Route path="diet-plans" element={<DietPlans />} />
                  <Route path="diet-plans/:id" element={<DietPlanDetails />} />
                  <Route path="weight-loss" element={<WeightLoss />} />
                  <Route path="weight-loss/:id" element={<ExerciseDetails />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="quiz-history"
                    element={
                      <ProtectedRoute>
                        <QuizHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="quiz-result/:id"
                    element={
                      <ProtectedRoute>
                        <QuizResult />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="progress-photos"
                    element={
                      <ProtectedRoute>
                        <ProgressPhotos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="community"
                    element={
                      <ProtectedRoute>
                        <CommunityPhotos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="challenges"
                    element={
                      <ProtectedRoute>
                        <Challenges />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin-bootstrap"
                    element={
                      <ProtectedRoute>
                        <AdminBootstrap />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </AnimatePresence>
          </Router>

          {hasConsent && <Analytics />}
          <Toaster position="top-right" />
          <SpeedInsights />
          <CookieConsent />
        </PlatformProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
