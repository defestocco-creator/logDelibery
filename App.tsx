import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { authService } from './services/api';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedToken = localStorage.getItem('delibery_token');
    const storedEmail = localStorage.getItem('delibery_user_email');

    if (storedToken && storedEmail) {
      setToken(storedToken);
      setUserEmail(storedEmail);
    }
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (email: string) => {
    setToken(localStorage.getItem('delibery_token'));
    setUserEmail(email);
  };

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setUserEmail('');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-500">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="antialiased text-slate-50">
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard userEmail={userEmail} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
