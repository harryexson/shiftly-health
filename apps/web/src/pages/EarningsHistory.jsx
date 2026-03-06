import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  FileText
} from "lucide-react";
import { format } from "date-fns";

export default function EarningsHistory() {
  const [user, setUser] = useState(null);
  const [regionSettings, setRegionSettings] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const userRegion = await base44.entities.RegionSettings.filter({ 
        user_email: currentUser.email 
      });
      if (userRegion.length > 0) {
        setRegionSettings(userRegion[0]);
      } else {
        setRegionSettings({ currency: "USD", region: "USA" });
      }
    };
    loadUser();
  }, []);

  const { data: allEarnings = [] } = useQuery({
    queryKey: ['all-earnings', user?.email],
    queryFn: () => base44.entities.WorkerEarnings.filter({
      staff_email: user?.email
    }, '-calculation_date'),
    enabled: !!user,
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['all-payouts', user?.email],
    queryFn: () => base44.entities.PayoutRequest.filter({
      staff_email: user?.email
    }, '-requested_date'),
    enabled: !!user,
  });

  const getCurrencySymbol = () => {
    switch (regionSettings?.currency) {
      case 'USD': return '$';
      case 'CAD': return 'C$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return '$';
    }
  };

  const totalEarned = allEarnings.reduce((sum, e) => sum + e.worker_net_pay, 0);
  const totalPaidOut = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.net_payout_amount, 0);

  const thisMonth = allEarnings.filter(e => {
    const date = new Date(e.calculation_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthlyEarnings = thisMonth.reduce((sum, e) => sum + e.worker_net_pay, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-purple-100/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  Earnings History
                </CardTitle>
                <p className="text-gray-600 mt-2">Track all your earnings and payouts</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-green-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Earned</p>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{getCurrencySymbol()}{totalEarned.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">This Month</p>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{getCurrencySymbol()}{monthlyEarnings.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{thisMonth.length} shifts</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Shifts</p>
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{allEarnings.length}</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-teal-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Paid Out</p>
                <TrendingUp className="w-5 h-5 text-teal-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{getCurrencySymbol()}{totalPaidOut.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{payouts.filter(p => p.status === 'completed').length} payouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Earnings ({allEarnings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allEarnings.map((earning) => (
                <div key={earning.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={
                          earning.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                          earning.payment_status === 'available_for_payout' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }>
                          {earning.payment_status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-gray-600">
                          {format(new Date(earning.calculation_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <span>{earning.hours_worked} hours @ {getCurrencySymbol()}{earning.base_hourly_rate}/hr</span>
                        <span>Base: {getCurrencySymbol()}{earning.base_pay.toFixed(2)}</span>
                        {earning.weekend_premium_amount > 0 && (
                          <span className="text-orange-600">Weekend: +{getCurrencySymbol()}{earning.weekend_premium_amount.toFixed(2)}</span>
                        )}
                        {earning.night_shift_premium_amount > 0 && (
                          <span className="text-purple-600">Night: +{getCurrencySymbol()}{earning.night_shift_premium_amount.toFixed(2)}</span>
                        )}
                        {earning.urgent_bonus > 0 && (
                          <span className="text-red-600">Urgent: +{getCurrencySymbol()}{earning.urgent_bonus.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {getCurrencySymbol()}{earning.worker_net_pay.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Gross Earnings</p>
                    </div>
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