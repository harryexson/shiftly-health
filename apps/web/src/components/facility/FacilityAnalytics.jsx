import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPie, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function FacilityAnalytics({ user, shifts, applications, serviceFees }) {
  const [timeRange, setTimeRange] = useState("30");

  const daysAgo = parseInt(timeRange);
  const cutoffDate = subDays(new Date(), daysAgo);

  const filteredShifts = shifts.filter(s => isAfter(new Date(s.created_date), cutoffDate));
  const filteredApps = applications.filter(a => isAfter(new Date(a.created_date), cutoffDate));

  // Calculate metrics
  const totalShifts = filteredShifts.length;
  const filledShifts = filteredShifts.filter(s => s.status === 'filled' || s.status === 'completed').length;
  const fillRate = totalShifts > 0 ? Math.round((filledShifts / totalShifts) * 100) : 0;
  
  const totalApplicants = filteredApps.length;
  const acceptedApps = filteredApps.filter(a => a.status === 'accepted').length;
  const acceptRate = totalApplicants > 0 ? Math.round((acceptedApps / totalApplicants) * 100) : 0;

  const totalSpend = filteredShifts.reduce((sum, s) => {
    if (s.status === 'completed' || s.status === 'filled') {
      return sum + (s.hourly_rate * 8 * (s.positions_filled || 1));
    }
    return sum;
  }, 0);

  const avgRate = filteredShifts.length > 0
    ? filteredShifts.reduce((sum, s) => sum + s.hourly_rate, 0) / filteredShifts.length
    : 0;

  // Charts data
  const shiftsByDay = [];
  for (let i = daysAgo - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MMM d');
    const dayShifts = filteredShifts.filter(s => 
      format(new Date(s.created_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    shiftsByDay.push({
      date: dateStr,
      shifts: dayShifts.length,
      filled: dayShifts.filter(s => s.status === 'filled' || s.status === 'completed').length
    });
  }

  const staffTypeData = [
    { name: 'Licensed', value: filteredShifts.filter(s => s.staff_type_required === 'licensed').length },
    { name: 'DSP', value: filteredShifts.filter(s => s.staff_type_required === 'unlicensed_dsp').length },
    { name: 'Caregiver', value: filteredShifts.filter(s => s.staff_type_required === 'unlicensed_caregiver').length }
  ].filter(d => d.value > 0);

  const urgentVsRegular = [
    { name: 'Urgent', value: filteredShifts.filter(s => s.urgent).length },
    { name: 'Regular', value: filteredShifts.filter(s => !s.urgent).length }
  ].filter(d => d.value > 0);

  const spendByWeek = [];
  const weeksToShow = Math.ceil(daysAgo / 7);
  for (let i = weeksToShow - 1; i >= 0; i--) {
    const weekEnd = subDays(new Date(), i * 7);
    const weekStart = subDays(weekEnd, 6);
    const weekShifts = filteredShifts.filter(s => {
      const shiftDate = new Date(s.shift_date);
      return isAfter(shiftDate, weekStart) && !isAfter(shiftDate, weekEnd);
    });
    const weekSpend = weekShifts.reduce((sum, s) => {
      if (s.status === 'completed' || s.status === 'filled') {
        return sum + (s.hourly_rate * 8 * (s.positions_filled || 1));
      }
      return sum;
    }, 0);
    spendByWeek.push({
      week: `Week ${weeksToShow - i}`,
      spend: weekSpend
    });
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Hiring Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shifts</p>
                <p className="text-3xl font-bold text-gray-900">{totalShifts}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <Badge className="bg-blue-100 text-blue-700">{filledShifts} filled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fill Rate</p>
                <p className="text-3xl font-bold text-gray-900">{fillRate}%</p>
              </div>
              {fillRate >= 70 ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Industry avg: 65%</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applicants</p>
                <p className="text-3xl font-bold text-gray-900">{totalApplicants}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <Badge className="bg-green-100 text-green-700">{acceptRate}% accepted</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spend</p>
                <p className="text-3xl font-bold text-gray-900">${totalSpend.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-teal-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Avg rate: ${avgRate.toFixed(0)}/hr</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shifts Posted Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shiftsByDay.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="shifts" fill="#3B82F6" name="Posted" />
                  <Bar dataKey="filled" fill="#10B981" name="Filled" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendByWeek}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="spend" stroke="#14B8A6" strokeWidth={2} dot={{ fill: '#14B8A6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shifts by Staff Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {staffTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={staffTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {staffTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Urgent vs Regular Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {urgentVsRegular.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={urgentVsRegular}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#EF4444" />
                      <Cell fill="#3B82F6" />
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg text-amber-900">💡 Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-amber-800">
            {fillRate < 70 && (
              <li>• Your fill rate is below average. Consider increasing hourly rates or posting earlier.</li>
            )}
            {avgRate < 25 && (
              <li>• Your average rate (${avgRate.toFixed(0)}/hr) is below market. Competitive rates attract more applicants.</li>
            )}
            {acceptRate < 50 && totalApplicants > 5 && (
              <li>• You're rejecting many applicants. Review your qualification requirements.</li>
            )}
            {urgentVsRegular.find(d => d.name === 'Urgent')?.value > totalShifts * 0.3 && (
              <li>• Many of your shifts are urgent. Use recurring shifts to plan ahead and reduce costs.</li>
            )}
            {totalShifts === 0 && (
              <li>• No shifts posted in this period. Start posting to see analytics!</li>
            )}
            {fillRate >= 80 && (
              <li>• ✅ Excellent fill rate! Your competitive rates are attracting quality staff.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}