import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const userGrowth = [
  { month: 'Jan', new: 820, churned: 120, net: 700 },
  { month: 'Feb', new: 940, churned: 90, net: 850 },
  { month: 'Mar', new: 1100, churned: 110, net: 990 },
  { month: 'Apr', new: 980, churned: 95, net: 885 },
  { month: 'May', new: 1240, churned: 130, net: 1110 },
  { month: 'Jun', new: 1380, churned: 115, net: 1265 },
];

const tierDist = [
  { name: 'Free', value: 7240, color: '#94a3b8' },
  { name: 'Basic', value: 2810, color: '#60a5fa' },
  { name: 'Premium', value: 2400, color: '#8b5cf6' },
  { name: 'Enterprise', value: 397, color: '#f59e0b' },
];

const moodTrend = [
  { date: 'Mon', avg: 3.2 },
  { date: 'Tue', avg: 3.5 },
  { date: 'Wed', avg: 3.1 },
  { date: 'Thu', avg: 3.8 },
  { date: 'Fri', avg: 4.0 },
  { date: 'Sat', avg: 4.3 },
  { date: 'Sun', avg: 3.9 },
];

const engagement = [
  { feature: 'Mood Tracking', usage: 92 },
  { feature: 'Health Metrics', usage: 67 },
  { feature: 'Insights', usage: 54 },
  { feature: 'Notifications', usage: 48 },
  { feature: 'Streaks', usage: 71 },
  { feature: 'Tags', usage: 33 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 mt-1">Marketing and product analytics for Shiftly Health</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New vs churned users per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="new" fill="#8b5cf6" name="New Users" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" fill="#f87171" name="Churned" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Current users by plan tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={tierDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {tierDist.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {tierDist.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Mood Score</CardTitle>
            <CardDescription>Platform-wide average mood this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={moodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Avg Mood" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Engagement</CardTitle>
            <CardDescription>% of active users using each feature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {engagement.map(({ feature, usage }) => (
                <div key={feature}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{usage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${usage}%`,
                        background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
