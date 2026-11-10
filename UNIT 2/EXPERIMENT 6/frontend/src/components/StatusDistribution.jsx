export default function StatusDistribution({ records, completedCount, pendingCount, filter, onFilterChange, unavailable }) {
  const circumference = 2 * Math.PI * 36;
  const completedLength = records.length ? (completedCount / records.length) * circumference : 0;
  const openLength = records.length ? (pendingCount / records.length) * circumference : 0;
  const isAvailable = !unavailable;
  const visibleCount = filter === 'all'
    ? records.length
    : records.filter((task) => (filter === 'completed' ? task.completed : !task.completed)).length;

  return (
    <section className="status-distribution" aria-labelledby="status-distribution-title">
      <div className="distribution-copy">
        <p className="eyebrow"><span className="eyebrow-rule" />03 / RESPONSE COMPOSITION</p>
        <h2 id="status-distribution-title">Completion on this response</h2>
        <p className="distribution-description">
          {unavailable
            ? 'A status split appears after task records are returned.'
            : records.length
              ? `Status counts from the ${records.length} records currently returned.`
              : 'This response contains no task records to distribute.'}
        </p>
        <div className="distribution-controls" role="group" aria-label="Filter returned task records by status">
          <button type="button" className="distribution-filter" aria-pressed={filter === 'all'} disabled={!isAvailable || records.length === 0} onClick={() => onFilterChange('all')}>
            <span className="filter-mark filter-all" aria-hidden="true" />
            All <strong>{records.length}</strong>
          </button>
          <button type="button" className="distribution-filter" aria-pressed={filter === 'completed'} disabled={!isAvailable || records.length === 0} onClick={() => onFilterChange('completed')}>
            <span className="filter-mark filter-complete" aria-hidden="true" />
            Complete <strong>{completedCount}</strong>
          </button>
          <button type="button" className="distribution-filter" aria-pressed={filter === 'open'} disabled={!isAvailable || records.length === 0} onClick={() => onFilterChange('open')}>
            <span className="filter-mark filter-open" aria-hidden="true" />
            Open <strong>{pendingCount}</strong>
          </button>
        </div>
        <p className="distribution-selection" role="status">
          {unavailable
            ? 'Filtering is unavailable until a response is returned.'
            : `Showing ${filter === 'all' ? 'all ' : ''}${visibleCount} ${filter === 'all' ? 'returned' : filter} records.`}
        </p>
      </div>
      <figure className={`distribution-chart ${unavailable ? 'is-unavailable' : ''}`}>
        <svg viewBox="0 0 96 96" role="img" aria-label={unavailable ? 'Status distribution unavailable until a response is returned' : `${completedCount} complete and ${pendingCount} open of ${records.length} returned task records`}>
          <circle className="chart-track" cx="48" cy="48" r="36" />
          {isAvailable && records.length > 0 && (
            <g transform="rotate(-90 48 48)">
              <circle className={`chart-segment chart-open ${filter === 'completed' ? 'is-muted' : ''}`} cx="48" cy="48" r="36" style={{ strokeDasharray: `${openLength} ${circumference - openLength}`, strokeDashoffset: -completedLength }} />
              <circle className={`chart-segment chart-complete ${filter === 'open' ? 'is-muted' : ''}`} cx="48" cy="48" r="36" style={{ strokeDasharray: `${completedLength} ${circumference - completedLength}` }} />
            </g>
          )}
          <text className="chart-total" x="48" y="46" textAnchor="middle">{isAvailable ? records.length : '—'}</text>
          <text className="chart-caption" x="48" y="58" textAnchor="middle">RETURNED</text>
        </svg>
      </figure>
    </section>
  );
}
