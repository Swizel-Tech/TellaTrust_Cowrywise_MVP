import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Logo from './Logo';
import PinLock from './PinLock';
import { hasPin, isUnlocked } from '../lib/pin';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const [unlocked, setUnlocked] = useState(isUnlocked());

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center" style={{ background: 'radial-gradient(120% 90% at 50% 0%, #d1fae5, #ffffff)' }}>
        <div className="animate-pulse"><Logo size={56} /></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  // A PIN is optional (managed in Settings). Only gate when one is set.
  if (hasPin(user.uid) && !unlocked) return <PinLock onUnlock={() => setUnlocked(true)} />;
  return children;
}
