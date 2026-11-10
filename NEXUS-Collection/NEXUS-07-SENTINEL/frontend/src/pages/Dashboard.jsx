import React, { useCallback, useEffect, useState } from 'react';

const API = 'http://localhost:8080/api/tasks';

export default function Dashboard({ user, onTokenRefresh, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const request = useCallback(async (url, init = {}) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${user.token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
    if (response.status === 401 && url.startsWith(API)) {
      const refreshed = await fetch('http://localhost:8080/api/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: user.refreshToken }) }).catch(() => null);
      if (!refreshed?.ok) { onLogout(); throw new Error('Your session expired. Sign in again.'); }
      const session = await refreshed.json(); onTokenRefresh(session);
      return request(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${session.token}` } });
    }
    if (response.status === 401) { onLogout(); throw new Error('Your session expired. Sign in again.'); }
    if (!response.ok) throw new Error(`Request failed (${response.status}).`);
    return response.status === 204 ? null : response.json();
  }, [user.token, user.refreshToken, onLogout, onTokenRefresh]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await request(`${API}?page=${page}&size=6&sort=id,desc`);
      setTasks(result.content ?? []);
      setTotalPages(result.totalPages ?? 0);
      setError('');
    } catch (e) {
      setError(e.message === 'Failed to fetch' ? 'Secure API is offline. Start the backend and try again.' : e.message);
    } finally {
      setLoading(false);
    }
  }, [page, request]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  async function createTask(event) {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      await request(API, { method: 'POST', body: JSON.stringify({ title: title.trim(), completed: false }) });
      setTitle('');
      if (page !== 0) setPage(0); else await loadTasks();
    } catch (e) { setError(e.message); }
  }

  async function toggleTask(id) {
    try {
      await request(`${API}/${id}/toggle`, { method: 'PUT' });
      await loadTasks();
    } catch (e) { setError(e.message); }
  }

  async function deleteTask(id) {
    try {
      await request(`${API}/${id}`, { method: 'DELETE' });
      await loadTasks();
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="dashboard-container glass-panel">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span className="eyebrow">NEXUS / SENTINEL · EXPERIMENT 07</span>
          <h2>Secure read workspace</h2>
          <p>Signed in as {user.username} · {user.role}</p>
        </div>
        <button onClick={async () => { await fetch('http://localhost:8080/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: user.refreshToken }) }).catch(() => {}); onLogout(); }} className="btn-logout">Sign out</button>
      </div>

      <section className="info-cards" aria-label="Security summary">
        <div className="card"><h3>Session</h3><p>JWT verified</p></div>
        <div className="card"><h3>Access role</h3><p><span className="role-badge">{user.role}</span></p></div>
        <div className="card"><h3>Read model</h3><p>Paginated · ordered by newest</p></div>
      </section>

      <section className="secure-tasks">
        <div className="tasks-heading"><div><span className="eyebrow">OPTIMIZED DATA / PAGE {page + 1}</span><h3>Tasks</h3></div><button onClick={loadTasks} className="btn-logout">Refresh</button></div>
        {error && <p className="error-message" role="alert">{error}</p>}
        <form className="task-create" onSubmit={createTask}>
          <label className="sr-only" htmlFor="new-secure-task">New task</label>
          <input id="new-secure-task" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} placeholder="Add a task to the secured workspace" />
          <button className="btn-primary" disabled={!title.trim()}>Add task</button>
        </form>
        {loading ? <p className="task-empty">Loading page from the secured API…</p> : tasks.length === 0 ? <p className="task-empty">No tasks on this page. Add the first one above.</p> : (
          <ul className="secure-task-list">
            {tasks.map((task) => <li key={task.id}>
              <button className={`task-state ${task.completed ? 'done' : ''}`} onClick={() => toggleTask(task.id)} aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}>{task.completed ? '✓' : ''}</button>
              <span className={task.completed ? 'task-complete' : ''}>{task.title}</span>
              {user.role === 'ROLE_ADMIN' && <button className="task-delete" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>Delete</button>}
            </li>)}
          </ul>
        )}
        <div className="task-pagination"><span>{totalPages ? `${page + 1} of ${totalPages} pages` : 'Page 1 of 1'}</span><div><button onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0}>Previous</button><button onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={page + 1 >= totalPages}>Next</button></div></div>
      </section>

      <details className="token-details"><summary>Inspect signed token (demo)</summary><code>{user.token}</code></details>
    </div>
  );
}
