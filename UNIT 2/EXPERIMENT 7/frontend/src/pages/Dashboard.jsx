import { useCallback, useEffect, useState } from 'react';
import AccessMap from '../components/AccessMap';

const API = 'http://localhost:8080/api/tasks';
const EXPIRED_MESSAGE = 'Your session expired. Sign in again to continue.';

export default function Dashboard({ user, onTokenRefresh, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [taskError, setTaskError] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [busyTask, setBusyTask] = useState(null);
  const [creating, setCreating] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const request = useCallback(async (url, init = {}) => {
    const send = (token) => fetch(url, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    let response = await send(user.token);
    if (response.status === 401) {
      const refreshed = await fetch('http://localhost:8080/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      }).catch(() => null);

      if (!refreshed?.ok) {
        onLogout(EXPIRED_MESSAGE);
        throw new Error(EXPIRED_MESSAGE);
      }

      const session = await refreshed.json();
      onTokenRefresh(session);
      response = await send(session.token);
      if (response.status === 401) {
        onLogout(EXPIRED_MESSAGE);
        throw new Error(EXPIRED_MESSAGE);
      }
    }

    if (!response.ok) throw new Error(`Request failed (${response.status}).`);
    return response.status === 204 ? null : response.json();
  }, [user.token, user.refreshToken, onLogout, onTokenRefresh]);

  const fetchTasks = useCallback(
    () => request(`${API}?page=${page}&size=6&sort=id,desc`),
    [page, request],
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setTaskError('');
    setLoadError(false);
    try {
      const result = await fetchTasks();
      setTasks(result.content ?? []);
      setTotalPages(result.totalPages ?? 0);
    } catch (error) {
      setLoadError(true);
      setTaskError(error.message === 'Failed to fetch'
        ? 'The task service is unavailable. Check that the backend is running, then retry.'
        : error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]);

  useEffect(() => {
    let active = true;
    fetchTasks()
      .then((result) => {
        if (!active) return;
        setTasks(result.content ?? []);
        setTotalPages(result.totalPages ?? 0);
        setLoadError(false);
        setTaskError('');
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(true);
        setTaskError(error.message === 'Failed to fetch'
          ? 'The task service is unavailable. Check that the backend is running, then retry.'
          : error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchTasks]);

  async function createTask(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || creating) return;

    setCreating(true);
    setTaskError('');
    try {
      await request(API, {
        method: 'POST',
        body: JSON.stringify({ title: cleanTitle, completed: false }),
      });
      setTitle('');
      if (page !== 0) {
        setLoading(true);
        setPage(0);
      }
      else await loadTasks();
    } catch (error) {
      setTaskError(error.message);
    } finally {
      setCreating(false);
    }
  }

  async function toggleTask(id) {
    setBusyTask(id);
    setTaskError('');
    try {
      await request(`${API}/${id}/toggle`, { method: 'PUT' });
      await loadTasks();
    } catch (error) {
      setTaskError(error.message);
    } finally {
      setBusyTask(null);
    }
  }

  async function deleteTask(id) {
    setBusyTask(id);
    setTaskError('');
    try {
      await request(`${API}/${id}`, { method: 'DELETE' });
      await loadTasks();
    } catch (error) {
      setTaskError(error.message);
    } finally {
      setBusyTask(null);
    }
  }

  async function signOut() {
    setSigningOut(true);
    await fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: user.refreshToken }),
    }).catch(() => null);
    onLogout();
  }

  const isAdmin = user.role === 'ROLE_ADMIN';
  const hasPermissionData = Array.isArray(user.permissions);
  const canCreate = hasPermissionData ? user.permissions.includes('tasks:create') : (user.role === 'ROLE_USER' || isAdmin);
  const canUpdate = hasPermissionData ? user.permissions.includes('tasks:update') : (user.role === 'ROLE_USER' || isAdmin);
  const canDelete = hasPermissionData ? user.permissions.includes('tasks:delete') : isAdmin;
  const taskAccess = hasPermissionData
    ? user.permissions.filter((permission) => permission.startsWith('tasks:')).map((permission) => permission.split(':')[1]).join(' · ')
    : (isAdmin ? 'Create · update · delete' : 'Create · update');

  return (
    <section className="workspace">
      <header className="workspace-header">
        <a className="brand-lockup" href="#workspace-title" aria-label="Bastion workspace">
          <span className="brand-mark brand-mark-small">
            <svg viewBox="0 0 64 72" fill="none" aria-hidden="true">
              <path d="M32 4 55 13v19c0 16-9.4 27.1-23 36C18.4 59.1 9 48 9 32V13L32 4Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="m18 22 6.5 2.7m21.5-2.7-6.5 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M32 25a5 5 0 0 0-3.1 8.9L27.5 42h9l-1.4-8.1A5 5 0 0 0 32 25Z" fill="currentColor" />
            </svg>
          </span>
          <span className="brand-name">BASTION<span> / WORKSPACE</span></span>
        </a>
        <button type="button" className="btn-signout" onClick={signOut} disabled={signingOut}>
          {signingOut ? 'Signing out…' : 'Sign out'} <span aria-hidden="true">↗</span>
        </button>
      </header>

      <div className="workspace-heading">
        <div>
          <p className="eyebrow">AUTHENTICATED WORKSPACE <span className="heading-rule" /></p>
          <h1 id="workspace-title">Tasks, in<br className="mobile-break" /> clear view.</h1>
          <p className="workspace-description">Protected task access for your current session.</p>
        </div>
        <div className="session-card" aria-label="Current session details">
          <div className="session-card-top">
            <span className="session-indicator" aria-hidden="true" />
            <span>SESSION</span>
            <span className="session-state">SIGNED IN</span>
          </div>
          <dl>
            <div><dt>Account</dt><dd>{user.username}</dd></div>
            <div><dt>Role</dt><dd className="role-value">{user.role}</dd></div>
            <div><dt>Task access</dt><dd>{taskAccess || 'No task permissions'}</dd></div>
          </dl>
        </div>
      </div>

      <AccessMap user={user} />

      <section className="tasks-section" aria-labelledby="tasks-title" aria-busy={loading}>
        <div className="tasks-section-head">
          <div>
            <p className="eyebrow">PROTECTED RESOURCE <span className="resource-code">/ TASKS</span></p>
            <h2 id="tasks-title">Task list <span className="task-count-label">{loading ? 'LOADING' : `${tasks.length} ON THIS PAGE`}</span></h2>
          </div>
          <button type="button" className="btn-refresh" onClick={loadTasks} disabled={loading}>
            <span aria-hidden="true">↻</span> Refresh
          </button>
        </div>

        {taskError && (
          <div className="error-message task-error" role="alert">
            <p>{taskError}</p>
            <button type="button" onClick={loadTasks}>Retry task request</button>
          </div>
        )}

        {canCreate && <form className="task-create" onSubmit={createTask}>
          <label htmlFor="new-secure-task">Add a task</label>
          <div className="task-create-controls">
            <input
              id="new-secure-task"
              name="task"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={180}
              placeholder="Write a task title"
              aria-describedby="task-input-hint"
            />
            <button type="submit" className="btn-primary" disabled={!title.trim() || creating}>
              {creating ? 'Adding…' : 'Add task'} <span aria-hidden="true">+</span>
            </button>
          </div>
          <p id="task-input-hint" className="field-hint">Up to 180 characters</p>
        </form>}

        {loading ? (
          <div className="task-state-panel" role="status" aria-live="polite">
            <span className="loading-mark" aria-hidden="true" />
            <p>Loading protected tasks…</p>
          </div>
        ) : loadError && tasks.length === 0 ? (
          <div className="task-state-panel empty-state">
            <span className="empty-mark" aria-hidden="true">!</span>
            <h3>Tasks could not be loaded</h3>
            <p>Use the retry action above to request this page again.</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="task-state-panel empty-state">
            <span className="empty-mark" aria-hidden="true">—</span>
            <h3>No tasks on this page</h3>
            <p>Create a task above to begin, or move to another page.</p>
          </div>
        ) : (
          <ul className="secure-task-list" aria-label="Tasks">
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  className={`task-state ${task.completed ? 'done' : ''}`}
                  onClick={() => toggleTask(task.id)}
                  disabled={busyTask === task.id || !canUpdate}
                  aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}
                  aria-pressed={task.completed}
                >
                  {task.completed ? '✓' : ''}
                </button>
                <span className={`task-title ${task.completed ? 'task-complete' : ''}`}>{task.title}</span>
                <span className="task-id">#{task.id}</span>
                {canDelete && (
                  <button
                    type="button"
                    className="task-delete"
                    onClick={() => deleteTask(task.id)}
                    disabled={busyTask === task.id}
                    aria-label={`Delete ${task.title}`}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <nav className="task-pagination" aria-label="Task pages">
          <span>PAGE <strong>{page + 1}</strong> <span className="pagination-divider">/</span> {totalPages || 1}</span>
          <div>
            <button type="button" onClick={() => {
              setLoading(true);
              setPage((value) => Math.max(0, value - 1));
            }} disabled={loading || page === 0}>
              <span aria-hidden="true">←</span> Previous
            </button>
            <button type="button" onClick={() => {
              setLoading(true);
              setPage((value) => Math.min(totalPages - 1, value + 1));
            }} disabled={loading || page + 1 >= totalPages}>
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        </nav>
      </section>

      <details className="token-details">
        <summary><span>Inspect signed token</span><span className="demo-tag">DEMO CONTROL</span></summary>
        <p>Token data is shown only when this disclosure is opened.</p>
        <code>{user.token}</code>
      </details>

      <footer className="workspace-footer">
        <span>ACCESS CONTEXT</span>
        <p>Role and task actions reflect the current session and service permissions.</p>
      </footer>
    </section>
  );
}
