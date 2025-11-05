import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Ban,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.asServiceRole.entities.User.list(),
    enabled: !!user && user.role === 'admin',
  });

  const { data: allShifts = [] } = useQuery({
    queryKey: ['all-shifts'],
    queryFn: () => base44.asServiceRole.entities.Shift.list('-created_date'),
    enabled: !!user && user.role === 'admin',
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ['all-applications'],
    queryFn: () => base44.asServiceRole.entities.ShiftApplication.list('-created_date'),
    enabled: !!user && user.role === 'admin',
  });

  const { data: allPayments = [] } = useQuery({
    queryKey: ['all-payments'],
    queryFn: () => base44.asServiceRole.entities.Payment.list('-created_date'),
    enabled: !!user && user.role === 'admin',
  });

  const { data: accountStatuses = [] } = useQuery({
    queryKey: ['account-statuses'],
    queryFn: () => base44.asServiceRole.entities.AccountStatus.list(),
    enabled: !!user && user.role === 'admin',
  });

  const { data: violations = [] } = useQuery({
    queryKey: ['violations'],
    queryFn: () => base44.asServiceRole.entities.AccountViolation.filter({ resolved: false }),
    enabled: !!user && user.role === 'admin',
  });

  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['pending-staff'],
    queryFn: () => base44.asServiceRole.entities.StaffProfile.filter({ verification_status: 'pending' }),
    enabled: !!user && user.role === 'admin',
  });

  const suspendedAccounts = accountStatuses.filter(a => a.account_status === 'suspended').length;
  const overduePayments = accountStatuses.filter(a => a.past_due_amount > 0);
  const totalOverdue = overduePayments.reduce((sum, a) => sum + (a.past_due_amount || 0), 0);
  const totalRevenue = allPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">This area is restricted to platform administrators only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100/50 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Developer Back Office
              </h1>
              <p className="text-gray-600 text-lg">Complete platform oversight and management</p>
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        {(violations.length > 0 || overduePayments.length > 0 || staffProfiles.length > 0) && (
          <div className="grid md:grid-cols-3 gap-4">
            {violations.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900">{violations.length} Active Violations</h3>
                      <p className="text-sm text-red-700 mt-1">Requires immediate attention</p>
                      <Link to={createPageUrl("Violations")}>
                        <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700">
                          Review Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {overduePayments.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-900">${totalOverdue.toFixed(2)} Overdue</h3>
                      <p className="text-sm text-amber-700 mt-1">{overduePayments.length} accounts past due</p>
                      <Link to={createPageUrl("PaymentManagement")}>
                        <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">
                          Manage Payments
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {staffProfiles.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">{staffProfiles.length} Pending Approvals</h3>
                      <p className="text-sm text-blue-700 mt-1">Staff waiting for verification</p>
                      <Link to={createPageUrl("UserApprovals")}>
                        <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
                          Review Profiles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-100/50 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{allUsers.length}</div>
              <p className="text-xs text-gray-500 mt-1">Platform-wide</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100/50 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Shifts</CardTitle>
              <Briefcase className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{allShifts.length}</div>
              <p className="text-xs text-gray-500 mt-1">{allShifts.filter(s => s.status === 'open').length} currently open</p>
            </CardContent>
          </Card>

          <Card className="border-green-100/50 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Platform Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Total collected</p>
            </CardContent>
          </Card>

          <Card className="border-red-100/50 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Suspended Accounts</CardTitle>
              <Ban className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{suspendedAccounts}</div>
              <p className="text-xs text-gray-500 mt-1">Requires review</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to={createPageUrl("AccountManagement")}>
            <Card className="border-blue-100/50 hover:shadow-xl transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-blue-600 transition-colors">
                  <Users className="w-6 h-6" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage user accounts, suspensions, and deletions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("PaymentManagement")}>
            <Card className="border-green-100/50 hover:shadow-xl transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-green-600 transition-colors">
                  <DollarSign className="w-6 h-6" />
                  Payment Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Track payments, process transactions, manage overdue accounts
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Violations")}>
            <Card className="border-red-100/50 hover:shadow-xl transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-red-600 transition-colors">
                  <AlertTriangle className="w-6 h-6" />
                  Violations & Enforcement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Handle terms violations, piracy, and enforcement actions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("UserApprovals")}>
            <Card className="border-purple-100/50 hover:shadow-xl transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-purple-600 transition-colors">
                  <UserCheck className="w-6 h-6" />
                  User Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Review and approve staff profiles and credentials
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("BillingCenter")}>
            <Card className="border-teal-100/50 hover:shadow-xl transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-teal-600 transition-colors">
                  <TrendingUp className="w-6 h-6" />
                  Billing Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Subscription management, invoicing, and revenue tracking
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("SystemSettings")}>
            <Card className="border-indigo-100/50 hover:shadow-xl transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-indigo-600 transition-colors">
                  <Shield className="w-6 h-6" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Configure platform settings and system parameters
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allApplications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">New Application</p>
                    <p className="text-xs text-gray-600">Match Score: {app.match_score}%</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(app.created_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}