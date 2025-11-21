/**
 * Application Routes Configuration
 * Lazy-loaded routes for optimal performance
 */

import AuthCallback from "@/pages/AuthCallback";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import MaintenancePage from "@/pages/MaintenancePage";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../../features/auth";
import { FullPageLoader } from "../../shared/components/feedback";
import Layout from "../../shared/components/layout/Layout";

// Lazy load all heavy pages for optimal performance
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const QuizHistory = lazy(() => import("@/pages/QuizHistory"));
const QuizResult = lazy(() => import("@/pages/QuizResult"));
const Challenges = lazy(() => import("@/pages/Challenges"));
const DietPlans = lazy(() => import("@/pages/DietPlans"));
const DietPlanDetails = lazy(() => import("@/pages/DietPlanDetails"));
const ExerciseDetails = lazy(() => import("@/pages/ExerciseDetails"));
const ProfileSettings = lazy(() => import("@/pages/ProfileSettings"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminBootstrap = lazy(() => import("@/features/admin/components/AdminBootstrap"));
const Contact = lazy(() => import("@/pages/Contact"));
const WeightLoss = lazy(() => import("@/pages/WeightLoss"));
const About = lazy(() => import("@/pages/About"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));

export const routes: RouteObject[] = [
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/maintenance",
    element: <MaintenancePage />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "faq",
        element: <FAQ />,
      },
      {
        path: "privacy",
        element: <PrivacyPolicy />,
      },
      {
        path: "terms",
        element: <TermsOfService />,
      },
      {
        path: "diet-plans",
        element: <DietPlans />,
      },
      {
        path: "diet-plans/:id",
        element: <DietPlanDetails />,
      },
      {
        path: "weight-loss",
        element: <WeightLoss />,
      },
      {
        path: "weight-loss/:id",
        element: <ExerciseDetails />,
      },
      {
        path: "quiz",
        element: (
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/settings",
        element: (
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "quiz-history",
        element: (
          <ProtectedRoute>
            <QuizHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "quiz-result/:id",
        element: (
          <ProtectedRoute>
            <QuizResult />
          </ProtectedRoute>
        ),
      },
      {
        path: "challenges",
        element: (
          <ProtectedRoute>
            <Challenges />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin-bootstrap",
        element: (
          <ProtectedRoute>
            <AdminBootstrap />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

export const suspenseFallback = <FullPageLoader text="Loading page..." />;
