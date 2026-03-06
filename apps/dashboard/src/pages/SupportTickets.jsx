import { useState } from 'react';
import { Search, ChevronDown, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const mockTickets = [
  { id: 'T-1842', user: 'James Wilson', subject: 'Cannot log mood - app crashes on submit', status: 'open', priority: 'high', created: '2024-06-15', assignee: 'Tom Brown' },
  { id: 'T-1841', user: 'Anna Fischer', subject: 'Billing charge appeared twice this month', status: 'in_progress', priority: 'urgent', created: '2024-06-14', assignee: 'Support Bot' },
  { id: 'T-1840', user: 'Raj Kapoor', subject: 'Request to export all health data', status: 'open', priority: 'medium', created: '2024-06-14', assignee: null },
  { id: 'T-1839', user: 'Fiona Green', subject: 'Password reset email not arriving', status: 'resolved', priority: 'high', created: '2024-06-13', assignee: 'Tom Brown' },
  { id: 'T-1838', user: 'Carlos Ruiz', subject: 'Charts not loading on insights page', status: 'resolved', priority: 'medium', created: '2024-06-12', assignee: 'Tom Brown' },
  { id: 'T-1837', user: 'Nina Peterson', subject: 'Wrong subscription plan shown', status: 'closed', priority: 'low', created: '2024-06-11', assignee: 'Tom Brown' },
  { id: 'T-1836', user: 'Wei Zhang', subject: 'Feature request: weekly mood reports email', status: 'open', priority: 'low', created: '2024-06-10', assignee: null },
];

const statusConfig = {
  open: { color: 'warning', icon: Clock, label: 'Open' },
  in_progress: { color: 'default', icon: MessageSquare, label: 'In Progress' },
  resolved: { color: 'success', icon: CheckCircle, label: 'Resolved' },
  closed: { color: 'secondary', icon: CheckCircle, label: 'Closed' },
};

const priorityConfig = {
  low: 'secondary',
  medium: 'default',
  high: 'warning',
  urgent: 'destructive',
};

export default function SupportTickets() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockTickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.user.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    open: mockTickets.filter(t => t.status === 'open').length,
    in_progress: mockTickets.filter(t => t.status === 'in_progress').length,
    resolved: mockTickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
        <p className="text-gray-500 mt-1">Manage and respond to customer support requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open', value: counts.open, color: 'bg-orange-500', icon: Clock },
          { label: 'In Progress', value: counts.in_progress, color: 'bg-blue-500', icon: MessageSquare },
          { label: 'Resolved', value: counts.resolved, color: 'bg-green-500', icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="card-hover">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Subject</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Priority</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Assignee</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(ticket => {
                const { color, icon: StatusIcon } = statusConfig[ticket.status];
                return (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-sm font-mono text-brand-600">{ticket.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">{ticket.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{ticket.user}</td>
                    <td className="px-6 py-4">
                      <Badge variant={color}>{ticket.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={priorityConfig[ticket.priority]}>{ticket.priority}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{ticket.assignee || <span className="text-gray-300">Unassigned</span>}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{ticket.created}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
