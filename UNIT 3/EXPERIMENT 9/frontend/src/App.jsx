import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8080';
const STAGES = [
  { title: 'Source change', detail: 'Commit / push' },
  { title: 'CI trigger', detail: 'Workflow entry' },
  { title: 'Compile', detail: 'Build artifacts' },
  { title: 'Verify', detail: 'Unit + API contracts' },
  { title: 'Package', detail: 'Container image' },
  { title: 'Route', detail: 'Canary traffic' }
];

async function requestJson(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const body = await response.text();
  let data = null;
  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }
  if (!response.ok) {
    const detail = typeof data === 'string' ? data : data?.message;
    throw new Error(detail || `Request failed (${response.status} ${response.statusText})`);
  }
  return data;
}

function App() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);

  const [canaryWeight, setCanaryWeight] = useState(null);
  const [canaryEnabled, setCanaryEnabled] = useState(null);
  const [pendingWeight, setPendingWeight] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [routingView, setRoutingView] = useState('configured');
  const [lastResponse, setLastResponse] = useState(null);
  const [trafficLog, setTrafficLog] = useState([]);
  const [busy, setBusy] = useState('');
  const [errors, setErrors] = useState({});

  const [contractResult, setContractResult] = useState(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [calcA, setCalcA] = useState(2);
  const [calcB, setCalcB] = useState(3);
  const [calcResult, setCalcResult] = useState(null);

  const clearError = useCallback((key) => {
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);

  const reportError = useCallback((key, error) => {
    setErrors((previous) => ({ ...previous, [key]: error.message || 'The request could not be completed.' }));
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      const data = await requestJson('/api/posts');
      setPosts(Array.isArray(data) ? data : []);
      setBackendOnline(true);
      setPostsLoading(false);
      clearError('posts');
    } catch (error) {
      setBackendOnline(false);
      setPostsLoading(false);
      reportError('posts', error);
    }
  }, [clearError, reportError]);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await requestJson('/api/canary/metrics');
      setMetrics(data);
      if (Number.isFinite(Number(data?.configuredPercentage))) {
        setCanaryWeight(Number(data.configuredPercentage));
      }
      clearError('metrics');
    } catch (error) {
      reportError('metrics', error);
    }
  }, [clearError, reportError]);

  const fetchConfiguration = useCallback(async () => {
    try {
      const data = await requestJson('/api/canary/config');
      if (Number.isFinite(Number(data?.canaryPercentage))) {
        setCanaryWeight(Number(data.canaryPercentage));
      }
      if (typeof data?.enabled === 'boolean') {
        setCanaryEnabled(data.enabled);
      }
      clearError('configuration');
    } catch (error) {
      reportError('configuration', error);
    }
  }, [clearError, reportError]);

  useEffect(() => {
    const initialRequest = window.setTimeout(() => {
      loadPosts();
      fetchMetrics();
      fetchConfiguration();
    }, 0);
    const interval = window.setInterval(() => {
      loadPosts();
      fetchMetrics();
      fetchConfiguration();
    }, 5000);
    return () => {
      window.clearTimeout(initialRequest);
      window.clearInterval(interval);
    };
  }, [loadPosts, fetchMetrics, fetchConfiguration]);

  const updateCanaryWeight = async (newWeight) => {
    setPendingWeight(newWeight);
    setBusy('config');
    try {
      const data = await requestJson('/api/canary/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canaryPercentage: newWeight })
      });
      if (Number.isFinite(Number(data?.canaryPercentage))) {
        setCanaryWeight(Number(data.canaryPercentage));
      }
      if (typeof data?.enabled === 'boolean') {
        setCanaryEnabled(data.enabled);
      }
      clearError('config');
      clearError('configuration');
      await fetchMetrics();
    } catch (error) {
      reportError('config', error);
    } finally {
      setPendingWeight(null);
      setBusy('');
    }
  };

  const sendRoutedRequest = async (forceCanary = false) => {
    setBusy(forceCanary ? 'force-route' : 'route');
    try {
      const data = await requestJson('/api/canary/route', {
        headers: forceCanary ? { 'X-Canary-Force': 'true' } : {}
      });
      setLastResponse(data);
      const servedBy = String(data?.servedBy || 'Route returned without a servedBy value');
      setTrafficLog((previous) => [{
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        label: servedBy,
        isCanary: servedBy.includes('Canary') ? true : servedBy.includes('Stable') ? false : null
      }, ...previous].slice(0, 20));
      clearError('route');
      await fetchMetrics();
    } catch (error) {
      reportError('route', error);
    } finally {
      setBusy('');
    }
  };

  const sendBatchTraffic = async () => {
    setBusy('batch');
    try {
      const data = await requestJson('/api/canary/batch?count=50', { method: 'POST' });
      setLastResponse(data);
      setTrafficLog((previous) => [{
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        label: `Batch response · ${data?.actualCanaryPercentage ?? 'distribution unavailable'}`,
        isCanary: null
      }, ...previous].slice(0, 20));
      clearError('batch');
      await fetchMetrics();
    } catch (error) {
      reportError('batch', error);
    } finally {
      setBusy('');
    }
  };

  const resetCanaryMetrics = async () => {
    setBusy('reset');
    try {
      await requestJson('/api/canary/reset', { method: 'POST' });
      setTrafficLog([]);
      setLastResponse(null);
      clearError('reset');
      await fetchMetrics();
    } catch (error) {
      reportError('reset', error);
    } finally {
      setBusy('');
    }
  };

  const testContract = async (type) => {
    setContractLoading(true);
    try {
      const payload = await requestJson(`/api/contract/sample/${type}`);
      const data = await requestJson('/api/contract/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setContractResult({ ...data, testedType: type, payloadSent: payload });
      clearError('contract');
    } catch (error) {
      reportError('contract', error);
    } finally {
      setContractLoading(false);
    }
  };

  const runCalculator = async () => {
    try {
      const data = await requestJson(`/api/calculator/add?a=${encodeURIComponent(calcA)}&b=${encodeURIComponent(calcB)}`);
      setCalcResult(data?.result);
      clearError('calculator');
    } catch (error) {
      reportError('calculator', error);
    }
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    setPostSubmitting(true);
    try {
      await requestJson('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: content || 'Demo post for CI/CD automated pipeline testing.',
          author: author || 'Student QA',
          version: 'v1.0.0'
        })
      });
      setTitle('');
      setContent('');
      setAuthor('');
      clearError('create-post');
      await loadPosts();
    } catch (error) {
      reportError('create-post', error);
    } finally {
      setPostSubmitting(false);
    }
  };

  const observedCanary = useMemo(() => {
    if (Number(metrics?.totalRequests) > 0) {
      const percentage = Number.parseFloat(metrics?.actualCanaryPercentage);
      return Number.isFinite(percentage) ? percentage : null;
    }
    return null;
  }, [metrics]);
  const splitPercentage = observedCanary ?? canaryWeight;
  const diagramCanary = routingView === 'configured' ? canaryWeight : observedCanary;
  const diagramStable = diagramCanary === null ? null : 100 - diagramCanary;
  const diagramEmptyLabel = routingView === 'observed' && metrics
    ? Number(metrics.totalRequests) > 0 ? 'DISTRIBUTION UNAVAILABLE' : 'NO ROUTED REQUESTS'
    : 'NO API DATA';
  const errorEntries = Object.entries(errors);

  return (
    <main className="concourse">
      <header className="masthead">
        <div className="masthead-top">
          <a className="wordmark" href="#top" aria-label="Experiment 9 operations concourse home">
            <span className="mark" aria-hidden="true"><i /><i /></span>
            <span>FIELD / 09</span>
          </a>
          <div className={`connection-state ${backendOnline ? 'connected' : 'disconnected'}`} role="status">
            <span className="connection-indicator" />
            <span>{backendOnline ? 'API RESPONDING' : 'API UNAVAILABLE'}</span>
            <span className="connection-address">localhost:8080</span>
          </div>
        </div>
        <div className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow"><span>UNIT 03</span><span className="eyebrow-rule" /><span>EXPERIMENT 09</span></p>
            <h1>Release<br /><em>concourse</em></h1>
            <p className="hero-description">A hands-on control surface for contract checks, canary routing and API operations.</p>
          </div>
          <div className="hero-coordinate" aria-hidden="true">
            <span>OPS / INTERFACE</span>
            <strong>09<span>.24</span></strong>
            <span>TEST · ROUTE · OBSERVE</span>
          </div>
        </div>
        <div className="header-rail">
          <span>LIVE CONTROLS <b>01—04</b></span>
          <span>BACKEND OBSERVATIONS <b>API-SOURCED</b></span>
          <span className="header-date">RELEASE SYSTEMS / LAB</span>
        </div>
      </header>

      {errorEntries.length > 0 && (
        <section className="error-console" aria-live="polite" aria-label="Request errors">
          <div className="error-icon" aria-hidden="true">!</div>
          <div className="error-content">
            <strong>REQUEST ATTENTION</strong>
            <ul>{errorEntries.map(([key, message]) => <li key={key}><span>{key.replace('-', ' ')}</span> — {message}</li>)}</ul>
          </div>
          <span className="error-mark">ERR</span>
        </section>
      )}

      <section className="reference-section" aria-labelledby="reference-title">
        <div className="section-heading">
          <div><p className="section-index">REFERENCE / 00</p><h2 id="reference-title">Release topology</h2></div>
          <span className="reference-tag"><span />STATIC REFERENCE FLOW</span>
        </div>
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
            {STAGES.map((stage, index) => <li key={stage.title}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{stage.title}</strong><small>{stage.detail}</small></div></li>)}
          </ol>
          <figcaption><span>REFERENCE ONLY</span> An illustrative sequence, not a live workflow run. No deployment-job status endpoint is connected.</figcaption>
        </figure>
      </section>

      <div className="workspace-heading">
        <p className="section-index">CONTROL DECK / 01—03</p>
        <span>Values below come from the Experiment 9 API and in-memory demo counters.</span>
      </div>
      <div className="workspace">
        <section className="panel route-panel" aria-labelledby="route-title">
          <div className="panel-head">
            <div><p className="section-index">01 / TRAFFIC CONTROL</p><h2 id="route-title">Canary workbench</h2></div>
            <button className="button button-quiet" onClick={resetCanaryMetrics} disabled={Boolean(busy)}>{busy === 'reset' ? 'Resetting…' : 'Reset stats'}</button>
          </div>
          <p className="panel-intro">Set the configured route weight, issue requests, and inspect what the API actually returns.</p>
          <div className="weight-readout">
            <div><span className="data-label">CONFIGURED CANARY</span><span className="weight-value">{canaryWeight === null ? '—' : <>{canaryWeight}<small>%</small></>}</span></div>
            <div className="weight-note">{canaryWeight === null ? 'Waiting for configuration response' : 'Backend configuration'}</div>
          </div>
          <label className="range-label" htmlFor="canary-range"><span>Canary route weight</span>          <span>{pendingWeight !== null ? 'Saving…' : canaryWeight === null ? 'Unavailable' : `${canaryWeight}%`}</span></label>
          <input
            id="canary-range"
            className="range-control"
            aria-label="Configured canary traffic percentage"
            type="range"
            min="0"
            max="100"
            step="5"
            value={pendingWeight ?? canaryWeight ?? 0}
            disabled={canaryWeight === null || busy === 'config'}
            onChange={(event) => updateCanaryWeight(Number.parseInt(event.target.value, 10))}
          />
          <div className="preset-row" aria-label="Canary weight presets">
            {[0, 10, 25, 50, 100].map((weight) => (
              <button key={weight} className={`preset ${canaryWeight === weight ? 'selected' : ''}`} onClick={() => updateCanaryWeight(weight)} disabled={busy === 'config'}>
                {weight}<span>%</span>
              </button>
            ))}
          </div>
          <section className="routing-diagram" aria-labelledby="routing-diagram-title">
            <div className="routing-diagram-heading">
              <div>
                <span className="data-label">ROUTING SNAPSHOT / API RESPONSE</span>
                <h3 id="routing-diagram-title">Traffic split</h3>
              </div>
              <div className="routing-view-switch" role="group" aria-label="Routing diagram data source">
                <button type="button" aria-pressed={routingView === 'configured'} onClick={() => setRoutingView('configured')}>Configured</button>
                <button type="button" aria-pressed={routingView === 'observed'} onClick={() => setRoutingView('observed')}>Observed</button>
              </div>
            </div>
            <p className="routing-diagram-note">
              {routingView === 'configured'
                ? canaryEnabled === false
                  ? 'Canary routing is disabled; this is the retained configured target, not a live stream.'
                  : canaryEnabled === null
                    ? 'Enable state unavailable; displaying the configured target returned by the API.'
                    : 'Configured target returned by the API; not a deployment or live stream.'
                : metrics?.totalRequests > 0
                  ? 'Share of accumulated routed requests returned by the API.'
                  : 'The API has returned no routed requests to compare yet.'}
            </p>
            <figure className={`routing-figure ${diagramCanary === null ? 'routing-empty' : ''}`}>
              <svg
                className="routing-svg routing-svg-wide"
                viewBox="0 0 560 160"
                role="img"
                aria-labelledby="routing-svg-title routing-svg-description"
              >
                <title id="routing-svg-title">Canary routing split</title>
                <desc id="routing-svg-description">
                  {diagramCanary === null
                    ? 'No request distribution is available in this API response.'
                    : `${routingView === 'configured' ? 'Configured target' : 'Observed request share'}: ${diagramStable}% stable and ${diagramCanary}% canary.`}
                </desc>
                <text className="routing-svg-label" x="12" y="85">REQUESTS</text>
                <path className="routing-track routing-trunk" d="M92 80H190" />
                <path className="routing-track" d="M190 80C245 80 245 43 300 43H364" />
                <path className="routing-track" d="M190 80C245 80 245 117 300 117H364" />
                {diagramCanary !== null && (
                  <>
                    <path className="routing-flow routing-flow-stable" strokeWidth={`${diagramStable / 10}`} d="M92 80H190C245 80 245 43 300 43H364" />
                    <path className="routing-flow routing-flow-canary" strokeWidth={`${diagramCanary / 10}`} d="M190 80C245 80 245 117 300 117H364" />
                  </>
                )}
                <circle className="routing-junction" cx="190" cy="80" r="5" />
                <rect className="routing-endpoint routing-endpoint-stable" x="364" y="25" width="184" height="36" rx="2" />
                <rect className="routing-endpoint routing-endpoint-canary" x="364" y="99" width="184" height="36" rx="2" />
                <text className="routing-svg-name" x="376" y="48">STABLE</text>
                <text className="routing-svg-value routing-svg-stable" x="536" y="48" textAnchor="end">{diagramStable === null ? '—' : `${diagramStable}%`}</text>
                <text className="routing-svg-name" x="376" y="122">CANARY</text>
                <text className="routing-svg-value routing-svg-canary" x="536" y="122" textAnchor="end">{diagramCanary === null ? '—' : `${diagramCanary}%`}</text>
                {diagramCanary === null && <text className="routing-empty-label" x="280" y="84" textAnchor="middle">{diagramEmptyLabel}</text>}
              </svg>
              <svg
                className="routing-svg routing-svg-mobile"
                viewBox="0 0 360 236"
                aria-hidden="true"
                focusable="false"
              >
                <text className="routing-svg-label" x="12" y="126">REQUESTS</text>
                <path className="routing-track routing-trunk" d="M104 120H150" />
                <path className="routing-track" d="M150 120C195 120 195 62 232 62H340" />
                <path className="routing-track" d="M150 120C195 120 195 178 232 178H340" />
                {diagramCanary !== null && (
                  <>
                    <path className="routing-flow routing-flow-stable" strokeWidth={`${diagramStable / 10}`} d="M104 120H150C195 120 195 62 232 62H340" />
                    <path className="routing-flow routing-flow-canary" strokeWidth={`${diagramCanary / 10}`} d="M150 120C195 120 195 178 232 178H340" />
                  </>
                )}
                <circle className="routing-junction" cx="150" cy="120" r="5" />
                <rect className="routing-endpoint routing-endpoint-stable" x="232" y="40" width="118" height="44" rx="2" />
                <rect className="routing-endpoint routing-endpoint-canary" x="232" y="156" width="118" height="44" rx="2" />
                <text className="routing-svg-name" x="244" y="58">STABLE</text>
                <text className="routing-svg-value routing-svg-stable" x="244" y="75">{diagramStable === null ? '—' : `${diagramStable}%`}</text>
                <text className="routing-svg-name" x="244" y="174">CANARY</text>
                <text className="routing-svg-value routing-svg-canary" x="244" y="191">{diagramCanary === null ? '—' : `${diagramCanary}%`}</text>
                {diagramCanary === null && <text className="routing-empty-label" x="190" y="224" textAnchor="middle">{diagramEmptyLabel}</text>}
              </svg>
              <figcaption className="visually-hidden">
                {routingView === 'configured' ? 'Configured canary weight' : 'Observed routing share'}.
                Stable: {diagramStable === null ? 'unavailable' : `${diagramStable} percent`}.
                Canary: {diagramCanary === null ? 'unavailable' : `${diagramCanary} percent`}.
              </figcaption>
            </figure>
            <table className="routing-data">
              <caption className="visually-hidden">Keyboard-accessible data equivalent for the routing diagram</caption>
              <thead><tr><th scope="col">Route</th><th scope="col">Configured target</th><th scope="col">Observed share</th><th scope="col">Observed requests</th></tr></thead>
              <tbody>
                <tr>
                  <th scope="row"><span className="swatch stable-swatch" />Stable</th>
                  <td>{canaryWeight === null ? 'Unavailable' : `${100 - canaryWeight}%`}</td>
                  <td>{observedCanary === null ? metrics ? 'No requests' : 'Unavailable' : `${100 - observedCanary}%`}</td>
                  <td>{metrics?.stableRequests ?? 'Unavailable'}</td>
                </tr>
                <tr>
                  <th scope="row"><span className="swatch canary-swatch" />Canary</th>
                  <td>{canaryWeight === null ? 'Unavailable' : `${canaryWeight}%`}</td>
                  <td>{observedCanary === null ? metrics ? 'No requests' : 'Unavailable' : `${observedCanary}%`}</td>
                  <td>{metrics?.canaryRequests ?? 'Unavailable'}</td>
                </tr>
              </tbody>
            </table>
            {(errors.metrics || errors.configuration) && <p className="routing-data-warning" role="status">A canary data refresh failed. Some displayed values may be from the last successful API response.</p>}
          </section>
          <div className="distribution">
            <div className="distribution-heading">
              <span>{observedCanary === null ? 'CONFIGURED SPLIT' : 'OBSERVED ROUTING'}</span>
              <span>{observedCanary === null ? 'TARGET' : 'API METRIC'}</span>
            </div>
            <div className="distribution-labels"><span><i className="swatch stable-swatch" />Stable <b>{splitPercentage === null ? '—' : `${Math.round(100 - splitPercentage)}%`}</b></span><span><i className="swatch canary-swatch" />Canary <b>{splitPercentage === null ? '—' : `${Math.round(splitPercentage)}%`}</b></span></div>
            <div className="distribution-bar" role="img" aria-label={splitPercentage === null ? 'Traffic distribution unavailable' : `${Math.round(100 - splitPercentage)} percent stable and ${Math.round(splitPercentage)} percent canary`}>
              {splitPercentage !== null && <><span className="stable-fill" style={{ width: `${100 - splitPercentage}%` }} /><span className="canary-fill" style={{ width: `${splitPercentage}%` }} /></>}
            </div>
          </div>
          <div className="metrics-grid">
            <Metric label="Total requests" value={metrics?.totalRequests} />
            <Metric label="Stable served" value={metrics?.stableRequests} tone="stable-value" />
            <Metric label="Canary served" value={metrics?.canaryRequests} tone="canary-value" />
            <Metric label="Observed canary" value={metrics?.actualCanaryPercentage} tone="canary-value" />
          </div>
          <div className="action-stack">
            <button className="button button-primary" onClick={() => sendRoutedRequest(false)} disabled={Boolean(busy)}><span className="button-glyph">↗</span>Route one request</button>
            <button className="button button-outline" onClick={() => sendRoutedRequest(true)} disabled={Boolean(busy)}><span className="button-glyph">⇢</span>Force canary <code>X-Canary-Force</code></button>
            <button className="button button-outline batch-button" onClick={sendBatchTraffic} disabled={Boolean(busy)}><span className="button-glyph">▥</span>Run 50-request batch</button>
          </div>
          {lastResponse && <div className="response-card">
            <div className="response-heading"><span>LAST API RESPONSE</span><span className="response-live">RETURNED DATA</span></div>
            <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
          </div>}
          <div className="log-section">
            <div className="log-heading"><h3>Routing log</h3><span>{trafficLog.length ? `${String(trafficLog.length).padStart(2, '0')} ITEMS` : 'NO LOCAL EVENTS'}</span></div>
            {trafficLog.length === 0 ? <p className="empty-note">A successful route or batch response will appear here.</p> : (
              <ol className="traffic-log" aria-label="Recent routing responses">
                {trafficLog.map((entry) => <li key={entry.id}><time>{entry.time}</time><span className={`route-beacon ${entry.isCanary === true ? 'beacon-canary' : entry.isCanary === false ? 'beacon-stable' : ''}`} /><span className="log-label">{entry.label}</span></li>)}
              </ol>
            )}
          </div>
        </section>

        <div className="tools-stack">
          <section className="panel tool-panel" aria-labelledby="contract-title">
            <div className="panel-head">
              <div><p className="section-index">02 / CONTRACT VERIFICATION</p><h2 id="contract-title">Schema check</h2></div>
              <span className="corner-code">PACT / CONCEPT</span>
            </div>
            <p className="panel-intro">Compare the API sample payload with the expected <code>name</code> contract.</p>
            <div className="schema-compare"><span><small>EXPECTED</small><code>{'{ name: "XYZ" }'}</code></span><b aria-hidden="true">→</b><span><small>BREAKING SAMPLE</small><code>{'{ username: "XYZ" }'}</code></span></div>
            <div className="contract-actions">
              <button className="button button-outline" onClick={() => testContract('compliant')} disabled={contractLoading}>{contractLoading ? 'Checking…' : 'Verify compliant'}</button>
              <button className="button button-outline" onClick={() => testContract('breaking')} disabled={contractLoading}>{contractLoading ? 'Checking…' : 'Test schema drift'}</button>
            </div>
            {contractResult ? <div className={`contract-result ${contractResult.contractStatus === 'PASSED' ? 'contract-pass' : 'contract-fail'}`}>
              <div className="result-heading"><span>API RESULT</span><strong>{contractResult.contractStatus}</strong></div>
              <p>{contractResult.explanation}</p>
              {contractResult.discrepancies?.length > 0 && <ul>{contractResult.discrepancies.map((item, index) => <li key={index}>{item}</li>)}</ul>}
              <details><summary>Inspect payload</summary><pre>{JSON.stringify(contractResult.payloadSent, null, 2)}</pre></details>
            </div> : <p className="empty-note tool-empty">No contract response yet. Run either verification mode.</p>}
          </section>

          <section className="panel tool-panel calculator-panel" aria-labelledby="calculator-title">
            <div className="panel-head">
              <div><p className="section-index">03 / UNIT TEST UTILITY</p><h2 id="calculator-title">Add function</h2></div>
              <span className="corner-code">GET /ADD</span>
            </div>
            <p className="panel-intro">Submit two operands to the calculator endpoint.</p>
            <div className="calculator">
              <label><span className="visually-hidden">First number</span><input type="number" value={calcA} onChange={(event) => setCalcA(event.target.value)} /></label>
              <span className="operator">+</span>
              <label><span className="visually-hidden">Second number</span><input type="number" value={calcB} onChange={(event) => setCalcB(event.target.value)} /></label>
              <button className="button button-primary" onClick={runCalculator}>Calculate</button>
              {calcResult !== null && <output className="calc-result" aria-live="polite">= {calcResult}</output>}
            </div>
          </section>
        </div>
      </div>

      <section className="panel posts-panel" aria-labelledby="posts-title">
        <div className="panel-head">
          <div><p className="section-index">04 / MOCKMVC API INTEGRATION</p><h2 id="posts-title">Posts manager <code>/api/posts</code></h2></div>
          <span className="record-count">{postsLoading ? 'LOADING' : `${posts.length} ${posts.length === 1 ? 'RECORD' : 'RECORDS'}`}</span>
        </div>
        <form className="post-form" onSubmit={handleCreatePost}>
          <label><span>Title <b>*</b></span><input type="text" placeholder="Post title" value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
          <label><span>Author</span><input type="text" placeholder="Student QA" value={author} onChange={(event) => setAuthor(event.target.value)} /></label>
          <label className="content-field"><span>Content</span><input type="text" placeholder="Add a note to this post" value={content} onChange={(event) => setContent(event.target.value)} /></label>
          <button type="submit" className="button button-primary" disabled={postSubmitting}>{postSubmitting ? 'Creating…' : 'Create post'}<span aria-hidden="true">↗</span></button>
        </form>
        {postsLoading ? <div className="posts-state"><span className="loading-mark" aria-hidden="true" /><p>Requesting records from the API…</p></div> : posts.length === 0 ? (
          <div className="posts-state empty-posts"><span className="empty-glyph" aria-hidden="true">∅</span><div><strong>No posts returned</strong><p>{errors.posts ? 'Resolve the request error above or reconnect to load records.' : 'Create a post to begin this API workflow.'}</p></div></div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => <article className="post-record" key={post.id}>
              <div className="post-record-meta"><span>RECORD / {post.id}</span><span>{post.version || 'VERSION N/A'}</span></div>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <div className="post-record-footer"><span>{post.author || 'AUTHOR N/A'}</span><span>API RESPONSE</span></div>
            </article>)}
          </div>
        )}
      </section>
      <footer className="footer"><span>FIELD / 09</span><span>TESTING · CONTAINERS · CANARY ROUTING</span><span>OBSERVE WHAT THE API RETURNS</span></footer>
    </main>
  );
}

function Metric({ label, value, tone = '' }) {
  return <div className="metric-cell"><span>{label}</span><strong className={tone}>{value === undefined || value === null ? '—' : value}</strong></div>;
}

export default App;
