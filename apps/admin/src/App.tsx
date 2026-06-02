import { Routes, Route, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import Layout from './components/Layout';
import { useStore } from './lib/store';
import { canAccess } from './lib/rbac';
import { Card } from './components/ui';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Kyc from './pages/Kyc';
import Transactions from './pages/Transactions';
import Products from './pages/Products';
import Support from './pages/Support';
import ActivityLogs from './pages/ActivityLogs';

function Guard({ children }: { children: ReactNode }) {
  const { role } = useStore();
  const { pathname } = useLocation();
  if (!canAccess(role, pathname)) {
    return (
      <Card className="p-10 text-center">
        <div className="text-3xl">🔒</div>
        <h2 className="mt-3 text-lg font-bold">Access restricted</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-forest-deep/60">
          Your current role doesn’t have permission to view this section. Switch roles using the selector in the top-right to
          see RBAC in action.
        </p>
      </Card>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Guard><Dashboard /></Guard>} />
        <Route path="users" element={<Guard><Users /></Guard>} />
        <Route path="users/:id" element={<Guard><UserDetail /></Guard>} />
        <Route path="kyc" element={<Guard><Kyc /></Guard>} />
        <Route path="transactions" element={<Guard><Transactions /></Guard>} />
        <Route path="products" element={<Guard><Products /></Guard>} />
        <Route path="support" element={<Guard><Support /></Guard>} />
        <Route path="logs" element={<Guard><ActivityLogs /></Guard>} />
        <Route path="*" element={<Card className="p-10 text-center text-forest-deep/60">Page not found.</Card>} />
      </Route>
    </Routes>
  );
}
