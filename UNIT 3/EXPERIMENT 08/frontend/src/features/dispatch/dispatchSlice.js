export const API_URL = 'http://localhost:8080/api/posts';

export function formatTime(value) {
  if (!value) return 'Time not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}

export function getPostKey(post, index) {
  return post.id == null ? `missing-${index}` : String(post.id);
}

export function formatAxisTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function normalizeStatus(status) {
  return String(status || '').toUpperCase();
}
