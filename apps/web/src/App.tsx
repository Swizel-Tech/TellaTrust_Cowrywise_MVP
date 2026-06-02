import { Navigate, Route, Routes } from 'react-router-dom';
import Splash from './pages/Splash';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './pages/app/AppLayout';
import Dashboard from './pages/app/Dashboard';
import Savings from './pages/app/Savings';
import Investments from './pages/app/Investments';
import Portfolio from './pages/app/Portfolio';
import Stash from './pages/app/Stash';
import Nest from './pages/app/Nest';
import Groups from './pages/app/Groups';
import Transactions from './pages/app/Transactions';
import Notifications from './pages/app/Notifications';
import Profile from './pages/app/Profile';
import Learn from './pages/app/Learn';
import Referral from './pages/app/Referral';

/**
 * The splash sequence is only for the installed PWA experience. In a normal
 * browser ("web view") we skip it entirely and go straight to the landing page.
 * Inside an installed PWA (standalone display mode), first-time launches show
 * the splash, then land on the marketing page.
 */
function Home() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  // Browser ("web view"): straight to the marketing landing page.
  if (!isStandalone) return <Landing />;

  // Installed app: first launch shows the splash sequence, then login.
  // Later launches go straight to login (remembered users are auto-forwarded
  // to /app by the login screen).
  const seen = localStorage.getItem('tv_splash_seen') === '1';
  return seen ? <Navigate to="/login" replace /> : <Navigate to="/splash" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/splash" element={<Splash />} />
      <Route path="/welcome" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="savings" element={<Savings />} />
        <Route path="invest" element={<Investments />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="stash" element={<Stash />} />
        <Route path="nest" element={<Nest />} />
        <Route path="groups" element={<Groups />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="learn" element={<Learn />} />
        <Route path="referral" element={<Referral />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
