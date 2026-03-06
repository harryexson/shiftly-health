import { DollarSign, CreditCard, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Jan', mrr: 32000 },
  { month: 'Feb', mrr: 36500 },
  { month: 'Mar', mrr: 38200 },
  { month: 'Apr', mrr: 41000 },
  { month: 'May', mrr: 44800 },
  { month: 'Jun', mrr: 48290 },
];

const recentPayments = [
  { user: 'Sarah Chen', plan: 'Premium', amount: '$19.99', status: 'succeeded', date: '2024-06-15' },
  { user: 'Anna Fischer', plan: 'Enterprise', amount: '$49.99', status: 'failed', date: '2024-06-14' },
  { user: 'Raj Kapoor', plan: 'Basic', amount: '$9.99', status: 'succeeded', date: '2024-06-14' },
  { user: 'Carlos Ruiz', plan: 'Premium', amount: '$19.99', status: 'succeeded', date: '2024-06-13' },
  { user: 'Lisa Zhang', plan: 'Premium', amount: '$19.99', status: 'refunded', date: '2024-06-12' },
  { user: 'Emma Davis', plan: 'Enterprise', amount: '$49.99', status: 'succeeded', date: '2024-06-11' },
];

const planStats = [
  { plan: 'Free', users: 7240, mrr: 0, color: 'bg-gray-400' },
  { plan: 'Basic', users: 2810, mrr: '$28,071.90', color: 'bg-blue-400' },
  { plan: 'Premium', users: 2400, mrr: '$47,976.00', color: 'bg-purple-500' },
  { plan: 'Enterprise', users: 397, mrr: '$19,840.03', color: 'bg-yellow-500' },
];

const paymentStatusColors = { succeeded: 'success', failed: 'destructive', pending: 'warning', refunded: 'secondary' };

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Revenue</h1>
        <p className="text-gray-500 mt-1">Subscription management and financial overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: '$48,290', change: '+8.2%', icon: DollarSign, color: 'bg-green-500' },
          { label: 'Active Subscriptions', value: '5,607', change: '+15.3%', icon: CreditCard, color: 'bg-blue-500' },
          { label: 'MRR Growth', value: '8.2%', change: '+2.1%', icon: TrendingUp, color: 'bg-purple-500' },
          { label: 'Paying Users', value: '5,607', change: '+12.8%', icon: Users, color: 'bg-orange-500' },
        ].map(({ label, value, change, icon: Icon, color }) => (
          <Card key={label} className="card-hover">
            <CardContent className="p-5">
              <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xs text-green-600 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> {change} this month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Recurring Revenue</CardTitle>
            <CardDescription>MRR trend over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'MRR']} />
                <Bar dataKey="mrr" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan stats */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>Breakdown by subscription tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planStats.map(({ plan, users, mrr, color }) => (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{plan}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{mrr || '—'}</span>
                  </div>
                  <p className="text-xs text-gray-400 ml-4.5">{users.toLocaleString()} users</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['User', 'Plan', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentPayments.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{p.user}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{p.plan}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{p.amount}</td>
                  <td className="px-6 py-3"><Badge variant={paymentStatusColors[p.status]}>{p.status}</Badge></td>
                  <td className="px-6 py-3 text-sm text-gray-500">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
