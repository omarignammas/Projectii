import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CalendarPage from './pages/CalendarPage';
import FocusRoomsPage from './pages/FocusRoomsPage';
import FocusRoomPage from './pages/FocusRoomPage';
import NotesPage from './pages/NotesPage';
import FriendsPage from './pages/FriendsPage';
import StatsPage from './pages/StatsPage';
import OverduePage from './pages/OverduePage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import {ThemeProvider} from './components/theme/theme-provider';
import './App.css'
import { Toaster } from './components/ui/toaster';


function App() {
  return (

  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Toaster/>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
