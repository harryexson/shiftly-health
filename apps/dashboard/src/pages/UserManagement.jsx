import { useState } from 'react';
import { Search, Filter, UserPlus, MoreHorizontal, Mail, Shield, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const mockUsers = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'user', tier: 'premium', status: 'active', joined: '2024-01-15', moodEntries: 142 },
  { id: '2', name: 'James Wilson', email: 'james.wilson@example.com', role: 'user', tier: 'basic', status: 'active', joined: '2024-02-03', moodEntries: 87 },
  { id: '3', name: 'Aria Patel', email: 'aria.patel@example.com', role: 'user', tier: 'premium', status: 'active', joined: '2023-11-20', moodEntries: 298 },
  { id: '4', name: 'Marcus Lee', email: 'marcus.lee@example.com', role: 'user', tier: 'free', status: 'active', joined: '2024-03-01', moodEntries: 12 },
  { id: '5', name: 'Emma Davis', email: 'emma.davis@example.com', role: 'user', tier: 'enterprise', status: 'inactive', joined: '2023-09-14', moodEntries: 0 },
  { id: '6', name: 'Tom Brown', email: 'tom.brown@example.com', role: 'support', tier: 'free', status: 'active', joined: '2023-08-01', moodEntries: 5 },
  { id: '7', name: 'Lisa Zhang', email: 'lisa.zhang@example.com', role: 'user', tier: 'premium', status: 'active', joined: '2024-01-22', moodEntries: 203 },
  { id: '8', name: 'David Kim', email: 'david.kim@example.com', role: 'admin', tier: 'enterprise', status: 'active', joined: '2023-06-10', moodEntries: 0 },
];

const tierColors = { free: 'secondary', basic: 'default', premium: 'success', enterprise: 'warning' };
const roleColors = { user: 'secondary', admin: 'destructive', support: 'default', marketing: 'warning', accounting: 'outline' };

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = mockUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.tier === filter || u.role === filter || u.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 mt-1">{mockUsers.length} total users</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Users</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Tier</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Entries</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Joined</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{user.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={roleColors[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={tierColors[user.tier]}>{user.tier}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.moodEntries}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors" title="Email user">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors" title="Manage roles">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Suspend user">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No users found matching your search.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
