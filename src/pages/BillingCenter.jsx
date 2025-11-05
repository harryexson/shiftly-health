import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
  FileText,
  Download
} from "lucide-react";
import { format } from "date-fns";

export default function BillingCenter() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: allPayments = [] } = useQuery({
    queryKey: ['billing-payments'],
    queryFn: () => base44.asServiceRole.entities.Payment.list('-created_date'),
    enabled: !!user && user.role === 'admin',
  });

  const { data: employerProfiles = [] } = useQuery({
    queryKey: ['billing-employers'],
    queryFn: () => base44.asServiceRole.entities.EmployerProfile.list(),
    enabled: !!user && user.role === 'admin',
  });

  const { data: accountStatuses = [] } = useQuery({
    queryKey: ['billing-account-statuses'],
    queryFn: () => base44.asServiceRole.entities.AccountStatus.list(),
    enabled: !!user && user.role === 'admin',
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  // Calculate billing metrics
  const totalRevenue = allPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const monthlyRevenue = allPayments
    .filter(p => {
      if (p.status !== 'completed' || !p.payment_date) return false;
      const paymentDate = new Date(p.payment_date);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayments = allPayments.filter(p => p.status === 'pending');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const overdueAccounts = accountStatuses.filter(s => s.past_due_amount > 0);
  const totalOverdue = overdueAccounts.reduce((sum, s) => sum + (s.past_due_amount || 0), 0);

  const activeSubscriptions = employerProfiles.filter(e => 
    e.subscription_status === 'active' && e.subscription_plan !== 'trial'
  ).length;

  const trialAccounts = employerProfiles.filter(e => 
    e.subscription_status === 'trial'
  ).length;

  const filteredPayments = allPayments.filter(p => 
    p.employer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-green-100/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                  Billing Center
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Comprehensive revenue tracking, subscription management, and financial oversight
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-green-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">All-time platform earnings</p>
            </CardContent>
          </Card>

          <Card className="border-blue-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">This Month</p>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">${monthlyRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Current month revenue</p>
            </CardContent>
          </Card>

          <Card className="border-amber-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Pending</p>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">${pendingAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{pendingPayments.length} pending payments</p>
            </CardContent>
          </Card>

          <Card className="border-red-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Overdue</p>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">${totalOverdue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{overdueAccounts.length} accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-purple-100/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-600 mb-2">{activeSubscriptions}</p>
              <p className="text-sm text-gray-600">Paying customers</p>
            </CardContent>
          </Card>

          <Card className="border-blue-100/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Trial Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600 mb-2">{trialAccounts}</p>
              <p className="text-sm text-gray-600">In free trial period</p>
            </CardContent>
          </Card>

          <Card className="border-teal-100/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-teal-600 mb-2">
                {trialAccounts > 0 ? Math.round((activeSubscriptions / (activeSubscriptions + trialAccounts)) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Trial to paid conversion</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {['trial', 'basic', 'premium', 'enterprise'].map(plan => {
                const count = employerProfiles.filter(e => e.subscription_plan === plan).length;
                const revenue = allPayments
                  .filter(p => {
                    const employer = employerProfiles.find(e => e.user_email === p.employer_email);
                    return employer?.subscription_plan === plan && p.status === 'completed';
                  })
                  .reduce((sum, p) => sum + (p.amount || 0), 0);

                return (
                  <div key={plan} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 uppercase mb-2">{plan}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{count}</p>
                    <p className="text-xs text-gray-600">${revenue.toFixed(2)} revenue</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Transactions</CardTitle>
              <Input
                placeholder="Search by email or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPayments.slice(0, 20).map((payment) => {
                  const employer = employerProfiles.find(e => e.user_email === payment.employer_email);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-gray-900">
                            {employer?.facility_name || payment.employer_email}
                          </p>
                          <Badge className={
                            payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {payment.status}
                          </Badge>
                          <Badge variant="outline">{payment.payment_type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-semibold text-lg text-gray-900">
                            ${payment.amount.toFixed(2)}
                          </span>
                          {payment.invoice_number && (
                            <span>INV: {payment.invoice_number}</span>
                          )}
                          {payment.payment_date && (
                            <span>{format(new Date(payment.payment_date), 'MMM d, yyyy')}</span>
                          )}
                          {payment.processed_by && (
                            <span className="text-xs">By: {payment.processed_by}</span>
                          )}
                        </div>
                      </div>
                      {payment.status === 'completed' && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Forecast */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Revenue Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Transaction</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${allPayments.length > 0 ? (totalRevenue / allPayments.filter(p => p.status === 'completed').length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Projected Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(activeSubscriptions * 200).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Based on average plan value</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allPayments.length > 0 ? Math.round((allPayments.filter(p => p.status === 'completed').length / allPayments.length) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Successful payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}