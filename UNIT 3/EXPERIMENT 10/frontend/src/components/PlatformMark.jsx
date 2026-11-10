export default function PlatformMark({ platform }) {
  return <span className={`platform-mark platform-${platform.toLowerCase()}`} aria-hidden="true">{platform.slice(0, 1)}</span>;
}
