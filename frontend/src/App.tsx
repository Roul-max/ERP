import React, { useContext, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import MainLayout from './layouts/MainLayout';
import Spinner from './components/Spinner';
import GlobalError from './components/GlobalError';
import GlobalToast from './components/GlobalToast';

// Lazy Load Pages
const Login = React.lazy(() => import('./pages/Login'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Admin Pages
const Students = React.lazy(() => import('./pages/admin/Students'));
const Academics = React.lazy(() => import('./pages/admin/Academics'));
const CourseDetail = React.lazy(() => import('./pages/admin/CourseDetail')); // Added
const Scheduler = React.lazy(() => import('./pages/admin/Scheduler'));
const Library = React.lazy(() => import('./pages/admin/Library'));
const Documents = React.lazy(() => import('./pages/admin/Documents'));
const Communication = React.lazy(() => import('./pages/admin/Communication'));
const HRPayroll = React.lazy(() => import('./pages/admin/HRPayroll'));
const Finance = React.lazy(() => import('./pages/admin/Finance'));
const Reports = React.lazy(() => import('./pages/admin/Reports'));
const Analytics = React.lazy(() => import('./pages/admin/Analytics'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Hostel = React.lazy(() => import('./pages/admin/Hostel'));

// Faculty Pages
const MyCourses = React.lazy(() => import('./pages/faculty/MyCourses'));
const Exams = React.lazy(() => import('./pages/faculty/Exams'));
const MarkAttendance = React.lazy(() => import('./pages/faculty/MarkAttendance'));

// Student Pages
const StudentAttendance = React.lazy(() => import('./pages/student/Attendance'));
const Fees = React.lazy(() => import('./pages/student/Fees'));
const Results = React.lazy(() => import('./pages/student/Results'));

// Common Pages
const UserProfile = React.lazy(() => import('./pages/UserProfile'));

const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useContext(AuthContext)!;

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <UIProvider>
        <AuthProvider>
          <ThemeProvider>
            <Spinner />
            <GlobalError />
            <GlobalToast />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                <Route path="/*" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          
                          {/* Shared / Common */}
                          <Route path="/profile" element={<UserProfile />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/scheduler" element={<Scheduler />} />
                          <Route path="/courses/:id" element={<CourseDetail />} /> 
                          
                          {/* Admin Routes */}
                          <Route path="/students" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <Students />
                            </ProtectedRoute>
                          } />
                          <Route path="/academics" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <Academics />
                            </ProtectedRoute>
                          } />
                          <Route path="/exams" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <Exams />
                            </ProtectedRoute>
                          } />
                          <Route path="/library" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <Library />
                            </ProtectedRoute>
                          } />
                          <Route path="/documents" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <Documents />
                            </ProtectedRoute>
                          } />
                          <Route path="/communication" element={
                            <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}>
                              <Communication />
                            </ProtectedRoute>
                          } />
                          <Route path="/hr" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <HRPayroll />
                            </ProtectedRoute>
                          } />
                          <Route path="/finance" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <Finance />
                            </ProtectedRoute>
                          } />
                          <Route path="/reports" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <Reports />
                            </ProtectedRoute>
                          } />
                          <Route path="/analytics" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <Analytics />
                            </ProtectedRoute>
                          } />
                          <Route path="/hostel" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <Hostel />
                            </ProtectedRoute>
                          } />

                          {/* Faculty Routes */}
                          <Route path="/faculty/courses" element={
                            <ProtectedRoute allowedRoles={['faculty']}>
                              <MyCourses />
                            </ProtectedRoute>
                          } />
                          <Route path="/faculty/exams" element={
                            <ProtectedRoute allowedRoles={['faculty']}>
                              <Exams />
                            </ProtectedRoute>
                          } />
                          <Route path="/attendance/mark" element={
                            <ProtectedRoute allowedRoles={['faculty']}>
                              <MarkAttendance />
                            </ProtectedRoute>
                          } />
                          
                          {/* Student Routes */}
                          <Route path="/my-attendance" element={
                            <ProtectedRoute allowedRoles={['student']}>
                              <StudentAttendance />
                            </ProtectedRoute>
                          } />
                          <Route path="/my-fees" element={
                            <ProtectedRoute allowedRoles={['student']}>
                              <Fees />
                            </ProtectedRoute>
                          } />
                          <Route path="/my-results" element={
                            <ProtectedRoute allowedRoles={['student']}>
                              <Results />
                            </ProtectedRoute>
                          } />
                          
                          {/* Fallback */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Suspense>
                    </MainLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </UIProvider>
    </HashRouter>
  );
};

export default App;
