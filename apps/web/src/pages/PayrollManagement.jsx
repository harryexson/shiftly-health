import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Clock,
  CheckCircle,
  Shield,
  Users,
  Calendar,
  Download
} from "lucide-react";
import { format } from "date-fns";

export default function PayrollManagement() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: workerEarnings = [] } = useQuery({
    queryKey: ['worker-earnings'],
    queryFn: () => base44.asServiceRole.entities.WorkerEarnings.list('-calculation_date'),
    enabled: !!user && user.role === 'admin',
  });

  const { data: payoutRequests = [] } = useQuery({
    queryKey: ['payout-requests'],
    queryFn: () => base44.asServiceRole.entities.PayoutRequest.list('-requested_date'),
    enabled: !!user && user.role === 'admin',
  });

  const { data: timeTracking = [] } = useQuery({
    queryKey: ['time-tracking'],
    queryFn: () => base44.asServiceRole.entities.ShiftTimeTracking.list('-clock_in_time'),
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

  const totalEarnings = workerEarnings.reduce((sum, e) => sum + (e.gross_earnings || 0), 0);
  const totalPlatformFees = workerEarnings.reduce((sum, e) => sum + (e.platform_service_fee || 0), 0);
  const pendingPayouts = payoutRequests.filter(p => p.status === 'pending' || p.status === 'processing');
  const completedShifts = timeTracking.filter(t => t.status === 'completed' || t.status === 'approved');

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
                  Payroll Management
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Monitor worker earnings, payouts, and platform service fees
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export Payroll Report
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-green-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Worker Earnings</p>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-blue-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Platform Service Fees</p>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">${totalPlatformFees.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">5% of earnings</p>
            </CardContent>
          </Card>

          <Card className="border-amber-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Pending Payouts</p>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{pendingPayouts.length}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100/50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Completed Shifts</p>
                <CheckCircle className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{completedShifts.length}</p>
              <p className="text-xs text-gray-500 mt-1">This period</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Worker Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {workerEarnings.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No earnings records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workerEarnings.slice(0, 20).map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{earning.staff_email}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{earning.hours_worked} hours @ ${earning.base_hourly_rate}/hr</span>
                        {earning.weekend_premium_amount > 0 && (
                          <Badge variant="outline" className="text-xs">+${earning.weekend_premium_amount.toFixed(2)} weekend</Badge>
                        )}
                        {earning.night_shift_premium_amount > 0 && (
                          <Badge variant="outline" className="text-xs">+${earning.night_shift_premium_amount.toFixed(2)} night</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">${earning.gross_earnings.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Platform fee: ${earning.platform_service_fee.toFixed(2)}</p>
                      <Badge className={
                        earning.payment_status === 'paid' ? 'bg-green-100 text-green-700 mt-1' :
                        earning.payment_status === 'available_for_payout' ? 'bg-blue-100 text-blue-700 mt-1' :
                        'bg-amber-100 text-amber-700 mt-1'
                      }>
                        {earning.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Payout Requests ({pendingPayouts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayouts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No pending payouts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPayouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="font-semibold text-gray-900">{payout.staff_email}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{payout.payout_type === 'instant' ? '⚡ Instant' : '📅 Standard'} Payout</span>
                        <span>•</span>
                        <span>Requested: {format(new Date(payout.requested_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-600">${payout.net_payout_amount.toFixed(2)}</p>
                      {payout.instant_fee_amount > 0 && (
                        <p className="text-xs text-gray-500">Fee: ${payout.instant_fee_amount.toFixed(2)}</p>
                      )}
                      <Badge className="bg-amber-100 text-amber-700 mt-1">{payout.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}