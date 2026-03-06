import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Star,
  Heart,
  AlertCircle,
  CheckCircle,
  Calendar,
  Briefcase,
  Download,
  BarChart3,
  XCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { format, differenceInMinutes, startOfMonth, endOfMonth, subMonths } from "date-fns";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsDashboard() {
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState('30');

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: shifts = [] } = useQuery({
    queryKey: ['employer-shifts-analytics', user?.email],
    queryFn: () => base44.entities.Shift.filter({ employer_email: user?.email }),
    enabled: !!user,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['shift-applications-analytics', user?.email],
    queryFn: () => base44.entities.ShiftApplication.filter({ employer_email: user?.email }),
    enabled: !!user,
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['staff-ratings-analytics', user?.email],
    queryFn: () => base44.entities.StaffRating.filter({ employer_email: user?.email }),
    enabled: !!user,
  });

  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['staff-profiles-analytics'],
    queryFn: () => base44.asServiceRole.entities.StaffProfile.list(),
    enabled: !!user,
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ['facility-preferences-analytics', user?.email],
    queryFn: () => base44.entities.FacilityStaffPreference.filter({ employer_email: user?.email }),
    enabled: !!user,
  });

  const { data: timeTracking = [] } = useQuery({
    queryKey: ['time-tracking-analytics', user?.email],
    queryFn: () => base44.entities.ShiftTimeTracking.filter({ employer_email: user?.email }),
    enabled: !!user,
  });

  const filterByDateRange = (items, dateField = 'created_date') => {
    if (!dateRange || dateRange === 'all') return items;
    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    return items.filter(item => new Date(item[dateField]) >= cutoffDate);
  };

  const filteredShifts = filterByDateRange(shifts);
  const filteredApplications = filterByDateRange(applications, 'applied_date');
  const filteredRatings = filterByDateRange(ratings, 'rating_date');

  const calculateFillTimeByPosition = () => {
    const fillTimes = {};
    
    filteredShifts.forEach(shift => {
      if (shift.status === 'filled' || shift.status === 'completed') {
        const acceptedApp = applications.find(
          app => app.shift_id === shift.id && app.status === 'accepted'
        );
        
        if (acceptedApp) {
          const postedTime = new Date(shift.created_date);
          const acceptedTime = new Date(acceptedApp.response_date);
          const minutesToFill = differenceInMinutes(acceptedTime, postedTime);
          
          if (!fillTimes[shift.staff_type_required]) {
            fillTimes[shift.staff_type_required] = { total: 0, count: 0 };
          }
          fillTimes[shift.staff_type_required].total += minutesToFill;
          fillTimes[shift.staff_type_required].count += 1;
        }
      }
    });

    return Object.entries(fillTimes).map(([type, data]) => ({
      position: type === 'licensed' ? 'RN/LPN' : type === 'unlicensed_dsp' ? 'DSP' : 'Caregiver',
      avgMinutes: Math.round(data.total / data.count),
      avgHours: (data.total / data.count / 60).toFixed(1),
      shifts: data.count
    }));
  };

  const calculateCostSavings = () => {
    const completedShifts = filteredShifts.filter(s => s.status === 'completed');
    let totalHealthStaffCost = 0;
    let totalAgencyCost = 0;

    completedShifts.forEach(shift => {
      const tracking = timeTracking.find(t => t.shift_id === shift.id);
      const hours = tracking?.total_hours || 8;
      const healthstaffCost = (shift.hourly_rate * hours) * 1.10;
      const agencyCost = (shift.hourly_rate * hours) * 1.6;
      
      totalHealthStaffCost += healthstaffCost;
      totalAgencyCost += agencyCost;
    });

    const savings = totalAgencyCost - totalHealthStaffCost;
    const savingsPercentage = totalAgencyCost > 0 
      ? ((savings / totalAgencyCost) * 100).toFixed(1)
      : 0;

    return {
      healthStaffCost: totalHealthStaffCost,
      agencyCost: totalAgencyCost,
      savings: savings,
      savingsPercentage: savingsPercentage,
      shiftsAnalyzed: completedShifts.length
    };
  };

  const getTopRatedStaff = () => {
    const staffRatings = {};
    
    filteredRatings.forEach(rating => {
      if (!staffRatings[rating.staff_email]) {
        staffRatings[rating.staff_email] = {
          email: rating.staff_email,
          ratings: [],
          totalRating: 0,
          count: 0
        };
      }
      
      staffRatings[rating.staff_email].ratings.push(rating.overall_rating);
      staffRatings[rating.staff_email].totalRating += rating.overall_rating;
      staffRatings[rating.staff_email].count += 1;
    });

    return Object.values(staffRatings)
      .map(staff => {
        const profile = staffProfiles.find(p => p.user_email === staff.email);
        return {
          name: profile?.full_name || staff.email,
          email: staff.email,
          avgRating: (staff.totalRating / staff.count).toFixed(2),
          shiftsWorked: staff.count,
          isFavorite: preferences.some(p => p.staff_email === staff.email && p.preference_type === 'favorite')
        };
      })
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);
  };

  const calculateRetentionRate = () => {
    const staffShiftCounts = {};
    
    filteredShifts.forEach(shift => {
      if (shift.status === 'completed' || shift.status === 'filled') {
        const acceptedApp = applications.find(
          app => app.shift_id === shift.id && app.status === 'accepted'
        );
        
        if (acceptedApp) {
          if (!staffShiftCounts[acceptedApp.staff_email]) {
            staffShiftCounts[acceptedApp.staff_email] = 0;
          }
          staffShiftCounts[acceptedApp.staff_email] += 1;
        }
      }
    });

    const uniqueStaff = Object.keys(staffShiftCounts).length;
    const rehiredStaff = Object.values(staffShiftCounts).filter(count => count > 1).length;
    const retentionRate = uniqueStaff > 0 ? ((rehiredStaff / uniqueStaff) * 100).toFixed(1) : 0;

    const favoritesWhoWorked = preferences.filter(p => 
      p.preference_type === 'favorite' && 
      Object.keys(staffShiftCounts).includes(p.staff_email)
    ).length;

    return {
      uniqueStaff,
      rehiredStaff,
      retentionRate,
      totalFavorites: preferences.filter(p => p.preference_type === 'favorite').length,
      favoritesWhoWorked,
      averageShiftsPerStaff: uniqueStaff > 0 
        ? (Object.values(staffShiftCounts).reduce((a, b) => a + b, 0) / uniqueStaff).toFixed(1)
        : 0
    };
  };

  const calculateUtilization = () => {
    const totalShifts = filteredShifts.length;
    const filledShifts = filteredShifts.filter(s => s.status === 'filled' || s.status === 'completed').length;
    const cancelledShifts = filteredShifts.filter(s => s.status === 'cancelled').length;
    
    const noShows = timeTracking.filter(t => 
      t.status === 'disputed' || 
      (t.clock_in_time === null && filteredShifts.find(s => s.id === t.shift_id)?.status === 'filled')
    ).length;

    const utilizationRate = totalShifts > 0 ? ((filledShifts / totalShifts) * 100).toFixed(1) : 0;
    const noShowRate = filledShifts > 0 ? ((noShows / filledShifts) * 100).toFixed(1) : 0;

    return {
      totalShifts,
      filledShifts,
      openShifts: filteredShifts.filter(s => s.status === 'open').length,
      cancelledShifts,
      utilizationRate,
      noShows,
      noShowRate
    };
  };

  const getMonthlyTrends = () => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthShifts = shifts.filter(s => {
        const shiftDate = new Date(s.shift_date);
        return shiftDate >= monthStart && shiftDate <= monthEnd;
      });

      const monthApplications = applications.filter(a => {
        const appDate = new Date(a.applied_date);
        return appDate >= monthStart && appDate <= monthEnd;
      });

      last6Months.push({
        month: format(date, 'MMM yyyy'),
        shifts: monthShifts.length,
        filled: monthShifts.filter(s => s.status === 'filled' || s.status === 'completed').length,
        applications: monthApplications.length
      });
    }
    return last6Months;
  };

  const fillTimeData = calculateFillTimeByPosition();
  const costSavings = calculateCostSavings();
  const topStaff = getTopRatedStaff();
  const retention = calculateRetentionRate();
  const utilization = calculateUtilization();
  const monthlyTrends = getMonthlyTrends();

  const positionDistribution = [
    { name: 'RN/LPN', value: filteredShifts.filter(s => s.staff_type_required === 'licensed').length },
    { name: 'DSP', value: filteredShifts.filter(s => s.staff_type_required === 'unlicensed_dsp').length },
    { name: 'Caregiver', value: filteredShifts.filter(s => s.staff_type_required === 'unlicensed_caregiver').length }
  ].filter(item => item.value > 0);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-blue-100/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription className="mt-2">
                  Comprehensive insights into your facility's staffing performance
                </CardDescription>
              </div>
              
              <div className="flex gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Avg Fill Time</p>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {fillTimeData.length > 0 
                  ? `${Math.round(fillTimeData.reduce((sum, d) => sum + d.avgMinutes, 0) / fillTimeData.length)} min`
                  : 'N/A'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">Per shift posted</p>
            </CardContent>
          </Card>

          <Card className="border-green-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Cost Savings</p>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                ${costSavings.savings.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {costSavings.savingsPercentage}% vs agencies
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Staff Retention</p>
                <Heart className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {retention.retentionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Rehire rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Utilization Rate</p>
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {utilization.utilizationRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Shifts filled
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Average Fill Time by Position Type
            </CardTitle>
            <CardDescription>
              How quickly shifts are filled based on staff type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fillTimeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fillTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'avgMinutes' ? `${value} minutes` : value,
                        name === 'avgMinutes' ? 'Average Fill Time' : name
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="avgMinutes" fill="#3B82F6" name="Avg Fill Time (min)" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  {fillTimeData.map((item, idx) => (
                    <div key={idx} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="font-semibold text-gray-900">{item.position}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-blue-600">{item.avgMinutes}</span>
                        <span className="text-sm text-gray-600">min avg</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.shifts} shifts analyzed</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No completed shifts to analyze yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Cost Savings vs Traditional Agencies
              </CardTitle>
              <CardDescription>
                Compare your costs with traditional staffing agencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {costSavings.shiftsAnalyzed > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border-2 border-green-200">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-2">Total Savings</p>
                      <p className="text-4xl font-bold text-green-600">
                        ${costSavings.savings.toFixed(2)}
                      </p>
                      <p className="text-lg text-gray-700 mt-2">
                        {costSavings.savingsPercentage}% saved
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Traditional Agency Cost</p>
                        <p className="text-xs text-gray-600">60% markup on staff wages</p>
                      </div>
                      <p className="text-xl font-bold text-red-600">
                        ${costSavings.agencyCost.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <div>
                        <p className="text-sm font-semibold text-teal-900">HealthStaff Connect</p>
                        <p className="text-xs text-teal-700">10% platform fee only</p>
                      </div>
                      <p className="text-xl font-bold text-teal-600">
                        ${costSavings.healthStaffCost.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm font-semibold text-green-900">Your Savings</p>
                        <p className="text-xs text-green-700">Money saved using our platform</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">
                        ${costSavings.savings.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Based on {costSavings.shiftsAnalyzed} completed shifts
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Complete shifts to see savings analysis</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Position Type Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of shifts by staff type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positionDistribution.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={positionDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {positionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    {positionDistribution.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{item.value} shifts</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No shift data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Top-Rated Staff Performance
            </CardTitle>
            <CardDescription>
              Your highest-rated healthcare professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topStaff.length > 0 ? (
              <div className="space-y-3">
                {topStaff.map((staff, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      idx === 0 
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-yellow-400 text-white' :
                        idx === 1 ? 'bg-gray-300 text-gray-700' :
                        idx === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {idx + 1}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{staff.name}</p>
                          {staff.isFavorite && (
                            <Badge className="bg-pink-100 text-pink-700">
                              <Heart className="w-3 h-3 mr-1 fill-current" />
                              Favorite
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{staff.shiftsWorked} shifts completed</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-xl font-bold text-gray-900">{staff.avgRating}</span>
                      </div>
                      <p className="text-xs text-gray-500">avg rating</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No staff ratings yet</p>
                <p className="text-sm text-gray-400 mt-2">Rate staff after shifts to see performance data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                Staff Retention & Rehire Rate
              </CardTitle>
              <CardDescription>
                How often staff return for additional shifts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border-2 border-pink-200 text-center">
                  <p className="text-sm text-gray-600 mb-2">Retention Rate</p>
                  <p className="text-5xl font-bold text-pink-600 mb-2">
                    {retention.retentionRate}%
                  </p>
                  <p className="text-sm text-gray-700">
                    {retention.rehiredStaff} of {retention.uniqueStaff} staff worked multiple shifts
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Unique Staff</p>
                    <p className="text-2xl font-bold text-blue-600">{retention.uniqueStaff}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Avg Shifts/Staff</p>
                    <p className="text-2xl font-bold text-purple-600">{retention.averageShiftsPerStaff}</p>
                  </div>

                  <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                    <p className="text-sm text-gray-600 mb-1">Favorites</p>
                    <p className="text-2xl font-bold text-pink-600">{retention.totalFavorites}</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Favorites Worked</p>
                    <p className="text-2xl font-bold text-green-600">{retention.favoritesWhoWorked}</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900">
                    <strong>💡 Tip:</strong> Staff who work multiple shifts are {retention.retentionRate}% more likely 
                    to accept future shifts. Build your favorites list!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Facility Utilization & Reliability
              </CardTitle>
              <CardDescription>
                Shift fill rates and no-show tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 border-2 border-teal-200 text-center">
                  <p className="text-sm text-gray-600 mb-2">Utilization Rate</p>
                  <p className="text-5xl font-bold text-teal-600 mb-2">
                    {utilization.utilizationRate}%
                  </p>
                  <p className="text-sm text-gray-700">
                    {utilization.filledShifts} of {utilization.totalShifts} shifts filled
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-gray-600">Filled</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{utilization.filledShifts}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-gray-600">Open</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{utilization.openShifts}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-gray-600" />
                      <p className="text-sm text-gray-600">Cancelled</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-600">{utilization.cancelledShifts}</p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-gray-600">No-Shows</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{utilization.noShows}</p>
                    <p className="text-xs text-red-600 mt-1">{utilization.noShowRate}% rate</p>
                  </div>
                </div>

                {parseFloat(utilization.noShowRate) > 5 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-900">
                      <strong>⚠️ Alert:</strong> No-show rate is above 5%. Consider using favorite staff more frequently.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              6-Month Trend Analysis
            </CardTitle>
            <CardDescription>
              Track shifts, applications, and fill rates over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyTrends.some(m => m.shifts > 0) ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorShifts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFilled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="shifts" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorShifts)" 
                    name="Total Shifts"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="filled" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorFilled)" 
                    name="Filled Shifts"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.3}
                    name="Applications"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Not enough historical data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}