import React, { useEffect, useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';
import { 
  Activity, Clock, Database, RefreshCw, LogOut, Zap, 
  AlertCircle, CheckCircle2, Globe 
} from 'lucide-react';
import { dataService, authService } from '../services/api';
import { MetricData } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getMetrics();
      // Convert Object of Objects to Array and sort safely
      const metricsArray = Object.values(data).sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0));
      setMetrics(metricsArray);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSimulateTraffic = async () => {
    setSimulating(true);
    try {
      // Fire 5 requests to generate data
      await Promise.all([
        dataService.simulateGetOrders(),
        dataService.simulateGetOrders(),
        dataService.simulateGetOrders()
      ]);
      // Small delay to allow Firebase to index
      setTimeout(() => {
        fetchData();
        setSimulating(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      setSimulating(false);
    }
  };

  // --- Derived Statistics ---
  const stats = useMemo(() => {
    if (metrics.length === 0) return { avgLatency: '0.00', totalRequests: 0, errorRate: '0.0', peakLatency: '0.00' };
    
    const totalRequests = metrics.length;
    // Add fallback for responseTimeMs
    const totalLatency = metrics.reduce((acc, curr) => acc + (curr.responseTimeMs || 0), 0);
    const avgLatency = (totalLatency / totalRequests).toFixed(2);
    const errors = metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = ((errors / totalRequests) * 100).toFixed(1);
    
    const latencies = metrics.map(m => m.responseTimeMs || 0);
    const peakLatency = latencies.length > 0 ? Math.max(...latencies).toFixed(2) : '0.00';

    return { avgLatency, totalRequests, errorRate, peakLatency };
  }, [metrics]);

  // --- Chart Data Preparation ---
  const latencyData = useMemo(() => {
    return metrics.slice(-30).map((m, i) => ({
      name: i, 
      ms: parseFloat((m.responseTimeMs || 0).toFixed(2)),
      time: m.timestampMs ? new Date(m.timestampMs).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' }) : ''
    }));
  }, [metrics]);

  const methodData = useMemo(() => {
    const counts: Record<string, number> = {};
    metrics.forEach(m => {
      const method = m.method || 'UNKNOWN';
      counts[method] = (counts[method] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [metrics]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl">
          <p className="text-slate-200 text-sm font-mono">{`Time: ${payload[0].payload.time}`}</p>
          <p className="text-cyan-400 font-bold">{`${payload[0].value} ms`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Delibery Analytics</h1>
                <p className="text-xs text-slate-500">v0.5 Firebase Integrated</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-sm text-slate-400">{userEmail}</span>
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
            <p className="text-slate-400 mt-1">
              Real-time metrics from <span className="font-mono text-cyan-500">apidelibery.onrender.com</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSimulateTraffic}
              disabled={simulating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all ${simulating ? 'opacity-70' : ''}`}
            >
              {simulating ? <LoadingSpinner /> : <Zap className="h-4 w-4" />}
              {simulating ? 'Generating...' : 'Test Traffic'}
            </button>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Avg Latency" 
            value={`${stats.avgLatency} ms`} 
            icon={<Clock className="h-6 w-6 text-cyan-400" />}
            trend={parseFloat(stats.avgLatency) > 500 ? 'high' : 'good'}
          />
          <StatCard 
            title="Total Requests" 
            value={stats.totalRequests.toString()} 
            icon={<Database className="h-6 w-6 text-blue-400" />}
            subtext="Lifetime metrics"
          />
          <StatCard 
            title="Error Rate" 
            value={`${stats.errorRate}%`} 
            icon={<AlertCircle className="h-6 w-6 text-purple-400" />}
            trend={parseFloat(stats.errorRate) > 5 ? 'bad' : 'good'}
          />
          <StatCard 
            title="Peak Latency" 
            value={`${stats.peakLatency} ms`} 
            icon={<Activity className="h-6 w-6 text-pink-400" />}
            subtext="Slowest request"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Latency Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-500" />
              Response Time History (Last 30 Requests)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={latencyData}>
                  <defs>
                    <linearGradient id="colorMs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val}ms`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
                  <Area 
                    type="monotone" 
                    dataKey="ms" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorMs)" 
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Methods Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Request Methods
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={methodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Logs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Recent Requests</h3>
            <span className="text-xs text-slate-500">Showing last 10</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Endpoint</th>
                  <th className="px-6 py-3">Latency</th>
                  <th className="px-6 py-3">Size (B)</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {metrics.slice(-10).reverse().map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <StatusBadge code={m.statusCode} />
                    </td>
                    <td className="px-6 py-4 font-mono text-white">{m.method}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400">{m.endpoint}</td>
                    <td className="px-6 py-4">
                      <span className={`${(m.responseTimeMs || 0) > 500 ? 'text-orange-400' : 'text-emerald-400'}`}>
                        {(m.responseTimeMs || 0).toFixed(2)} ms
                      </span>
                    </td>
                    <td className="px-6 py-4">{m.responseSizeBytes}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {m.timestampMs ? new Date(m.timestampMs).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
                {metrics.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No metrics found. Click "Test Traffic" to generate data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-600">
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
        </div>

      </main>
    </div>
  );
};

// --- Subcomponents ---

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  subtext?: string;
  trend?: 'good' | 'bad' | 'high';
}> = ({ title, value, icon, subtext, trend }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm hover:border-slate-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
      </div>
      <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
        {icon}
      </div>
    </div>
    {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
    {trend === 'bad' && <p className="text-xs text-red-400 mt-2 flex items-center gap-1">Attention needed</p>}
    {trend === 'high' && <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">High Latency</p>}
    {trend === 'good' && <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Healthy</p>}
  </div>
);

const StatusBadge: React.FC<{ code: number }> = ({ code }) => {
  let color = 'bg-slate-700 text-slate-300';
  if (code >= 200 && code < 300) color = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  else if (code >= 300 && code < 400) color = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  else if (code >= 400 && code < 500) color = 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
  else if (code >= 500) color = 'bg-red-500/10 text-red-400 border border-red-500/20';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {code}
    </span>
  );
};

export default Dashboard;