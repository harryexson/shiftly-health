import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  FileText,
  Download,
  Filter,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users
} from "lucide-react";
import { format, subDays, subMonths, differenceInDays, differenceInHours } from "date-fns";

const COLORS = {
  verified: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
  expired: '#6b7280'
};

export default function ReportsCenter() {
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [recordType, setRecordType] = useState('all');
  const [staffType, setStaffType] = useState('all');

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch all compliance records
  const { data: allRecords = [] } = useQuery({
    queryKey: ['all-compliance-records'],
    queryFn: () => base44.entities.ComplianceRecord.filter({}),
    enabled: !!user
  });

  // Fetch all staff profiles
  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['all-staff-profiles'],
    queryFn: () => base44.entities.StaffProfile.filter({}),
    enabled: !!user
  });

  // Fetch audit logs for processing times
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs-verification'],
    queryFn: () => base44.entities.AuditLog.filter({
      action: { $in: ['approve_credential', 'reject_credential'] }
    }),
    enabled: !!user
  });

  // Apply filters
  const filteredRecords = allRecords.filter(record => {
    const recordDate = new Date(record.created_date);
    const cutoffDate = subDays(new Date(), parseInt(dateRange));
    
    const dateMatch = dateRange === 'all' || recordDate >= cutoffDate;
    const typeMatch = recordType === 'all' || record.record_type === recordType;
    
    return dateMatch && typeMatch;
  });

  // Calculate metrics
  const verificationStatusCounts = {
    verified: filteredRecords.filter(r => r.verification_status === 'verified').length,
    pending: filteredRecords.filter(r => r.verification_status === 'pending').length,
    rejected: filteredRecords.filter(r => r.verification_status === 'rejected').length,
    expired: filteredRecords.filter(r => r.verification_status === 'expired').length
  };

  const totalRecords = filteredRecords.length;
  const verificationRate = totalRecords > 0 
    ? ((verificationStatusCounts.verified / totalRecords) * 100).toFixed(1)
    : 0;

  // Processing time analysis
  const processingTimes = filteredRecords
    .filter(r => r.verification_status !== 'pending' && r.verified_date)
    .map(r => {
      const created = new Date(r.created_date);
      const verified = new Date(r.verified_date);
      return differenceInHours(verified, created);
    });

  const avgProcessingTime = processingTimes.length > 0
    ? (processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length).toFixed(1)
    : 0;

  // Compliance over time (last 30 days)
  const complianceOverTime = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dayRecords = allRecords.filter(r => {
      const recordDate = new Date(r.created_date);
      return format(recordDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });

    return {
      date: format(date, 'MMM dd'),
      verified: dayRecords.filter(r => r.verification_status === 'verified').length,
      pending: dayRecords.filter(r => r.verification_status === 'pending').length,
      rejected: dayRecords.filter(r => r.verification_status === 'rejected').length
    };
  });

  // Verification status pie chart data
  const statusPieData = [
    { name: 'Verified', value: verificationStatusCounts.verified, color: COLORS.verified },
    { name: 'Pending', value: verificationStatusCounts.pending, color: COLORS.pending },
    { name: 'Rejected', value: verificationStatusCounts.rejected, color: COLORS.rejected },
    { name: 'Expired', value: verificationStatusCounts.expired, color: COLORS.expired }
  ].filter(item => item.value > 0);

  // Record type distribution
  const recordTypeData = Object.entries(
    filteredRecords.reduce((acc, record) => {
      const type = record.record_type.replace(/_/g, ' ');
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Staff compliance summary
  const staffComplianceSummary = staffProfiles.map(profile => {
    const staffRecords = allRecords.filter(r => r.user_email === profile.user_email);
    const verifiedCount = staffRecords.filter(r => r.verification_status === 'verified').length;
    const totalCount = staffRecords.length;
    
    return {
      email: profile.user_email,
      name: profile.full_name,
      staff_type: profile.staff_type,
      total_docs: totalCount,
      verified_docs: verifiedCount,
      compliance_rate: totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(0) : 0,
      verification_status: profile.verification_status
    };
  }).filter(s => staffType === 'all' || s.staff_type === staffType);

  // Export functions
  const exportToCSV = () => {
    const headers = ['Staff Email', 'Name', 'Staff Type', 'Total Documents', 'Verified', 'Compliance Rate', 'Profile Status'];
    const rows = staffComplianceSummary.map(s => [
      s.email,
      s.name,
      s.staff_type,
      s.total_docs,
      s.verified_docs,
      `${s.compliance_rate}%`,
      s.verification_status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const exportVerificationReport = () => {
    const headers = ['Document Name', 'Type', 'Staff Email', 'Status', 'Submitted Date', 'Verified Date', 'Processing Time (hrs)'];
    const rows = filteredRecords.map(r => [
      r.document_name,
      r.record_type.replace(/_/g, ' '),
      r.user_email,
      r.verification_status,
      format(new Date(r.created_date), 'yyyy-MM-dd HH:mm'),
      r.verified_date ? format(new Date(r.verified_date), 'yyyy-MM-dd HH:mm') : 'N/A',
      r.verified_date ? differenceInHours(new Date(r.verified_date), new Date(r.created_date)) : 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">Only administrators can access reports.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Verification & Compliance Reports
              </h1>
              <p className="text-gray-600">Advanced analytics and reporting for staff verification</p>
            </div>
            <FileText className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Filters */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Record Type</Label>
                <Select value={recordType} onValueChange={setRecordType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="background_check">Background Check</SelectItem>
                    <SelectItem value="license_verification">License</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="drug_test">Drug Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Staff Type</Label>
                <Select value={staffType} onValueChange={setStaffType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="licensed">Licensed</SelectItem>
                    <SelectItem value="unlicensed_dsp">DSP</SelectItem>
                    <SelectItem value="unlicensed_caregiver">Caregiver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={exportToCSV} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export Staff
                </Button>
                <Button onClick={exportVerificationReport} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export Docs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
              <p className="text-sm text-gray-600">Total Records</p>
            </CardContent>
          </Card>

          <Card className="border-green-100/50 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600 text-white">{verificationRate}%</Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{verificationStatusCounts.verified}</p>
              <p className="text-sm text-gray-600">Verified</p>
            </CardContent>
          </Card>

          <Card className="border-amber-100/50 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-amber-600" />
                <Badge className="bg-amber-600 text-white">{avgProcessingTime}h</Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{verificationStatusCounts.pending}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100/50 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-purple-600" />
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{staffProfiles.length}</p>
              <p className="text-sm text-gray-600">Total Staff</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Compliance Over Time */}
          <Card className="border-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Compliance Trend (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={complianceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="verified" stroke={COLORS.verified} strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" stroke={COLORS.pending} strokeWidth={2} />
                  <Line type="monotone" dataKey="rejected" stroke={COLORS.rejected} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Verification Status Distribution */}
          <Card className="border-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verification Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Record Type Distribution */}
          <Card className="border-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recordTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Processing Time Insights */}
          <Card className="border-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Processing Time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Average Processing Time</p>
                    <p className="text-2xl font-bold text-blue-600">{avgProcessingTime} hours</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Fastest Processing</p>
                    <p className="text-2xl font-bold text-green-600">
                      {processingTimes.length > 0 ? Math.min(...processingTimes).toFixed(1) : 0} hours
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Slowest Processing</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {processingTimes.length > 0 ? Math.max(...processingTimes).toFixed(1) : 0} hours
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Total Records Processed</p>
                  <p className="text-2xl font-bold text-purple-600">{processingTimes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* License Renewals Section */}
        <Card className="border-orange-100/50 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              License Renewals - Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringLicenses.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-gray-600">No licenses expiring in the next 60 days</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiringLicenses.map((license) => {
                  const urgency = license.days_until_expiry <= 7 ? 'critical' : 
                                  license.days_until_expiry <= 30 ? 'warning' : 'info';
                  
                  return (
                    <div 
                      key={license.id}
                      className={`p-4 rounded-lg border-2 ${
                        urgency === 'critical' ? 'bg-red-50 border-red-300' :
                        urgency === 'warning' ? 'bg-orange-50 border-orange-300' :
                        'bg-yellow-50 border-yellow-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-gray-900">{license.document_name}</p>
                            <Badge className={
                              urgency === 'critical' ? 'bg-red-600 text-white' :
                              urgency === 'warning' ? 'bg-orange-600 text-white' :
                              'bg-yellow-600 text-white'
                            }>
                              {license.days_until_expiry} days left
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p><strong>Staff:</strong> {license.user_email}</p>
                            <p><strong>Expiry Date:</strong> {format(new Date(license.expiry_date), 'MMM dd, yyyy')}</p>
                            <p className="capitalize"><strong>Type:</strong> {license.record_type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {urgency === 'critical' && <AlertTriangle className="w-6 h-6 text-red-600" />}
                          {urgency === 'warning' && <Clock className="w-6 h-6 text-orange-600" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Compliance Table */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Staff Compliance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Staff Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Docs</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Verified</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Compliance Rate</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staffComplianceSummary.slice(0, 20).map((staff, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{staff.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {staff.staff_type?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">{staff.total_docs}</td>
                      <td className="text-center py-3 px-4 font-semibold text-green-600">{staff.verified_docs}</td>
                      <td className="text-center py-3 px-4">
                        <Badge className={
                          staff.compliance_rate >= 80 ? 'bg-green-100 text-green-700' :
                          staff.compliance_rate >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {staff.compliance_rate}%
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge className={
                          staff.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                          staff.verification_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {staff.verification_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {staffComplianceSummary.length > 20 && (
                <p className="text-center text-gray-500 text-sm mt-4">
                  Showing first 20 of {staffComplianceSummary.length} staff members
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}