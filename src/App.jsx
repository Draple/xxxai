import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import SkipLink from './components/SkipLink';
import ConnectFromPhone from './components/ConnectFromPhone';
import Landing from './pages/Landing';

const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreaTuVideo = lazy(() => import('./pages/CreaTuVideo'));
const Feed = lazy(() => import('./pages/Feed'));
const Match = lazy(() => import('./pages/Match'));
const Descubre = lazy(() => import('./pages/Descubre'));
const Chat = lazy(() => import('./pages/Chat'));
const MisVideos = lazy(() => import('./pages/MisVideos'));
const MisImagenes = lazy(() => import('./pages/CreaTuAI'));
const TusAI = lazy(() => import('./pages/TusAI'));
const Configuracion = lazy(() => import('./pages/Configuracion'));
const Legal = lazy(() => import('./pages/Legal'));
const Privacidad = lazy(() => import('./pages/Privacidad'));
const Terminos = lazy(() => import('./pages/Terminos'));

function PageFallback() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-onix-bg">
      <div className="animate-pulse text-onix-muted">{t('loading')}</div>
    </div>
  );
}

function Protected({ children, requireOnboarding = false, requireCredits = false }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const from = location.pathname + location.search;
  const fromState = location.state;
  const redirectState = { from, ...(fromState && Object.keys(fromState).length > 0 ? { fromState } : {}) };
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-onix-bg"><div className="animate-pulse text-onix-muted">{t('loading')}</div></div>;
  if (!user) return <Navigate to="/login" state={redirectState} replace />;
  if (requireOnboarding && !user.onboarding_completed) return <Navigate to="/onboarding" state={redirectState} replace />;
  if (requireCredits && (user.balance ?? 0) <= 0) return <Navigate to="/checkout" state={redirectState} replace />;
  return children;
}

function ChatWithKey() {
  const location = useLocation();
  return <Chat key={location.pathname} />;
}

function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-onix-bg"><div className="animate-pulse text-onix-muted">{t('loading')}</div></div>;
  if (user && user.onboarding_completed && (user.balance ?? 0) > 0) return <Navigate to="/dashboard" replace />;
  if (user && user.onboarding_completed) return <Navigate to="/checkout" replace />;
  if (user) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <SkipLink />
      <ConnectFromPhone />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />
          <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
          <Route path="/checkout" element={<Protected requireOnboarding><Checkout /></Protected>} />
          <Route path="/dashboard" element={<Protected requireOnboarding requireCredits><Dashboard /></Protected>} />
          <Route path="/feed" element={<Protected requireOnboarding requireCredits><Feed /></Protected>} />
          <Route path="/match" element={<Protected requireOnboarding requireCredits><Match /></Protected>} />
          <Route path="/crea-tu-video" element={<Protected requireOnboarding requireCredits><CreaTuVideo /></Protected>} />
          <Route path="/descubre" element={<Protected requireOnboarding requireCredits><Descubre /></Protected>} />
          <Route path="/chat" element={<Protected requireOnboarding requireCredits><ChatWithKey /></Protected>} />
          <Route path="/mis-videos" element={<Protected requireOnboarding requireCredits><MisVideos /></Protected>} />
          <Route path="/mis-imagenes" element={<Protected requireOnboarding requireCredits><MisImagenes /></Protected>} />
          <Route path="/tus-ai" element={<Protected requireOnboarding requireCredits><TusAI /></Protected>} />
          <Route path="/opciones" element={<Navigate to="/configuracion" replace />} />
          <Route path="/configuracion" element={<Protected requireOnboarding requireCredits><Configuracion /></Protected>} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
