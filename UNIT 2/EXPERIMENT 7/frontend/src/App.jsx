import { useCallback, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';
import './experiment-theme.css';

function App() {
  const [user, setUser] = useState(null);
  const [loginNotice, setLoginNotice] = useState('');
  const handleLogout = useCallback((notice = '') => {
    setUser(null);
    setLoginNotice(notice);
  }, []);
  const handleLogin = useCallback((session) => setUser(session), []);

  return (
    <main className="app-container">
      {user ? (
        <Dashboard user={user} onTokenRefresh={setUser} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLogin} notice={loginNotice} />
      )}
    </main>
  );
}

export default App;
