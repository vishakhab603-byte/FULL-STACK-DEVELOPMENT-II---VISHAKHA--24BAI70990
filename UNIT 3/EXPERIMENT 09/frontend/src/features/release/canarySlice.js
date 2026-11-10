export const API_BASE = 'http://localhost:8080';
export const STAGES = [
  { title: 'Source change', detail: 'Commit / push' },
  { title: 'CI trigger', detail: 'Workflow entry' },
  { title: 'Compile', detail: 'Build artifacts' },
  { title: 'Verify', detail: 'Unit + API contracts' },
  { title: 'Package', detail: 'Container image' },
  { title: 'Route', detail: 'Canary traffic' },
];

export async function requestJson(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const body = await response.text();
  let data = null;
  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }
  if (!response.ok) {
    const detail = typeof data === 'string' ? data : data?.message;
    throw new Error(detail || `Request failed (${response.status} ${response.statusText})`);
  }
  return data;
}
