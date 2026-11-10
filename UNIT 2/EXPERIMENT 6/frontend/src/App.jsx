import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:8080/api/tasks';
const PAGE_SIZE = 5;

const VIEWS = {
  tasks: {
    label: 'Task page',
    endpoint: '/api/tasks',
    description: 'Paged task records',
  },
  comments: {
    label: 'Fetch join',
    endpoint: '/api/tasks/with-comments',
    description: 'Tasks with comments',
  },
  top: {
    label: 'Top five',
    endpoint: '/api/tasks/top',
    description: 'Top task records',
  },
};

async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed (${response.status}).`);
  const body = await response.text();
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

async function getView(view, page) {
  if (view === 'tasks') {
    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
      sort: 'id,desc',
    });
    const data = await requestJson(`${API_URL}?${params}`);
    if (!Array.isArray(data.content) || typeof data.totalPages !== 'number') {
      throw new Error('Task service returned an invalid page.');
    }
    return { records: data.content, totalPages: data.totalPages };
  }

  const endpoint = view === 'comments' ? 'with-comments' : 'top';
  const records = await requestJson(`${API_URL}/${endpoint}`);
  if (!Array.isArray(records)) throw new Error('Task service returned an invalid record list.');
  return { records, totalPages: 1 };
}

function getErrorMessage(error) {
  if (error instanceof Error && error.message === 'Failed to fetch') {
    return 'Task service is unavailable. Start the backend, then retry.';
  }
  return error instanceof Error ? error.message : 'Unable to load records.';
}

function Reticle({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 3v10M24 35v10M3 24h10M35 24h10" />
      <path d="M9.2 9.2 16 16m16 16 6.8 6.8m0-29.6L32 16M16 32l-6.8 6.8" />
      <circle cx="24" cy="24" r="8" />
      <circle className="reticle-dot" cx="24" cy="24" r="2" />
    </svg>
  );
}

function EmptyDiagram() {
  return (
    <svg className="empty-diagram" viewBox="0 0 180 104" fill="none" role="img" aria-label="No records connected to this query">
      <path d="M16 52h42m64 0h42M90 10v22m0 40v22" />
      <path d="M58 52a32 32 0 0 1 32-32m32 32a32 32 0 0 1-32 32M90 20a32 32 0 0 1 32 32M90 84a32 32 0 0 1-32-32" />
      <circle cx="90" cy="52" r="8" />
      <circle className="diagram-dot" cx="90" cy="52" r="2.5" />
      <circle className="diagram-node" cx="16" cy="52" r="3" />
      <circle className="diagram-node" cx="164" cy="52" r="3" />
      <circle className="diagram-node" cx="90" cy="10" r="3" />
      <circle className="diagram-node" cx="90" cy="94" r="3" />
    </svg>
  );
}

function StatusDistribution({ records, completedCount, pendingCount, filter, onFilterChange, unavailable }) {
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
          <button
            type="button"
            className="distribution-filter"
            aria-pressed={filter === 'all'}
            disabled={!isAvailable || records.length === 0}
            onClick={() => onFilterChange('all')}
          >
            <span className="filter-mark filter-all" aria-hidden="true" />
            All <strong>{records.length}</strong>
          </button>
          <button
            type="button"
            className="distribution-filter"
            aria-pressed={filter === 'completed'}
            disabled={!isAvailable || records.length === 0}
            onClick={() => onFilterChange('completed')}
          >
            <span className="filter-mark filter-complete" aria-hidden="true" />
            Complete <strong>{completedCount}</strong>
          </button>
          <button
            type="button"
            className="distribution-filter"
            aria-pressed={filter === 'open'}
            disabled={!isAvailable || records.length === 0}
            onClick={() => onFilterChange('open')}
          >
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
        <svg
          viewBox="0 0 96 96"
          role="img"
          aria-label={unavailable
            ? 'Status distribution unavailable until a response is returned'
            : `${completedCount} complete and ${pendingCount} open of ${records.length} returned task records`}
        >
          <circle className="chart-track" cx="48" cy="48" r="36" />
          {isAvailable && records.length > 0 && (
            <g transform="rotate(-90 48 48)">
              <circle
                className={`chart-segment chart-open ${filter === 'completed' ? 'is-muted' : ''}`}
                cx="48"
                cy="48"
                r="36"
                style={{
                  strokeDasharray: `${openLength} ${circumference - openLength}`,
                  strokeDashoffset: -completedLength,
                }}
              />
              <circle
                className={`chart-segment chart-complete ${filter === 'open' ? 'is-muted' : ''}`}
                cx="48"
                cy="48"
                r="36"
                style={{ strokeDasharray: `${completedLength} ${circumference - completedLength}` }}
              />
            </g>
          )}
          <text className="chart-total" x="48" y="46" textAnchor="middle">
            {isAvailable ? records.length : '—'}
          </text>
          <text className="chart-caption" x="48" y="58" textAnchor="middle">RETURNED</text>
        </svg>
      </figure>
    </section>
  );
}

function App() {
  const [view, setView] = useState('tasks');
  const [page, setPage] = useState(0);
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    getView(view, page)
      .then((data) => {
        if (!active) return;
        const lastPage = Math.max(data.totalPages - 1, 0);
        if (view === 'tasks' && page > lastPage) {
          setPage(lastPage);
          return;
        }
        setRecords(data.records);
        setTotalPages(Math.max(data.totalPages, 1));
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [view, page, revision]);

  const retry = () => {
    setLoading(true);
    setError('');
    setRecords([]);
    setStatusFilter('all');
    setRevision((value) => value + 1);
  };

  const handleViewChange = (event) => {
    setLoading(true);
    setError('');
    setRecords([]);
    setStatusFilter('all');
    setView(event.target.value);
    setPage(0);
  };

  const handlePageChange = (nextPage) => {
    setLoading(true);
    setError('');
    setRecords([]);
    setStatusFilter('all');
    setPage(nextPage);
  };

  const handleAddTask = async (event) => {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    try {
      await requestJson(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: false }),
      });
      setNewTaskTitle('');
      retry();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const handleToggleTask = async (id) => {
    setBusyTaskId(id);
    try {
      await requestJson(`${API_URL}/${id}/toggle`, { method: 'PUT' });
      retry();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleDeleteTask = async (id) => {
    setBusyTaskId(id);
    try {
      await requestJson(`${API_URL}/${id}`, { method: 'DELETE' });
      retry();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyTaskId(null);
    }
  };

  const completedCount = records.filter((task) => task.completed).length;
  const pendingCount = records.length - completedCount;
  const visibleRecords = records.filter((task) => (
    statusFilter === 'all'
    || (statusFilter === 'completed' && task.completed)
    || (statusFilter === 'open' && !task.completed)
  ));
  const viewInfo = VIEWS[view];
  const query = view === 'tasks'
    ? `${viewInfo.endpoint}?page=${page}&size=${PAGE_SIZE}&sort=id,desc`
    : viewInfo.endpoint;

  return (
    <main className="observatory">
      <header className="masthead">
        <a className="brand" href="#main" aria-label="Read API observatory home">
          <Reticle className="brand-mark" />
          <span className="brand-name">FIELDNOTE<span>/06</span></span>
        </a>
        <p className="masthead-meta">READ API <span>·</span> EXPERIMENT 06</p>
        <span className="masthead-index">OBSERVATION&nbsp; 001</span>
      </header>

      <section className="intro" id="main">
        <div className="intro-copy">
          <p className="eyebrow"><span className="eyebrow-rule" />DATA INSTRUMENT / TASKS</p>
          <h1>Read the<br /><em>response.</em></h1>
          <p className="intro-text">A quiet surface for inspecting paginated task records and their read paths.</p>
        </div>
        <div className="query-sketch" aria-hidden="true">
          <svg viewBox="0 0 240 160" fill="none">
            <path d="M12 80h48m120 0h48M120 12v36m0 64v36" />
            <path d="M60 80a60 60 0 0 1 60-60m60 60a60 60 0 0 1-60 60m0-120a60 60 0 0 1 60 60M120 140a60 60 0 0 1-60-60" />
            <circle cx="120" cy="80" r="16" />
            <circle className="sketch-dot" cx="120" cy="80" r="4" />
            <path className="sketch-axis" d="M120 64v-29m16 45h29m-45 16v29m-16-45H75" />
          </svg>
          <span className="sketch-caption">QUERY / RESPONSE</span>
        </div>
      </section>

      <section className="query-panel" aria-label="Query controls">
        <div className="query-heading">
          <span className="section-index">01</span>
          <h2>Query surface</h2>
        </div>
        <div className="query-controls">
          <label className="view-control">
            <span>READ VIEW</span>
            <select value={view} onChange={handleViewChange} aria-label="Choose a read view">
              <option value="tasks">Task page</option>
              <option value="comments">Tasks with comments</option>
              <option value="top">Top five tasks</option>
            </select>
          </label>
          <div className="query-source">
            <span>REQUEST SOURCE</span>
            <code>{query}</code>
          </div>
          <div className="query-method">
            <span>METHOD</span>
            <code>GET</code>
          </div>
        </div>
        <div className={`request-line ${loading ? 'is-loading' : ''}`} aria-hidden="true" />
      </section>

      <section className="results-section" aria-labelledby="results-title">
        <div className="results-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-rule" />02 / RESPONSE</p>
            <h2 id="results-title">Returned records</h2>
          </div>
          <p className="source-label"><span className="source-indicator" />SOURCE: <code>{viewInfo.endpoint}</code></p>
        </div>

        <div className="response-summary">
          <div className="summary-cell">
            <span className="summary-label">{view === 'tasks' ? 'ROWS IN PAGE' : 'ROWS RETURNED'}</span>
            <strong>{loading || error ? '—' : records.length.toString().padStart(2, '0')}</strong>
          </div>
          <div className="summary-cell">
            <span className="summary-label">COMPLETED</span>
            <strong className="is-green">{loading || error ? '—' : completedCount.toString().padStart(2, '0')}</strong>
          </div>
          <div className="summary-cell">
            <span className="summary-label">OPEN</span>
            <strong>{loading || error ? '—' : pendingCount.toString().padStart(2, '0')}</strong>
          </div>
          <p className="summary-note">{viewInfo.description}<br /><span>Counts reflect records currently returned.</span></p>
        </div>

        <StatusDistribution
          records={records}
          completedCount={completedCount}
          pendingCount={pendingCount}
          filter={statusFilter}
          onFilterChange={setStatusFilter}
          unavailable={loading || Boolean(error)}
        />

        <form className="create-form" onSubmit={handleAddTask}>
          <label htmlFor="new-task">CREATE TASK</label>
          <input
            id="new-task"
            type="text"
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="Enter a task title"
            maxLength={255}
          />
          <button type="submit" className="create-button" disabled={!newTaskTitle.trim()}>
            <span aria-hidden="true">+</span> Add task
          </button>
        </form>

        {error && (
          <div className="error-state" role="alert">
            <div>
              <span className="error-kicker">REQUEST NOT COMPLETED</span>
              <p>{error}</p>
            </div>
            <button type="button" className="retry-button" onClick={retry} disabled={loading}>
              Retry request <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}

        <div className="table-frame" aria-busy={loading}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col" className="id-column">ID</th>
                  <th scope="col">TASK RECORD</th>
                  <th scope="col">STATE</th>
                  {view === 'comments' && <th scope="col">COMMENTS</th>}
                  <th scope="col" className="actions-heading">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {!loading && visibleRecords.map((task) => {
                  const busy = busyTaskId === task.id;
                  return (
                    <tr key={task.id}>
                      <td className="record-id">#{task.id}</td>
                      <td className={`record-title ${task.completed ? 'is-completed' : ''}`}>{task.title}</td>
                      <td>
                        <span className={`status-tag ${task.completed ? 'status-done' : 'status-open'}`}>
                          <span />{task.completed ? 'COMPLETE' : 'OPEN'}
                        </span>
                      </td>
                      {view === 'comments' && (
                        <td className="comment-count">
                          {Array.isArray(task.comments) && task.comments.length > 0
                            ? task.comments.map((comment) => comment.text).filter(Boolean).join(' · ')
                            : '—'}
                        </td>
                      )}
                      <td className="row-actions">
                        <button
                          type="button"
                          className="row-action"
                          onClick={() => handleToggleTask(task.id)}
                          disabled={busy}
                          aria-label={`${task.completed ? 'Reopen' : 'Complete'} task ${task.title}`}
                        >{task.completed ? 'Reopen' : 'Complete'}</button>
                        <button
                          type="button"
                          className="row-action row-delete"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={busy}
                          aria-label={`Delete task ${task.title}`}
                        >Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="loading-state" role="status" aria-live="polite">
              <span className="loading-crosshair"><i /></span>
              <span>Awaiting response from {viewInfo.endpoint}</span>
            </div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="empty-state" aria-live="polite">
              <EmptyDiagram />
              <h3>No records in this response</h3>
              <p>This query returned an empty set. Add a task or inspect another read view.</p>
            </div>
          )}

          {!loading && !error && records.length > 0 && visibleRecords.length === 0 && (
            <div className="empty-state" aria-live="polite">
              <EmptyDiagram />
              <h3>No {statusFilter} records on this page</h3>
              <p>Choose another status filter to inspect the returned task records.</p>
            </div>
          )}

          {!loading && error && records.length === 0 && (
            <div className="empty-state error-empty" aria-live="polite">
              <EmptyDiagram />
              <h3>Response unavailable</h3>
              <p>Records will appear here after the request succeeds.</p>
            </div>
          )}
        </div>

        {view === 'tasks' && !loading && !error && (
          <nav className="pagination" aria-label="Task pages">
            <button type="button" onClick={() => handlePageChange(Math.max(0, page - 1))} disabled={page === 0 || loading}>
              <span aria-hidden="true">←</span> Previous
            </button>
            <p><span>PAGE</span> <strong>{page + 1}</strong><i>/</i>{totalPages}</p>
            <button type="button" onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1 || loading}>
              Next <span aria-hidden="true">→</span>
            </button>
          </nav>
        )}
      </section>

      <footer className="page-footer">
        <span>FIELDNOTE / READ API OBSERVATORY</span>
        <span>EXPERIMENT 06 <i>·</i> {viewInfo.endpoint}</span>
      </footer>
    </main>
  );
}

export default App;
