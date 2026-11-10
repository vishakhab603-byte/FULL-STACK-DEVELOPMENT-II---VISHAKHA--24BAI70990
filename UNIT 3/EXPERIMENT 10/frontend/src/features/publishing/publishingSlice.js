export const API_ROOT = '/api';
export const CHANNELS = ['Instagram', 'LinkedIn', 'X', 'Facebook'];

export function localDateTimeValue(time) {
  const localTime = time - new Date(time).getTimezoneOffset() * 60000;
  return new Date(localTime).toISOString().slice(0, 16);
}

export function addPostTimestamps(posts) {
  return posts.map((post) => ({
    ...post,
    scheduledAtTimestamp: Date.parse(post.scheduledAt),
    publishedAtTimestamp: post.publishedAt ? Date.parse(post.publishedAt) : Number.NaN,
  }));
}

export async function requestJson(path, options) {
  const response = await fetch(path, options);
  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.detail ?? payload?.message ?? `Request failed (${response.status}).`);
  }

  return payload;
}

export function messageFrom(error) {
  if (!(error instanceof Error)) return 'The publishing request failed.';
  if (error.message === 'Failed to fetch') return 'The publishing service is offline. Start the backend and retry.';
  if (/^Request failed \(5\d\d\)\.$/.test(error.message)) return 'The publishing service returned a server error. Check the backend and retry.';
  return error.message;
}
