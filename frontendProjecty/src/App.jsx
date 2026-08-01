import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './components/theme/theme-provider';
import './App.css'
import { Toaster } from './components/ui/toaster';

// Landing stays eager — it's the entry point Lighthouse/SEO cares about, and lazy-loading
// it would just add a chunk-fetch delay to the page that's already loading first. Everything
// past it (auth pages, and the whole authenticated app behind AppShell) is a separate chunk,
// so a first-time visitor to "/" never downloads Dashboard/Tasks/Focus Rooms/Admin code.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const AppShell = lazy(() => import('./components/layout/AppShell'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const FocusRoomsPage = lazy(() => import('./pages/FocusRoomsPage'));
const FocusRoomPage = lazy(() => import('./pages/FocusRoomPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const OverduePage = lazy(() => import('./pages/OverduePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SummariesPage = lazy(() => import('./pages/SummariesPage'));
const SummaryDetailPage = lazy(() => import('./pages/SummaryDetailPage'));
const QuizTakePage = lazy(() => import('./pages/QuizTakePage'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

function App() {
  return (

  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Toaster/>
    <Router>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsOfUsePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/focus-rooms" element={<FocusRoomsPage />} />
              <Route path="/focus-rooms/:roomCode" element={<FocusRoomPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/overdue" element={<OverduePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="/summaries" element={<SummariesPage />} />
              <Route path="/summaries/:summaryId" element={<SummaryDetailPage />} />
              <Route path="/quizzes/:quizId/take" element={<QuizTakePage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
