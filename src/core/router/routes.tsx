/**
 * Application Routes Configuration
 * Lazy-loaded routes for optimal performance
 */

import AdminDashboard from "@/pages/AdminDashboard";
import AuthCallback from "@/pages/AuthCallback";
import Challenges from "@/pages/Challenges";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";
import DietPlanDetails from "@/pages/DietPlanDetails";
import DietPlans from "@/pages/DietPlans";
import ExerciseDetails from "@/pages/ExerciseDetails";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Quiz from "@/pages/Quiz";
import QuizHistory from "@/pages/QuizHistory";
import QuizResult from "@/pages/QuizResult";
import Register from "@/pages/Register";
import WeightLoss from "@/pages/WeightLoss";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../../features/auth";
import { FullPageLoader } from "../../shared/components/feedback";
import Layout from "../../shared/components/layout/Layout";
import AdminBootstrap from "@/features/admin/components/AdminBootstrap";

const About = lazy(() => import("@/pages/About"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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
        path: "quiz",
        element: <Quiz />,
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
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
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
