import { useState } from 'react';
import { Search, FileText, User, Shield, CreditCard, Settings } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

const mockLogs = [
  { id: 'al-001', user: 'david.kim@example.com', action: 'user.role_changed', resource: 'profiles', resourceId: 'usr-042', ip: '192.168.1.1', time: '2024-06-15 14:32:01', severity: 'high' },
  { id: 'al-002', user: 'sarah.chen@example.com', action: 'subscription.upgraded', resource: 'user_subscriptions', resourceId: 'sub-198', ip: '10.0.0.42', time: '2024-06-15 13:15:22', severity: 'info' },
  { id: 'al-003', user: 'tom.brown@example.com', action: 'ticket.status_changed', resource: 'support_tickets', resourceId: 'T-1839', ip: '10.0.0.7', time: '2024-06-15 12:48:55', severity: 'info' },
  { id: 'al-004', user: 'system', action: 'auth.failed_login', resource: 'auth', resourceId: null, ip: '45.33.32.156', time: '2024-06-15 11:30:00', severity: 'warning' },
  { id: 'al-005', user: 'david.kim@example.com', action: 'api_key.created', resource: 'api_keys', resourceId: 'key-012', ip: '192.168.1.1', time: '2024-06-15 10:22:17', severity: 'medium' },
  { id: 'al-006', user: 'anna.fischer@example.com', action: 'payment.refunded', resource: 'payments', resourceId: 'pay-447', ip: '10.0.0.42', time: '2024-06-14 16:05:33', severity: 'high' },
  { id: 'al-007', user: 'system', action: 'plan.updated', resource: 'subscription_plans', resourceId: 'plan-003', ip: 'internal', time: '2024-06-14 09:00:00', severity: 'medium' },
  { id: 'al-008', user: 'marcus.lee@example.com', action: 'user.registered', resource: 'profiles', resourceId: 'usr-299', ip: '203.0.113.5', time: '2024-06-14 08:42:11', severity: 'info' },
];

const actionIcons = {
  'user.': User,
  'auth.': Shield,
  'subscription.': CreditCard,
  'payment.': CreditCard,
  'ticket.': FileText,
  'api_key.': Settings,
  'plan.': Settings,
};

const severityColors = { info: 'secondary', medium: 'default', warning: 'warning', high: 'destructive' };

function getIcon(action) {
  for (const [prefix, Icon] of Object.entries(actionIcons)) {
    if (action.startsWith(prefix)) return Icon;
  }
  return FileText;
}

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = mockLogs.filter(log => {
    const matchSearch = log.action.includes(search.toLowerCase()) ||
      log.user.includes(search.toLowerCase()) ||
      log.resource.includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
        <p className="text-gray-500 mt-1">Track all administrative and system actions</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Severity</option>
          <option value="info">Info</option>
          <option value="medium">Medium</option>
          <option value="warning">Warning</option>
          <option value="high">High</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Time', 'User', 'Action', 'Resource', 'IP Address', 'Severity'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono text-xs">
              {filtered.map(log => {
                const Icon = getIcon(log.action);
                return (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{log.time}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{log.user}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-brand-500 flex-shrink-0" />
                        <span className="text-brand-700 dark:text-brand-400">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{log.resource}</td>
                    <td className="px-6 py-3 text-gray-500">{log.ip}</td>
                    <td className="px-6 py-3">
                      <Badge variant={severityColors[log.severity]}>{log.severity}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No logs found matching your filters.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
