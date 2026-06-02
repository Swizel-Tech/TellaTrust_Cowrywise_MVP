import type { Role } from '@tellavault/shared';

export const ROLE_LABELS: Record<Role, string> = {
  customer: 'Customer',
  support: 'Support agent',
  finance: 'Finance',
  compliance: 'Compliance',
  admin: 'Admin',
  super_admin: 'Super admin',
};

// Roles that can sign into the admin console (customer cannot).
export const ADMIN_ROLES: Role[] = ['support', 'finance', 'compliance', 'admin', 'super_admin'];

export interface NavItem {
  path: string;
  label: string;
  icon: string; // single-letter / emoji-free glyph drawn as svg in Layout
  roles: Role[];
}

export const NAV: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: 'grid', roles: ['support', 'finance', 'compliance', 'admin', 'super_admin'] },
  { path: '/users', label: 'Users', icon: 'users', roles: ['support', 'compliance', 'admin', 'super_admin'] },
  { path: '/kyc', label: 'KYC review', icon: 'shield', roles: ['compliance', 'admin', 'super_admin'] },
  { path: '/transactions', label: 'Transactions', icon: 'swap', roles: ['finance', 'admin', 'super_admin'] },
  { path: '/products', label: 'Products', icon: 'box', roles: ['admin', 'super_admin'] },
  { path: '/support', label: 'Support inbox', icon: 'chat', roles: ['support', 'admin', 'super_admin'] },
  { path: '/logs', label: 'Activity logs', icon: 'list', roles: ['support', 'finance', 'compliance', 'admin', 'super_admin'] },
];

export function navFor(role: Role): NavItem[] {
  return NAV.filter((n) => n.roles.includes(role));
}

export function canAccess(role: Role, path: string): boolean {
  // Longest-prefix match against nav definitions (handles /users/:id).
  const match = NAV.filter((n) => path === n.path || (n.path !== '/' && path.startsWith(n.path)))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match ? match.roles.includes(role) : false;
}

// Fine-grained capabilities used inside screens.
export type Capability = 'kyc.decide' | 'user.freeze' | 'product.toggle' | 'ticket.reply' | 'logs.export';

const CAPS: Record<Capability, Role[]> = {
  'kyc.decide': ['compliance', 'admin', 'super_admin'],
  'user.freeze': ['compliance', 'admin', 'super_admin'],
  'product.toggle': ['admin', 'super_admin'],
  'ticket.reply': ['support', 'admin', 'super_admin'],
  'logs.export': ['finance', 'compliance', 'admin', 'super_admin'],
};

export function can(role: Role, cap: Capability): boolean {
  return CAPS[cap].includes(role);
}
