export const DEFAULT_SESSION = {
  user: 'demo@studio.local',
  role: 'ADMIN',
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
};

export function createSessionFromCredentials({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required to sign in.');
  }

  return {
    ...DEFAULT_SESSION,
    user: email,
    role: email.includes('admin') ? 'ADMIN' : 'USER',
    accessToken: `token-${Date.now()}`,
    refreshToken: `refresh-${Date.now()}`,
  };
}

export function normalizePermission(role) {
  if (role === 'ADMIN') return 'all';
  if (role === 'EDITOR') return 'edit';
  return 'view';
}
