export default function StatusMark({ status }) {
  const normalized = String(status || '').toUpperCase();

  if (normalized === 'PUBLISHED') {
    return (
      <svg className="status-mark is-published" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  if (normalized === 'FAILED') {
    return (
      <svg className="status-mark is-failed" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 2 10 10-10 10L2 12z" />
        <path d="M12 7v6m0 3v.1" />
      </svg>
    );
  }

  if (normalized === 'PENDING') {
    return (
      <svg className="status-mark is-pending" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle className="pending-core" cx="12" cy="12" r="2" />
      </svg>
    );
  }

  return (
    <svg className="status-mark is-other" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}
