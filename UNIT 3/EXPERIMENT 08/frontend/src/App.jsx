import { useCallback, useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:8080/api/posts';

function formatTime(value) {
  if (!value) return 'Time not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
}

function getPostKey(post, index) {
  return post.id == null ? `missing-${index}` : String(post.id);
}

function formatAxisTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function EventPath() {
  return (
    <figure className="event-path">
      <svg viewBox="0 0 520 132" role="img" aria-labelledby="event-path-title event-path-description">
        <title id="event-path-title">A scheduled event path</title>
        <desc id="event-path-description">
          An illustrative route from the schedule point, through an event envelope, to a consumer endpoint.
        </desc>
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

function StatusMark({ status }) {
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

function QueueTimeline({ posts, selectedPostKey, onSelectPost, loading, error }) {
  const plottedPosts = posts
    .map((post, index) => ({
      post,
      index,
      key: getPostKey(post, index),
      timestamp: post.scheduledTime == null || post.scheduledTime === ''
        ? Number.NaN
        : new Date(post.scheduledTime).getTime(),
    }))
    .filter((entry) => Number.isFinite(entry.timestamp));
  const selectedPost = posts.find((post, index) => getPostKey(post, index) === selectedPostKey) || posts[0];
  const selectedIndex = posts.indexOf(selectedPost);
  const timestamps = plottedPosts.map((entry) => entry.timestamp);
  const earliest = timestamps.reduce((minimum, timestamp) => Math.min(minimum, timestamp), Number.POSITIVE_INFINITY);
  const latest = timestamps.reduce((maximum, timestamp) => Math.max(maximum, timestamp), Number.NEGATIVE_INFINITY);
  const rowTop = 90;
  const rowHeight = 42;
  const chartHeight = rowTop + plottedPosts.length * rowHeight + 16;
  const plotStart = 174;
  const plotEnd = 548;
  const rowX = (timestamp) => (
    earliest === latest
      ? (plotStart + plotEnd) / 2
      : plotStart + ((timestamp - earliest) / (latest - earliest)) * (plotEnd - plotStart)
  );
  const selectFromKeyboard = (event, post) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectPost(post);
    }
  };

  return (
    <section className="queue-timeline" aria-labelledby="timeline-title">
      <div className="timeline-heading">
        <div>
          <span className="section-index">LIVE VIEW <span>/</span> API RECORDS</span>
          <h3 id="timeline-title">Schedule timeline</h3>
        </div>
        <span className="timeline-refresh-note">API refresh · 3 sec</span>
      </div>
      {loading ? (
        <p className="timeline-message" role="status">Waiting for the first post records from the API…</p>
      ) : posts.length === 0 ? (
        <p className="timeline-message" role={error ? 'alert' : 'status'}>
          {error
            ? 'Timeline unavailable. No schedule or status is inferred while the API is unreachable.'
            : 'No post records have been returned by the API yet.'}
        </p>
      ) : (
        <>
          {error && (
            <p className="timeline-stale" role="status">
              Refresh failed; showing the last successful API response.
            </p>
          )}
          {plottedPosts.length > 0 ? (
            <div className="timeline-scroll" role="region" aria-label="Scrollable schedule timeline" tabIndex="0">
              <svg
                className="timeline-chart"
                viewBox={`0 0 720 ${chartHeight}`}
                role="group"
                aria-labelledby="timeline-chart-title timeline-chart-description"
              >
                <title id="timeline-chart-title">Scheduled posts and statuses returned by the API</title>
                <desc id="timeline-chart-description">
                  Each selectable row is an API post record. Its position uses its returned scheduled time;
                  its label uses its returned status. This view does not show unreported delivery events.
                </desc>
                <text className="timeline-column-label" x="14" y="24">DISPATCH</text>
                <text className="timeline-column-label" x={plotStart} y="24">SCHEDULED TIME</text>
                <text className="timeline-column-label" x="580" y="24">API STATUS</text>
                <line className="timeline-axis" x1={plotStart} y1="45" x2={plotEnd} y2="45" />
                {[plotStart, (plotStart + plotEnd) / 2, plotEnd].map((x) => (
                  <line key={x} className="timeline-grid" x1={x} y1="45" x2={x} y2={chartHeight - 8} />
                ))}
                <text className="timeline-time-label" x={plotStart} y="39" textAnchor="start">
                  {formatAxisTime(earliest)}
                </text>
                <text className="timeline-time-label" x={plotEnd} y="39" textAnchor="end">
                  {earliest === latest ? 'one scheduled time' : formatAxisTime(latest)}
                </text>
                {plottedPosts.map(({ post, key, timestamp }, index) => {
                  const y = rowTop + index * rowHeight;
                  const status = post.status == null ? 'Status not provided' : String(post.status);
                  const normalizedStatus = status.toUpperCase();
                  const markerType = normalizedStatus === 'PUBLISHED'
                    ? 'published'
                    : normalizedStatus === 'PENDING'
                      ? 'pending'
                      : normalizedStatus === 'FAILED'
                        ? 'failed'
                        : normalizedStatus === 'PUBLISHING'
                          ? 'publishing'
                          : 'other';
                  const isSelected = key === selectedPostKey || (!selectedPostKey && post === selectedPost);
                  const idLabel = post.id == null ? 'ID not provided' : `DISPATCH / ${post.id}`;

                  return (
                    <g key={key}>
                      <rect
                        className={`timeline-row${isSelected ? ' is-selected' : ''}`}
                        x="8"
                        y={y - 17}
                        width="704"
                        height="34"
                      />
                      <text className="timeline-dispatch-label" x="14" y={y + 3}>
                        {idLabel.length > 20 ? `${idLabel.slice(0, 17)}…` : idLabel}
                      </text>
                      <g
                        className={`timeline-post-point status-${markerType}${isSelected ? ' is-selected' : ''}`}
                        transform={`translate(${rowX(timestamp)} ${y})`}
                        role="button"
                        tabIndex="0"
                        aria-label={`Select ${idLabel}, status ${status}, scheduled ${formatTime(post.scheduledTime)}`}
                        aria-pressed={isSelected}
                        onClick={() => onSelectPost(post)}
                        onKeyDown={(event) => selectFromKeyboard(event, post)}
                      >
                        <rect className="timeline-marker-hit" x="-13" y="-13" width="26" height="26" rx="4" />
                        {markerType === 'published' && (
                          <>
                            <circle className="timeline-marker" r="7" />
                            <path className="timeline-marker-check" d="m-3 0 2 2 4-5" />
                          </>
                        )}
                        {markerType === 'pending' && (
                          <>
                            <circle className="timeline-marker" r="7" />
                            <circle className="timeline-marker-core" r="2" />
                          </>
                        )}
                        {(markerType === 'failed' || markerType === 'publishing') && (
                          <path className="timeline-marker" d="m0-8 8 8-8 8-8-8z" />
                        )}
                        {markerType === 'other' && (
                          <rect className="timeline-marker" x="-6.5" y="-6.5" width="13" height="13" rx="1" />
                        )}
                      </g>
                      <text className={`timeline-status status-${markerType}`} x="580" y={y + 3}>
                        {status.length > 17 ? `${status.slice(0, 14)}…` : status}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <p className="timeline-message">
              The API returned posts, but none has a valid scheduled time to place on this timeline.
            </p>
          )}
          {plottedPosts.length < posts.length && (
            <p className="timeline-footnote">
              {posts.length - plottedPosts.length} returned {posts.length - plottedPosts.length === 1 ? 'record has' : 'records have'}
              {' '}no valid scheduled time and are not plotted.
            </p>
          )}
          {selectedPost && (
            <div className="timeline-selection" aria-live="polite">
              <span className="timeline-selection-label">
                SELECTED / {selectedPost.id == null ? 'ID NOT PROVIDED' : `DISPATCH ${selectedPost.id}`}
              </span>
              <span className={`timeline-selection-status status-${String(selectedPost.status || '').toLowerCase().replace(/[^a-z0-9-]/g, '-')}`}>
                {selectedPost.status == null ? 'Status not provided' : String(selectedPost.status)}
              </span>
              <p>{selectedPost.content ?? 'Content not provided'}</p>
              <span className="timeline-selection-time">{formatTime(selectedPost.scheduledTime)}</span>
              {Number.isFinite(selectedPost.attempts) && (
                <span className="timeline-selection-attempts">Attempts: {selectedPost.attempts}</span>
              )}
              <span className="sr-only">Use the “Show on timeline” buttons in the event ledger as a keyboard-accessible alternative.</span>
            </div>
          )}
        </>
      )}
      {selectedIndex >= 0 && <span className="sr-only">Selected record {selectedIndex + 1} of {posts.length}.</span>}
    </section>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPostKey, setSelectedPostKey] = useState(null);
  const [content, setContent] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [scheduleMessage, setScheduleMessage] = useState('');

  const fetchPosts = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Publishing API returned ${response.status}.`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Publishing API returned an invalid post list.');
      setPosts(data.slice().sort((first, second) => (
        new Date(first.scheduledTime).getTime() - new Date(second.scheduledTime).getTime()
      )));
      setError('');
    } catch (requestError) {
      setError(requestError.message === 'Failed to fetch'
        ? 'Could not reach the publishing API. Start the backend and retry.'
        : requestError.message);
    } finally {
      setLoading(false);
      if (showRefreshState) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialRequest = window.setTimeout(() => fetchPosts(), 0);
    const interval = setInterval(() => fetchPosts(), 3000);
    return () => {
      window.clearTimeout(initialRequest);
      clearInterval(interval);
    };
  }, [fetchPosts]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const messageField = event.currentTarget.elements.namedItem('post-content');
    messageField.setCustomValidity(content.trim() ? '' : 'Enter a message that is not only spaces.');
    if (!event.currentTarget.reportValidity() || !scheduleTime) return;

    setSaving(true);
    setSubmissionError('');
    setScheduleMessage('');
    try {
      const response = await fetch(`${API_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          scheduledTime: scheduleTime,
        }),
      });
      if (!response.ok) throw new Error(`Unable to schedule post (${response.status}).`);
      setContent('');
      setScheduleTime('');
      setSubmissionError('');
      setScheduleMessage('Schedule accepted by the API. Waiting for the event ledger to update.');
      await fetchPosts();
    } catch (requestError) {
      setSubmissionError(requestError.message === 'Failed to fetch'
        ? 'Could not reach the publishing API. Start the backend and retry.'
        : requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lab-shell">
      <header className="masthead">
        <a className="brand" href="#top" aria-label="Dispatch laboratory home">
          <svg className="brand-pin" viewBox="0 0 44 52" aria-hidden="true">
            <path d="M22 48S5 30 5 19a17 17 0 1 1 34 0c0 11-17 29-17 29Z" />
            <circle cx="22" cy="19" r="7" />
            <circle className="brand-orbit" cx="22" cy="19" r="11" />
          </svg>
          <span>dispatch<span className="brand-period">.</span></span>
        </a>
        <div className="edition-label">
          <span>Experiment 08</span>
          <span className="edition-divider" />
          <span>Creative dispatch laboratory</span>
        </div>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow"><span className="eyebrow-dot" />A quieter way to queue</p>
            <h1 id="page-title">Give your next<br /><em>good idea</em> a time.</h1>
            <p className="intro-description">
              Compose a post, choose its moment, and follow its real journey through the dispatch queue.
            </p>
          </div>
          <div className="intro-note" aria-label="A note about this workspace">
            <span className="note-index">FIELD NOTE&nbsp; 01</span>
            <p>Every dispatch begins<br />with a deliberate send.</p>
            <span className="note-signature">— the lab</span>
          </div>
        </section>

        <div className="workbench">
          <section className="compose-sheet" aria-labelledby="compose-title">
            <div className="sheet-heading">
              <span className="section-index">01 <span>/</span> COMPOSE</span>
              <span className="sheet-stamp">NEW DISPATCH</span>
            </div>

            <div className="compose-intro">
              <h2 id="compose-title">Put an idea<br />on the clock.</h2>
              <p>A note to your future audience, set to arrive right on time.</p>
            </div>

            <form className="post-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="post-content">Your message <span>01</span></label>
                <textarea
                  id="post-content"
                  name="post-content"
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
                    setSubmissionError('');
                    setScheduleMessage('');
                  }}
                  placeholder="What would you like to share?"
                  rows="5"
                  required
                />
              </div>
              <div className="form-group time-group">
                <label htmlFor="schedule-time">Send it on <span>02</span></label>
                <input
                  id="schedule-time"
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(event) => {
                    setScheduleTime(event.target.value);
                    setSubmissionError('');
                    setScheduleMessage('');
                  }}
                  required
                />
                <span className="field-note">Your local time</span>
              </div>
              <button type="submit" className="submit-btn" disabled={saving}>
                <span>{saving ? 'Scheduling dispatch…' : 'Schedule dispatch'}</span>
                {!saving && <span className="button-arrow" aria-hidden="true">↗</span>}
              </button>
              <p
                className={`form-feedback${submissionError ? ' has-error' : ''}`}
                aria-live="polite"
                role={submissionError ? 'alert' : undefined}
              >
                {submissionError || scheduleMessage}
              </p>
            </form>

            <EventPath />
            <div className="sheet-footer">
              <span>COMPOSE → DISPATCH</span>
              <span>Handle each idea with care.</span>
            </div>
          </section>

          <section className="ledger" aria-labelledby="ledger-title">
            <div className="ledger-heading">
              <div>
                <span className="section-index">02 <span>/</span> EVENT LEDGER</span>
                <h2 id="ledger-title">Dispatches<span className="heading-period">.</span></h2>
                <p>Chronological record from the publishing API.</p>
              </div>
              <button
                type="button"
                className="refresh-btn"
                onClick={() => fetchPosts(true)}
                disabled={refreshing}
                aria-label={refreshing ? 'Refreshing event ledger' : 'Refresh event ledger'}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M16.5 8A6.7 6.7 0 0 0 4 5.5L2.5 7m0 0V3.5M2.5 7H6m-2.5 5A6.7 6.7 0 0 0 16 14.5l1.5-1.5m0 0v3.5m0-3.5H14" />
                </svg>
                <span>{refreshing ? 'Checking' : 'Refresh'}</span>
              </button>
            </div>

            {error && (
              <div className="service-error" role="alert">
                <div className="error-mark" aria-hidden="true">!</div>
                <div className="error-copy">
                  <strong>Couldn’t load the ledger</strong>
                  <span>{error}</span>
                </div>
                <button type="button" onClick={() => fetchPosts(true)} disabled={refreshing}>
                  Retry
                </button>
              </div>
            )}

            <QueueTimeline
              posts={posts}
              selectedPostKey={selectedPostKey}
              onSelectPost={(post) => {
                const index = posts.indexOf(post);
                setSelectedPostKey(getPostKey(post, index));
              }}
              loading={loading}
              error={error}
            />

            <div className="ledger-body" aria-busy={loading}>
              {loading ? (
                <div className="ledger-message" role="status" aria-live="polite">
                  <span className="loading-mark" aria-hidden="true" />
                  <p>Loading dispatches from the publishing API…</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="ledger-empty">
                  <svg viewBox="0 0 64 64" aria-hidden="true">
                    <path d="M13 18h38v31H13zM20 12h24v6M20 27h24M20 34h17M20 41h12" />
                    <circle cx="48" cy="45" r="9" />
                    <path d="M48 40v5l3 2" />
                  </svg>
                  <h3>{error ? 'Ledger unavailable' : 'A little room to begin'}</h3>
                  <p>{error
                    ? 'Your dispatches will appear here when the publishing API responds.'
                    : 'No posts have been returned yet. Your first dispatch will start the story.'}</p>
                </div>
              ) : (
                <ol className="event-list">
                  {posts.map((post, index) => {
                    const status = post.status == null ? 'Status not provided' : String(post.status);
                    const statusClass = status.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                    const isSelected = getPostKey(post, index) === selectedPostKey
                      || (!selectedPostKey && index === 0);
                    return (
                      <li className="event-entry" key={post.id}>
                        <div className={`event-marker status-${statusClass}`}>
                          <StatusMark status={status} />
                        </div>
                        <article className="event-note">
                          <div className="event-meta">
                            <span className="event-id">DISPATCH / {post.id ?? 'ID not provided'}</span>
                            <span className={`status-label status-${statusClass}`}>{status}</span>
                            <button
                              className="timeline-select-button"
                              type="button"
                              aria-pressed={isSelected}
                              aria-label={`${isSelected ? 'Selected' : 'Show'} dispatch ${post.id ?? 'with missing ID'} on the timeline`}
                              onClick={() => setSelectedPostKey(getPostKey(post, index))}
                            >
                              {isSelected ? 'On timeline' : 'Show on timeline'}
                            </button>
                          </div>
                          <p className="event-content">{post.content ?? 'Content not provided'}</p>
                          <div className="event-details">
                            <span>
                              <svg viewBox="0 0 16 16" aria-hidden="true">
                                <circle cx="8" cy="8" r="5.5" />
                                <path d="M8 4.5V8l2.5 1.5" />
                              </svg>
                              {formatTime(post.scheduledTime)}
                            </span>
                            {Number.isFinite(post.attempts) && (
                              <span className="attempt-count">Attempts: {post.attempts}</span>
                            )}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
            <div className="ledger-footer">
              <span>STATUS AND ATTEMPTS AS RETURNED BY THE API</span>
              {posts.length > 0 && <span>{posts.length} {posts.length === 1 ? 'dispatch' : 'dispatches'}</span>}
            </div>
          </section>
        </div>
      </main>

      <footer className="page-footer">
        <span>DISPATCH LABORATORY <span className="footer-dot">·</span> EXPERIMENT 08</span>
        <span>Compose with intention.</span>
      </footer>
    </div>
  );
}

export default App;
