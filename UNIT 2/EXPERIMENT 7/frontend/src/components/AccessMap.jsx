import { useState } from 'react';

const accessPoints = [
  { key: 'tasks:read', label: 'Read tasks', method: 'GET', endpoint: '/api/tasks', position: [92, 54] },
  { key: 'tasks:create', label: 'Create tasks', method: 'POST', endpoint: '/api/tasks', position: [548, 54] },
  { key: 'tasks:update', label: 'Update tasks', method: 'PUT', endpoint: '/api/tasks/{id}/toggle', position: [92, 166] },
  { key: 'tasks:delete', label: 'Delete tasks', method: 'DELETE', endpoint: '/api/tasks/{id}', position: [548, 166] },
];

const connectors = [
  { start: [118, 62], end: [281, 100] },
  { start: [522, 62], end: [359, 100] },
  { start: [118, 158], end: [281, 120] },
  { start: [522, 158], end: [359, 120] },
];

function initialsFor(username = '') {
  return username
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function AccessMap({ user }) {
  const [selectedKey, setSelectedKey] = useState(accessPoints[0].key);
  const hasPermissionData = Array.isArray(user.permissions);
  const selectedPoint = accessPoints.find((point) => point.key === selectedKey);
  const selectedGranted = hasPermissionData && user.permissions.includes(selectedKey);

  function statusFor(key) {
    if (!hasPermissionData) return 'unavailable';
    return user.permissions.includes(key) ? 'granted' : 'not-granted';
  }

  function statusText(status) {
    if (status === 'granted') return 'Granted';
    if (status === 'not-granted') return 'Not granted';
    return 'Unavailable';
  }

  return (
    <section className="access-map" aria-labelledby="access-map-title">
      <header className="access-map-heading">
        <div>
          <p className="eyebrow">SESSION PERMISSIONS</p>
          <h2 id="access-map-title">Session access map</h2>
        </div>
        <p className="access-map-identity">
          {user.username} <span aria-hidden="true">/</span> {user.role}
        </p>
      </header>

      <svg
        className="access-map-visual"
        viewBox="0 0 640 220"
        role="img"
        aria-labelledby="access-svg-title access-svg-description"
      >
        <title id="access-svg-title">Authenticated session and task permission map</title>
        <desc id="access-svg-description">
          The current account is connected to four task actions. The controls below describe each permission from the authentication response.
        </desc>
        {connectors.map(({ start, end }, index) => {
          const point = accessPoints[index];
          const status = statusFor(point.key);
          return (
            <line
              key={point.key}
              className={`access-map-connector ${status} ${selectedKey === point.key ? 'selected' : ''}`}
              x1={start[0]}
              y1={start[1]}
              x2={end[0]}
              y2={end[1]}
            />
          );
        })}
        <circle className="access-map-halo" cx="320" cy="110" r="52" />
        <circle className="access-map-hub" cx="320" cy="110" r="39" />
        <text className="access-map-initials" x="320" y="115" textAnchor="middle">
          {initialsFor(user.username) || '•'}
        </text>
        {accessPoints.map((point) => {
          const status = statusFor(point.key);
          const [x, y] = point.position;
          return (
            <g key={point.key} className={`access-map-node ${status} ${selectedKey === point.key ? 'selected' : ''}`}>
              {selectedKey === point.key && <circle className="access-map-node-selection" cx={x} cy={y} r="29" />}
              <circle className="access-map-node-ring" cx={x} cy={y} r="22" />
              {status === 'granted' && <circle className="access-map-node-mark" cx={x} cy={y} r="6" />}
              {status === 'not-granted' && <path className="access-map-node-mark" d={`M${x - 6} ${y}h12`} />}
              {status === 'unavailable' && <circle className="access-map-node-mark unavailable" cx={x} cy={y} r="6" />}
            </g>
          );
        })}
      </svg>

      <div className="access-map-controls" role="group" aria-label="Select a task permission to inspect">
        {accessPoints.map((point) => {
          const status = statusFor(point.key);
          return (
            <button
              key={point.key}
              type="button"
              className={`access-map-control ${selectedKey === point.key ? 'selected' : ''}`}
              onClick={() => setSelectedKey(point.key)}
              aria-pressed={selectedKey === point.key}
            >
              <span>{point.label}</span>
              <span className={`access-map-state ${status}`}>{statusText(status)}</span>
            </button>
          );
        })}
      </div>

      <p className="access-map-detail" aria-live="polite" aria-atomic="true">
        {hasPermissionData
          ? `${selectedPoint.label} is ${selectedGranted ? 'granted' : 'not granted'} by the backend response (${selectedPoint.key}; ${selectedPoint.method} ${selectedPoint.endpoint}).`
          : `Permission details are unavailable in this session response. No access is inferred from ${user.role || 'the role'} (${selectedPoint.key}; ${selectedPoint.method} ${selectedPoint.endpoint}).`}
      </p>
      <p className="access-map-source">Source: authenticated session response · permissions</p>
    </section>
  );
}
