export default function EventPath() {
  return (
    <figure className="event-path">
      <svg viewBox="0 0 520 132" role="img" aria-labelledby="event-path-title event-path-description">
        <title id="event-path-title">A scheduled event path</title>
        <desc id="event-path-description">An illustrative route from the schedule point, through an event envelope, to a consumer endpoint.</desc>
        <path className="path-underlay" d="M37 67h446" />
        <path className="path-line" pathLength="1" d="M37 67h446" />
        <circle className="path-node path-node-start" cx="48" cy="67" r="13" />
        <circle className="path-orbit" cx="48" cy="67" r="23" />
        <rect className="path-node path-node-event" x="244" y="51" width="32" height="32" rx="3" />
        <path className="envelope-mark" d="m250 59 10 8 10-8m-20 1v15h20V60" />
        <path className="path-node path-node-end" d="M472 54h19v26h-19z" />
        <path className="endpoint-mark" d="M477 62h9m-9 5h9m-9 5h5" />
        <path className="path-arrow" d="m465 63 7 4-7 4" />
        <text className="path-label" x="48" y="116" textAnchor="middle">SCHEDULE</text>
        <text className="path-label" x="260" y="116" textAnchor="middle">EVENT</text>
        <text className="path-label" x="481" y="116" textAnchor="middle">CONSUMER</text>
      </svg>
      <figcaption><span className="caption-rule" />Event route / illustrative</figcaption>
    </figure>
  );
}
