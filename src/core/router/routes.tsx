/**
 * Application Routes Configuration
 * Lazy-loaded routes for optimal performance
 */

import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { ProtectedRoute } from "../../features/auth";
import { FullPageLoader } from "../../shared/components/feedback";

const Home = lazy(() => import("../../pages/Home"));
const About = lazy(() => import("../../pages/About"));
const Contact = lazy(() => import("../../pages/Contact"));
const FAQ = lazy(() => import("../../pages/FAQ"));
const Quiz = lazy(() => import("../../pages/Quiz"));
const QuizHistory = lazy(() => import("../../pages/QuizHistory"));
const QuizResult = lazy(() => import("../../pages/QuizResult"));
const Dashboard = lazy(() => import("../../pages/Dashboard"));
const Profile = lazy(() => import("../../pages/Profile"));
const Challenges = lazy(() => import("../../pages/Challenges"));
const DietPlans = lazy(() => import("../../pages/DietPlans"));
const DietPlanDetails = lazy(() => import("../../pages/DietPlanDetails"));
const WeightLoss = lazy(() => import("../../pages/WeightLoss"));
const ExerciseDetails = lazy(() => import("../../pages/ExerciseDetails"));
const AdminDashboard = lazy(() => import("../../pages/AdminDashboard"));
const AdminBootstrap = lazy(() => import("../../components/admin/AdminBootstrap"));
const Register = lazy(() => import("../../pages/Register"));
const ResetPassword = lazy(() => import("../../pages/ResetPassword"));
const AuthCallback = lazy(() => import("../../pages/AuthCallback"));
const NotFound = lazy(() => import("../../pages/NotFound"));

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
