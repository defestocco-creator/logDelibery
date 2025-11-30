import React, { useState } from 'react';
import { authService } from '../services/api';
import { Lock, Mail, Server } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login(email, password);
      if (data.ok && data.token) {
        localStorage.setItem('delibery_token', data.token);
        localStorage.setItem('delibery_user_email', data.email);
        onLoginSuccess(data.email);
      } else {
        setError('Falha na autenticação. Verifique suas credenciais.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.erro || "Erro ao conectar com o servidor.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Server className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2">Delibery API</h2>
          <p className="text-slate-400 text-center mb-8">Analytics & Control Dashboard</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="admin@delibery.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
        <div className="bg-slate-900/50 px-8 py-4 border-t border-slate-700">
          <p className="text-xs text-center text-slate-500">
            Secure connection to apidelibery.onrender.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
