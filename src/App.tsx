import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Layout
import Layout from "./components/layout/Layout";

// Pages
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import DietPlans from "./pages/DietPlans";
import DietPlanDetails from "./pages/DietPlanDetails";
import WeightLoss from "./pages/WeightLoss";
import ExerciseDetails from "./pages/ExerciseDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Profile from "./pages/Profile";
import QuizHistory from "./pages/QuizHistory";
import QuizResult from "./pages/QuizResult";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import ProgressPhotos from "./pages/ProgressPhotos";
import CommunityPhotos from "./pages/CommunityPhotos";
import Challenges from "./pages/Challenges";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBootstrap from "./components/admin/AdminBootstrap";
import { PlatformProvider } from "./contexts/PlatformContext";

function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Auth callback route outside of layout */}
              <Route path="/auth/callback" element={<AuthCallback />} />

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
      </PlatformProvider>
    </AuthProvider>
  );
}

export default App;