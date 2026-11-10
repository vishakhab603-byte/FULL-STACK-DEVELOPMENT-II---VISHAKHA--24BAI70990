import { STAGES } from '../features/release/canarySlice';

export default function TopologyFigure({ canaryWeight = null }) {
  return (
    <figure className="topology-figure">
      <svg className="topology-svg" viewBox="0 0 1100 210" role="img" aria-labelledby="topology-title topology-description">
        <title id="topology-title">Illustrative six-station release workflow</title>
        <desc id="topology-description">A reference sequence connecting source change, CI trigger, compile, verify, package, and canary routing. These stations are not live workflow status.</desc>
        <path className="rail rail-main" d="M92 79H275H458H641H824H1007" />
        <path className="rail rail-secondary" d="M92 91H275H458H641H824H1007" />
        <path className="branch-line" d="M641 85V151H824V85" />
        <path className="branch-line branch-amber" d="M824 85V151H1007V85" />
        {STAGES.map((stage, index) => {
          const x = 92 + index * 183;
          return (
            <g className={`station ${index === 5 ? 'station-canary' : ''}`} key={stage.title}>
              <rect x={x - 10} y="75" width="20" height="20" />
              <text className="station-number" x={x} y="45" textAnchor="middle">{String(index + 1).padStart(2, '0')}</text>
              <text className="station-name" x={x} y="123" textAnchor="middle">{stage.title}</text>
              <text className="station-detail" x={x} y="144" textAnchor="middle">{stage.detail}</text>
            </g>
          );
        })}
        <text className="route-label" x="694" y="174">VERIFY / PACKAGE BRANCH</text>
        {canaryWeight !== null && <text className="canary-config-label" x="1007" y="29" textAnchor="middle">CONFIG {canaryWeight}%</text>}
      </svg>
      <ol className="mobile-stations" aria-label="Reference stages in sequence">
        {STAGES.map((stage, index) => (
          <li key={stage.title}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{stage.title}</strong><small>{stage.detail}</small></div></li>
        ))}
      </ol>
      <figcaption><span>REFERENCE ONLY</span> An illustrative sequence, not a live workflow run. No deployment-job status endpoint is connected.</figcaption>
    </figure>
  );
}
