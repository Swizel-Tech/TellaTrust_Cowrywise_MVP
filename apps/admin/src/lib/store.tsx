import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Role, UserProfile, InvestmentProduct, KycStatus } from '@tellavault/shared';
import {
  users as seedUsers,
  products as seedProducts,
  tickets as seedTickets,
  activityLogs as seedLogs,
  transactions,
  type SupportTicket,
  type ActivityLog,
  type LogCategory,
} from './mock';

interface Store {
  role: Role;
  setRole: (r: Role) => void;
  users: UserProfile[];
  products: InvestmentProduct[];
  tickets: SupportTicket[];
  logs: ActivityLog[];
  decideKyc: (uid: string, status: Extract<KycStatus, 'verified' | 'rejected'>) => void;
  toggleFreeze: (uid: string) => void;
  toggleProduct: (id: string) => void;
  replyTicket: (id: string, body: string) => void;
  setTicketStatus: (id: string, status: SupportTicket['status']) => void;
}

const Ctx = createContext<Store | null>(null);

function makeLog(actorRole: Role, category: LogCategory, action: string, target: string): ActivityLog {
  return {
    id: `lg_${Math.random().toString(36).slice(2, 9)}`,
    at: Date.now(),
    actor: 'you@tellatrust.io',
    actorRole,
    category,
    action,
    target,
    ip: '102.89.0.1',
    city: 'Lagos',
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('super_admin');
  const [users, setUsers] = useState<UserProfile[]>(seedUsers);
  const [products, setProducts] = useState<InvestmentProduct[]>(seedProducts);
  const [tickets, setTickets] = useState<SupportTicket[]>(seedTickets);
  const [logs, setLogs] = useState<ActivityLog[]>(seedLogs);

  const pushLog = (category: LogCategory, action: string, target: string) =>
    setLogs((prev) => [makeLog(role, category, action, target), ...prev]);

  const value = useMemo<Store>(
    () => ({
      role,
      setRole,
      users,
      products,
      tickets,
      logs,
      decideKyc: (uid, status) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.uid === uid ? { ...u, kycStatus: status, kycVerifiedAt: status === 'verified' ? Date.now() : undefined } : u,
          ),
        );
        pushLog('kyc', status === 'verified' ? 'KYC approved' : 'KYC rejected', uid);
      },
      toggleFreeze: (uid) => {
        setUsers((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, status: u.status === 'active' ? 'frozen' : 'active' } : u)),
        );
        const u = users.find((x) => x.uid === uid);
        pushLog('account', u?.status === 'active' ? 'Account frozen' : 'Account unfrozen', uid);
      },
      toggleProduct: (id) => {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
        const p = products.find((x) => x.id === id);
        pushLog('product', p?.isActive ? 'Product disabled' : 'Product enabled', id);
      },
      replyTicket: (id, body) => {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, status: 'pending', messages: [...t.messages, { from: 'agent', body, at: Date.now() }] }
              : t,
          ),
        );
        pushLog('admin', 'Replied to ticket', id);
      },
      setTicketStatus: (id, status) => {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
        pushLog('admin', `Ticket marked ${status}`, id);
      },
    }),
    [role, users, products, tickets, logs],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}

export { transactions };
