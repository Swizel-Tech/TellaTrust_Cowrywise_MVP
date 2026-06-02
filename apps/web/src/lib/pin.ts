// Simulated 4-digit PIN, stored per-user in localStorage (prototype only).
const key = (uid: string) => `tt_pin_${uid}`;

export function hasPin(uid: string): boolean {
  return !!localStorage.getItem(key(uid));
}
export function setPin(uid: string, pin: string) {
  localStorage.setItem(key(uid), btoa(pin));
}
export function verifyPin(uid: string, pin: string): boolean {
  return localStorage.getItem(key(uid)) === btoa(pin);
}
export function clearPin(uid: string) {
  localStorage.removeItem(key(uid));
}

// Per-session unlock flag.
export const unlockSession = () => sessionStorage.setItem('tt_unlocked', '1');
export const isUnlocked = () => sessionStorage.getItem('tt_unlocked') === '1';
export const relock = () => sessionStorage.removeItem('tt_unlocked');

/**
 * "Remember me" credential — PROTOTYPE ONLY. Lets the user unlock with a PIN
 * after logging out, by re-using the stored credential. Never do this in production.
 */
export interface Remembered { email: string; pw: string; uid?: string; name?: string; }
const REM = 'tt_remembered';

export function remember(email: string, pw: string) {
  localStorage.setItem(REM, btoa(JSON.stringify({ email, pw })));
}
export function setRememberedMeta(uid: string, name: string) {
  const r = getRemembered();
  if (r) { r.uid = uid; r.name = name; localStorage.setItem(REM, btoa(JSON.stringify(r))); }
}
export function getRemembered(): Remembered | null {
  const v = localStorage.getItem(REM);
  if (!v) return null;
  try { return JSON.parse(atob(v)) as Remembered; } catch { return null; }
}
export function forgetRemembered() {
  localStorage.removeItem(REM);
}
