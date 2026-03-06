import { Activity, Server, Database, Cpu, MemoryStick, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const responseTimeData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  api: Math.floor(80 + Math.random() * 60),
  db: Math.floor(10 + Math.random() * 20),
}));

const services = [
  { name: 'API Gateway', status: 'healthy', uptime: '99.98%', latency: '124ms', requests: '48.2k/hr' },
  { name: 'Supabase DB', status: 'healthy', uptime: '99.99%', latency: '12ms', requests: '120k/hr' },
  { name: 'Auth Service', status: 'healthy', uptime: '100%', latency: '45ms', requests: '8.3k/hr' },
  { name: 'Storage', status: 'healthy', uptime: '99.95%', latency: '89ms', requests: '2.1k/hr' },
  { name: 'Edge Functions', status: 'degraded', uptime: '98.2%', latency: '340ms', requests: '1.4k/hr' },
  { name: 'Email Service', status: 'healthy', uptime: '99.91%', latency: '200ms', requests: '450/hr' },
];

const recentIncidents = [
  { title: 'Edge Functions elevated latency', severity: 'warning', time: '2 hours ago', resolved: false },
  { title: 'Database connection pool briefly exhausted', severity: 'high', time: '1 day ago', resolved: true },
  { title: 'Scheduled maintenance - Auth service', severity: 'info', time: '3 days ago', resolved: true },
];

export default function SystemHealth() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Health</h1>
        <p className="text-gray-500 mt-1">Monitor infrastructure and service performance</p>
      </div>

      {/* Overall status */}
      <Card className="border-l-4 border-l-yellow-400">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Partial Degradation</p>
            <p className="text-sm text-gray-500">Edge Functions experiencing elevated latency. All other services operational.</p>
          </div>
        </CardContent>
      </Card>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(({ name, status, uptime, latency, requests }) => (
          <Card key={name} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{name}</span>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  {status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-400">Uptime</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{uptime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Latency</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{latency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Requests</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{requests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response time chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Times (24h)</CardTitle>
          <CardDescription>API and database response times over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 12 }} unit="ms" />
              <Tooltip unit="ms" />
              <Line type="monotone" dataKey="api" stroke="#8b5cf6" strokeWidth={2} dot={false} name="API" />
              <Line type="monotone" dataKey="db" stroke="#3b82f6" strokeWidth={2} dot={false} name="Database" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentIncidents.map(({ title, severity, time, resolved }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                {resolved ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                  <p className="text-xs text-gray-500">{time}</p>
                </div>
                <Badge variant={resolved ? 'success' : severity === 'high' ? 'destructive' : 'warning'}>
                  {resolved ? 'resolved' : severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
