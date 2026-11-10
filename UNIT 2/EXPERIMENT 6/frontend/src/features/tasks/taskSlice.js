export const API_URL = 'http://localhost:8080/api/tasks';
export const PAGE_SIZE = 5;

export const VIEWS = {
  tasks: {
    label: 'Task page',
    endpoint: '/api/tasks',
    description: 'Paged task records',
  },
  comments: {
    label: 'Fetch join',
    endpoint: '/api/tasks/with-comments',
    description: 'Tasks with comments',
  },
  top: {
    label: 'Top five',
    endpoint: '/api/tasks/top',
    description: 'Top task records',
  },
};

export async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed (${response.status}).`);
  const body = await response.text();
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export async function getView(view, page) {
  if (view === 'tasks') {
    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
      sort: 'id,desc',
    });
    const data = await requestJson(`${API_URL}?${params}`);
    if (!Array.isArray(data.content) || typeof data.totalPages !== 'number') {
      throw new Error('Task service returned an invalid page.');
    }
    return { records: data.content, totalPages: data.totalPages };
  }

  const endpoint = view === 'comments' ? 'with-comments' : 'top';
  const records = await requestJson(`${API_URL}/${endpoint}`);
  if (!Array.isArray(records)) throw new Error('Task service returned an invalid record list.');
  return { records, totalPages: 1 };
}

export function getErrorMessage(error) {
  if (error instanceof Error && error.message === 'Failed to fetch') {
    return 'Task service is unavailable. Start the backend, then retry.';
  }
  return error instanceof Error ? error.message : 'Unable to load records.';
}
