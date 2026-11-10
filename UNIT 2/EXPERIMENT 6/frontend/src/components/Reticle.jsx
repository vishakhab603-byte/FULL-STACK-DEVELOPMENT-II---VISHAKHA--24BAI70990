export default function Reticle({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 3v10M24 35v10M3 24h10M35 24h10" />
      <path d="M9.2 9.2 16 16m16 16 6.8 6.8m0-29.6L32 16M16 32l-6.8 6.8" />
      <circle cx="24" cy="24" r="8" />
      <circle className="reticle-dot" cx="24" cy="24" r="2" />
    </svg>
  );
}
