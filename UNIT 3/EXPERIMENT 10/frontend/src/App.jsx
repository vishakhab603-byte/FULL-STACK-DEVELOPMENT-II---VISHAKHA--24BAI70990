import { useCallback, useEffect, useMemo, useState } from 'react';
import BrandMark from './components/BrandMark';
import PlatformMark from './components/PlatformMark';
import {
  API_ROOT,
  CHANNELS,
  addPostTimestamps,
  localDateTimeValue,
  messageFrom,
  requestJson,
} from './features/publishing/publishingSlice';

const INITIAL_TIME = Date.now();
const INITIAL_MINIMUM_DATE_TIME = localDateTimeValue(INITIAL_TIME);

function formatDate(value, options) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

function App() {
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [platform, setPlatform] = useState(CHANNELS[0]);
  const [body, setBody] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [referenceTime, setReferenceTime] = useState(INITIAL_TIME);
  const [minimumDateTime, setMinimumDateTime] = useState(INITIAL_MINIMUM_DATE_TIME);

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [postData, analyticsData] = await Promise.all([
        requestJson(`${API_ROOT}/posts`),
        requestJson(`${API_ROOT}/analytics`),
      ]);
      if (!Array.isArray(postData) || !analyticsData || typeof analyticsData !== 'object') {
        throw new Error('The publishing service returned an unexpected response.');
      }
      const receivedAt = Date.now();
      setPosts(addPostTimestamps(postData));
      setAnalytics(analyticsData);
      setReferenceTime(receivedAt);
      setMinimumDateTime(localDateTimeValue(receivedAt));
      setConnected(true);
      setError('');
    } catch (requestError) {
      setConnected(false);
      setError(messageFrom(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => refresh(), 0);
    const timer = window.setInterval(() => refresh(), 15000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const scheduledPosts = useMemo(
    () => posts
      .filter((post) => post.status === 'SCHEDULED')
      .sort((first, second) => first.scheduledAtTimestamp - second.scheduledAtTimestamp),
    [posts],
  );

  const nextPost = scheduledPosts.find((post) => post.scheduledAtTimestamp >= referenceTime);
  const channelCounts = analytics?.channels ?? {};
  const activeChannels = Object.values(channelCounts).filter((count) => count > 0).length;
  const displayedPosts = filter === 'ALL' ? posts : posts.filter((post) => post.status === filter);
  const timelinePosts = useMemo(
    () => displayedPosts
      .map((post, index) => ({
        post,
        index,
        timestamp: post.status === 'PUBLISHED' && post.publishedAt
          ? post.publishedAtTimestamp
          : post.scheduledAtTimestamp,
      }))
      .sort((first, second) => {
        const firstValid = Number.isFinite(first.timestamp);
        const secondValid = Number.isFinite(second.timestamp);
        if (firstValid !== secondValid) return firstValid ? -1 : 1;
        if (!firstValid) return first.index - second.index;
        return first.timestamp - second.timestamp;
      }),
    [displayedPosts],
  );

  function selectTimelinePost(post) {
    setSelectedPostId(post.id);
    const article = document.getElementById(`edition-post-${post.id}`);
    article?.scrollIntoView({ behavior: 'auto', block: 'center' });
    article?.focus({ preventScroll: true });
  }

  async function submit(event) {
    event.preventDefault();
    if (!body.trim() || !scheduledAt || saving) return;

    setSaving(true);
    setError('');
    try {
      await requestJson(`${API_ROOT}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          body: body.trim(),
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });
      setBody('');
      setScheduledAt('');
      await refresh();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function removePost(post) {
    setRemovingId(post.id);
    setError('');
    try {
      await requestJson(`${API_ROOT}/posts/${post.id}`, { method: 'DELETE' });
      await refresh();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="publication">
      <header className="masthead">
        <a className="publication-brand" href="#home" aria-label="Experiment 10, home">
          <BrandMark />
          <span><strong>10</strong><small>PUBLICATION STUDIO</small></span>
        </a>
        <div className={`connection-state ${connected ? 'is-connected' : loading ? 'is-loading' : 'has-error'}`} aria-live="polite">
          <span />
          {connected ? 'LOCAL WORKSPACE' : loading ? 'CONNECTING' : 'SERVICE ISSUE'}
        </div>
      </header>

      <section className="editorial-intro" id="home">
        <div className="intro-copy">
          <p className="kicker"><span>THE CREATOR’S DESK</span><i /> EXPERIMENT 10</p>
          <h1>The right words.<br /><em>The right moment.</em></h1>
          <p className="intro-deck">Make space for the ideas worth sharing. Shape your post, choose a channel, and give it a moment of its own.</p>
        </div>
        <aside className="next-note" aria-label="Next scheduled post">
          <div className="note-topline"><span>ON THE CALENDAR</span><span className="note-seal">10</span></div>
          {nextPost ? (
            <>
              <p className="next-date">{formatDate(nextPost.scheduledAt, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <p className="next-time">{formatDate(nextPost.scheduledAt, { hour: 'numeric', minute: '2-digit' })} · {nextPost.platform}</p>
              <p className="next-copy">{nextPost.body}</p>
            </>
          ) : (
            <>
              <p className="next-date">A clear page.</p>
              <p className="next-time">Nothing scheduled next</p>
              <p className="next-copy">Choose a time for your next idea in the publishing desk.</p>
            </>
          )}
          <svg className="note-orbit" viewBox="0 0 180 72" aria-hidden="true">
            <path d="M5 53C35 8 82 8 111 37s47 34 64 4" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" />
            <circle cx="6" cy="52" r="4" fill="currentColor" />
            <circle cx="111" cy="37" r="5" fill="#e47768" />
            <circle cx="174" cy="41" r="3" fill="currentColor" />
          </svg>
        </aside>
      </section>

      {error && (
        <div className="notice" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => refresh(true)} disabled={loading}>Try again</button>
        </div>
      )}

      <section className="editorial-ledger" aria-label="Publishing totals from the service">
        <div><span>POSTS WRITTEN</span><strong>{analytics?.total ?? '—'}</strong></div>
        <div><span>WAITING FOR THEIR MOMENT</span><strong>{analytics?.scheduled ?? '—'}</strong></div>
        <div><span>SHARED</span><strong>{analytics?.published ?? '—'}</strong></div>
        <div><span>CHANNELS IN USE</span><strong>{analytics ? activeChannels : '—'}</strong></div>
      </section>

      <section className="studio" aria-label="Create a social post">
        <div className="studio-heading">
          <div><span className="section-index">01 / COMPOSE</span><h2>A note to the world</h2></div>
          <span className="draft-label"><i /> UNSENT</span>
        </div>
        <div className="studio-grid">
          <form className="composer" onSubmit={submit}>
            <fieldset className="channel-field">
              <legend>Choose a channel</legend>
              <div className="channel-options">
                {CHANNELS.map((channel) => (
                  <button
                    className={`channel-choice ${platform === channel ? 'selected' : ''}`}
                    type="button"
                    key={channel}
                    aria-pressed={platform === channel}
                    onClick={() => setPlatform(channel)}
                  >
                    <PlatformMark platform={channel} />
                    {channel}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="field-label" htmlFor="post-copy">Your words</label>
            <textarea
              id="post-copy"
              className="post-copy"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={1000}
              placeholder="Start with the thought you want people to remember…"
              required
            />
            <div className="copy-count" aria-live="polite">{body.length} <span>/ 1,000</span></div>
            <div className="schedule-row">
              <label className="field-label" htmlFor="schedule-time">Give it a moment</label>
              <input
                id="schedule-time"
                type="datetime-local"
                min={minimumDateTime}
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                required
              />
            </div>
            <button className="schedule-action" type="submit" disabled={saving || !body.trim() || !scheduledAt}>
              <span>{saving ? 'Placing on the calendar…' : 'Schedule this post'}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <p className="local-note">Scheduling is saved to this local workspace. Publishing is simulated; no social account is connected.</p>
          </form>

          <aside className="channel-composition" aria-label="Saved post distribution by channel">
            <div className="distribution-heading">
              <div><span className="section-index">A SMALL PICTURE</span><h3>Your channel mix</h3></div>
              <span className="distribution-caption">POSTS, NOT ENGAGEMENT</span>
            </div>
            {analytics ? (
              <div className="channel-list">
                {CHANNELS.map((channel) => {
                  const count = channelCounts[channel] ?? 0;
                  const share = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                  return (
                    <div className="channel-stat" key={channel}>
                      <div className="channel-stat-label"><span><PlatformMark platform={channel} />{channel}</span><strong>{count}</strong></div>
                      <div className="channel-track" role="img" aria-label={`${channel}: ${count} posts, ${share}% of all posts`}>
                        <span style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="distribution-empty">{loading ? 'Gathering your published notes…' : 'Channel distribution appears when the service reconnects.'}</p>
            )}
            <div className="distribution-footnote">
              <svg viewBox="0 0 36 36" aria-hidden="true"><path d="M4 24c6-11 10-11 15-3s8 8 13-6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="4" cy="24" r="2" fill="currentColor" /><circle cx="19" cy="21" r="2" fill="currentColor" /><circle cx="32" cy="15" r="2" fill="currentColor" /></svg>
              <span>Counts come from your saved posts.</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="calendar" aria-label="Your publishing calendar">
        <div className="calendar-heading">
          <div><span className="section-index">02 / THE EDITION</span><h2>Notes in the making</h2></div>
          <div className="edition-filters" role="group" aria-label="Filter posts by status">
            {[
              ['ALL', 'All'],
              ['SCHEDULED', 'Scheduled'],
              ['PUBLISHED', 'Published'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={filter === value ? 'active' : ''}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {!loading && posts.length > 0 && (
          <div className="calendar-timeline-wrap">
            <div className="timeline-heading">
              <p>THE EDITION, IN TIME</p>
              <span>{timelinePosts.length} {timelinePosts.length === 1 ? 'post' : 'posts'} · ordered by recorded date</span>
            </div>
            {error && <p className="timeline-stale" role="status">Showing the last successful schedule response.</p>}
            <ol className="calendar-timeline" aria-label="Posts ordered by their scheduled or published date">
              {timelinePosts.map(({ post, timestamp: timestampValue }) => {
                const timestamp = post.status === 'PUBLISHED' && post.publishedAt
                  ? post.publishedAt
                  : post.scheduledAt;
                const validDate = Number.isFinite(timestampValue);
                const dateLabel = validDate
                  ? formatDate(timestamp, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                  : 'Date unavailable';

                return (
                  <li key={post.id}>
                    <button
                      type="button"
                      className={`timeline-post ${selectedPostId === post.id ? 'is-selected' : ''}`}
                      aria-controls={`edition-post-${post.id}`}
                      aria-pressed={selectedPostId === post.id}
                      aria-label={`${dateLabel} · ${post.platform} · ${post.status === 'PUBLISHED' ? 'published' : 'scheduled'}; view post`}
                      onClick={() => selectTimelinePost(post)}
                    >
                      <span className={`timeline-marker timeline-marker-${post.status.toLowerCase()}`} aria-hidden="true" />
                      {validDate
                        ? <time dateTime={timestamp}>{dateLabel}</time>
                        : <span>{dateLabel}</span>}
                      <span className="timeline-platform">{post.platform}</span>
                      <span className="timeline-status">{post.status === 'PUBLISHED' ? 'Published' : 'Scheduled'}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        {loading ? (
          <div className="calendar-state" role="status"><span className="loading-mark" />Gathering your edition…</div>
        ) : displayedPosts.length > 0 ? (
          <div className="editorial-feed">
            {displayedPosts.map((post, index) => (
              <article
                className={`edition-post edition-post-${index % 3} ${selectedPostId === post.id ? 'is-selected' : ''}`}
                id={`edition-post-${post.id}`}
                key={post.id}
                tabIndex="-1"
              >
                <div className="edition-meta">
                  <PlatformMark platform={post.platform} />
                  <span>{post.platform}</span>
                  <span className={`post-state post-state-${post.status.toLowerCase()}`}>{post.status === 'PUBLISHED' ? 'PUBLISHED' : 'SCHEDULED'}</span>
                </div>
                <p className="edition-copy">{post.body}</p>
                <div className="edition-footer">
                  <time dateTime={post.status === 'PUBLISHED' && post.publishedAt ? post.publishedAt : post.scheduledAt}>
                    {post.status === 'PUBLISHED' && post.publishedAt ? 'Published ' : 'Scheduled '}
                    {formatDate(post.status === 'PUBLISHED' && post.publishedAt ? post.publishedAt : post.scheduledAt, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </time>
                  <button type="button" className="remove-post" onClick={() => removePost(post)} disabled={removingId === post.id}>
                    {removingId === post.id ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="calendar-state">
            {error ? 'Your saved posts will return when the publishing service reconnects.' : filter === 'ALL' ? 'Your next good idea starts here.' : `No ${filter.toLowerCase()} posts in this edition.`}
          </div>
        )}
      </section>

      <footer className="publication-footer">
        <span>EXPERIMENT 10 <i>·</i> THE CREATOR’S DESK</span>
        <span>Local publishing simulation</span>
      </footer>
    </main>
  );
}

export default App;
