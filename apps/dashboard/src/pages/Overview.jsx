import { Users, TrendingUp, HeadphonesIcon, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { label: 'Total Users', value: '12,847', change: '+12.5%', up: true, icon: Users, color: 'bg-blue-500' },
  { label: 'Monthly Revenue', value: '$48,290', change: '+8.2%', up: true, icon: DollarSign, color: 'bg-green-500' },
  { label: 'Open Tickets', value: '143', change: '-5.1%', up: false, icon: HeadphonesIcon, color: 'bg-orange-500' },
  { label: 'Active Subscriptions', value: '3,421', change: '+15.3%', up: true, icon: TrendingUp, color: 'bg-purple-500' },
];

const chartData = [
  { month: 'Jan', users: 8200, revenue: 32000 },
  { month: 'Feb', users: 9100, revenue: 36500 },
  { month: 'Mar', users: 9800, revenue: 38200 },
  { month: 'Apr', users: 10500, revenue: 41000 },
  { month: 'May', users: 11200, revenue: 44800 },
  { month: 'Jun', users: 12847, revenue: 48290 },
];

const recentActivity = [
  { user: 'Sarah Chen', action: 'Upgraded to Premium', time: '2 min ago', type: 'billing' },
  { user: 'James Wilson', action: 'Opened support ticket #1842', time: '8 min ago', type: 'support' },
  { user: 'Aria Patel', action: 'Completed 30-day streak', time: '15 min ago', type: 'achievement' },
  { user: 'Marcus Lee', action: 'New registration', time: '22 min ago', type: 'user' },
  { user: 'Emma Davis', action: 'Cancelled subscription', time: '1 hr ago', type: 'billing' },
  { user: 'Tom Brown', action: 'Ticket #1838 resolved', time: '2 hr ago', type: 'support' },
];

const typeColors = {
  billing: 'default',
  support: 'warning',
  achievement: 'success',
  user: 'secondary',
};

export default function Overview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with Shiftly Health.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, up, icon: Icon, color }) => (
          <Card key={label} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
                  {up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth Overview</CardTitle>
            <CardDescription>User growth and revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="url(#colorUsers)" name="Users" />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRevenue)" name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map(({ user, action, time, type }) => (
                <div key={time + user} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="w-3 h-3 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user}</p>
                    <p className="text-xs text-gray-500 truncate">{action}</p>
                    <p className="text-xs text-gray-400">{time}</p>
                  </div>
                  <Badge variant={typeColors[type]}>{type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>All systems operational</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'API', status: 'Operational', uptime: '99.98%' },
              { name: 'Database', status: 'Operational', uptime: '99.99%' },
              { name: 'Auth', status: 'Operational', uptime: '100%' },
              { name: 'Storage', status: 'Operational', uptime: '99.95%' },
            ].map(({ name, status, uptime }) => (
              <div key={name} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <Activity className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
                  <p className="text-xs text-green-600">{status} · {uptime}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
