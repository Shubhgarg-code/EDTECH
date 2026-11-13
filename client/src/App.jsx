import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CoursesCataloguePage } from './pages/CoursesCataloguePage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Student Protected Pages
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { LmsClassroomPage } from './pages/LmsClassroomPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin CMS & Management Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminCourseContentPage } from './pages/admin/AdminCourseContentPage';
import { AdminCmsPage } from './pages/admin/AdminCmsPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminAssignmentsPage } from './pages/admin/AdminAssignmentsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout for Public & Student pages (Admin & Classroom have their own full-screen layouts)
const PublicLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isClassroom = location.pathname.startsWith('/learn/');

  if (isAdminRoute || isClassroom) {
    return children;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <PublicLayout>
            <Routes>
              {/* Public Website */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/courses" element={<CoursesCataloguePage />} />
              <Route path="/courses/:slug" element={<CourseDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* Student Protected Portal */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/:courseId"
                element={
                  <ProtectedRoute>
                    <LmsClassroomPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Separate CMS Panel */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminOverviewPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="courses/:courseId/content" element={<AdminCourseContentPage />} />
                <Route path="cms" element={<AdminCmsPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="assignments" element={<AdminAssignmentsPage />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PublicLayout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
