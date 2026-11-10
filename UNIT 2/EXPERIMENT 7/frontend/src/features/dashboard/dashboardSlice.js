export const DASHBOARD_SUMMARY = {
  tenants: 12,
  active: 7,
  blocked: 2,
  alerts: 5,
};

export function buildSummaryMetrics(session) {
  if (!session) return DASHBOARD_SUMMARY;

  return {
    ...DASHBOARD_SUMMARY,
    active: session.role === 'ADMIN' ? 9 : 5,
    alerts: session.role === 'ADMIN' ? 3 : 6,
  };
}
