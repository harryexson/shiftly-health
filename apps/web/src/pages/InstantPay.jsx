import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export default function InstantPay() {
  const [user, setUser] = useState(null);
  const [regionSettings, setRegionSettings] = useState(null);
  const [selectedEarnings, setSelectedEarnings] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [payoutType, setPayoutType] = useState("instant");
  const queryClient = useQueryClient();

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
        // Default to USD if no region set
        setRegionSettings({ currency: "USD", region: "USA" });
      }
    };
    loadUser();
  }, []);

  const { data: availableEarnings = [] } = useQuery({
    queryKey: ['available-earnings', user?.email],
    queryFn: () => base44.entities.WorkerEarnings.filter({
      staff_email: user?.email,
      payment_status: 'available_for_payout'
    }, '-calculation_date'),
    enabled: !!user,
  });

  const { data: payoutHistory = [] } = useQuery({
    queryKey: ['payout-history', user?.email],
    queryFn: () => base44.entities.PayoutRequest.filter({
      staff_email: user?.email
    }, '-requested_date', 20),
    enabled: !!user,
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async ({ earningsIds, type }) => {
      const earnings = availableEarnings.filter(e => earningsIds.includes(e.id));
      const grossAmount = earnings.reduce((sum, e) => sum + e.worker_net_pay, 0);
      
      const instantFee = type === 'instant' ? grossAmount * 0.015 : 0;
      const netAmount = grossAmount - instantFee;

      const estimatedArrival = new Date();
      if (type === 'instant') {
        estimatedArrival.setMinutes(estimatedArrival.getMinutes() + 30);
      } else {
        estimatedArrival.setDate(estimatedArrival.getDate() + 2);
      }

      await base44.entities.PayoutRequest.create({
        staff_email: user.email,
        earnings_ids: earningsIds,
        gross_amount: grossAmount,
        payout_type: type,
        instant_fee_amount: instantFee,
        net_payout_amount: netAmount,
        currency: regionSettings.currency,
        payment_method: "bank_account",
        payment_processor: "Stripe Connect",
        status: "processing",
        requested_date: new Date().toISOString(),
        estimated_arrival: estimatedArrival.toISOString()
      });

      // Update earnings status
      for (const id of earningsIds) {
        await base44.entities.WorkerEarnings.update(id, {
          payment_status: 'paid'
        });
      }

      // Create notification
      await base44.entities.Notification.create({
        user_email: user.email,
        type: 'payment_due',
        title: type === 'instant' ? 'Instant Payout Processing' : 'Standard Payout Initiated',
        message: `Your ${getCurrencySymbol()}${netAmount.toFixed(2)} payout is being processed. ${type === 'instant' ? 'Funds will arrive within 30 minutes.' : 'Funds will arrive in 2-3 business days.'}`,
        priority: 'high',
        status: 'unread'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-earnings'] });
      queryClient.invalidateQueries({ queryKey: ['payout-history'] });
      setShowConfirmDialog(false);
      setSelectedEarnings([]);
    },
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

  const totalAvailable = availableEarnings.reduce((sum, e) => sum + e.worker_net_pay, 0);
  const selectedTotal = availableEarnings
    .filter(e => selectedEarnings.includes(e.id))
    .reduce((sum, e) => sum + e.worker_net_pay, 0);

  const instantFee = selectedTotal * 0.015;
  const instantNet = selectedTotal - instantFee;

  const toggleEarning = (id) => {
    setSelectedEarnings(prev => 
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const handlePayoutRequest = (type) => {
    setPayoutType(type);
    setShowConfirmDialog(true);
  };

  const confirmPayout = () => {
    if (selectedEarnings.length === 0) {
      alert('Please select at least one shift to cash out');
      return;
    }
    requestPayoutMutation.mutate({ earningsIds: selectedEarnings, type: payoutType });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-green-100/50 bg-gradient-to-br from-white to-green-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  Earned Wage Access
                </CardTitle>
                <p className="text-gray-600 mt-2">Get paid instantly for completed shifts - no waiting for payday</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {getCurrencySymbol()}{totalAvailable.toFixed(2)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Value Proposition Banner */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Lightning Fast</p>
                  <p className="text-xs text-blue-700">Money in your account within 30 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-teal-900 text-sm">Flexible Options</p>
                  <p className="text-xs text-teal-700">Choose instant or standard - you decide</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900 text-sm">Transparent Fees</p>
                  <p className="text-xs text-purple-700">Only 1.5% for instant - or wait 2-3 days for free</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout Options */}
        {selectedEarnings.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handlePayoutRequest('instant')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-900">Instant Pay</h3>
                      <p className="text-sm text-blue-700">Get it now</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Selected Amount:</span>
                    <span className="font-semibold text-gray-900">{getCurrencySymbol()}{selectedTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span>Instant Fee (1.5%):</span>
                    <span className="font-semibold">-{getCurrencySymbol()}{instantFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-blue-900">You Receive:</span>
                    <span className="text-2xl font-bold text-blue-600">{getCurrencySymbol()}{instantNet.toFixed(2)}</span>
                  </div>
                  <div className="bg-blue-600 text-white rounded-lg p-3 text-center">
                    <p className="font-semibold text-sm">⚡ Arrives in 30 Minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-teal-100 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handlePayoutRequest('standard')}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-900">Standard Pay</h3>
                      <p className="text-sm text-green-700">Maximum amount</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-green-600" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Selected Amount:</span>
                    <span className="font-semibold text-gray-900">{getCurrencySymbol()}{selectedTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span>Processing Fee:</span>
                    <span className="font-semibold">{getCurrencySymbol()}0.00</span>
                  </div>
                  <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-green-900">You Receive:</span>
                    <span className="text-2xl font-bold text-green-600">{getCurrencySymbol()}{selectedTotal.toFixed(2)}</span>
                  </div>
                  <div className="bg-green-600 text-white rounded-lg p-3 text-center">
                    <p className="font-semibold text-sm">📅 Arrives in 2-3 Business Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Earnings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Available to Cash Out ({availableEarnings.length} shifts)</CardTitle>
              {selectedEarnings.length > 0 && (
                <Badge className="bg-blue-600 text-white">
                  {selectedEarnings.length} selected - {getCurrencySymbol()}{selectedTotal.toFixed(2)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {availableEarnings.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No earnings available yet</p>
                <p className="text-gray-400 text-sm">Complete shifts to start earning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableEarnings.map((earning) => (
                  <div 
                    key={earning.id}
                    onClick={() => toggleEarning(earning.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedEarnings.includes(earning.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            selectedEarnings.includes(earning.id)
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedEarnings.includes(earning.id) && (
                              <CheckCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Shift Completed</p>
                            <p className="text-sm text-gray-600">
                              {earning.hours_worked} hours @ {getCurrencySymbol()}{earning.base_hourly_rate}/hr
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-9">
                          {earning.weekend_premium_amount > 0 && (
                            <Badge className="bg-orange-100 text-orange-700 text-xs">
                              Weekend +{getCurrencySymbol()}{earning.weekend_premium_amount.toFixed(2)}
                            </Badge>
                          )}
                          {earning.night_shift_premium_amount > 0 && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              Night +{getCurrencySymbol()}{earning.night_shift_premium_amount.toFixed(2)}
                            </Badge>
                          )}
                          {earning.urgent_bonus > 0 && (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              Urgent +{getCurrencySymbol()}{earning.urgent_bonus.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {getCurrencySymbol()}{earning.worker_net_pay.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(earning.calculation_date), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {payoutHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No payout history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payoutHistory.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payout.payout_type === 'instant' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {payout.payout_type === 'instant' ? (
                          <Zap className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getCurrencySymbol()}{payout.net_payout_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payout.payout_type === 'instant' ? 'Instant Pay' : 'Standard Pay'} • {format(new Date(payout.requested_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      payout.status === 'completed' ? 'bg-green-100 text-green-700' :
                      payout.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      payout.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {payout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirm Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {payoutType === 'instant' ? 'Confirm Instant Payout' : 'Confirm Standard Payout'}
              </DialogTitle>
              <DialogDescription>
                Review your payout details before confirming
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Earnings from {selectedEarnings.length} shift(s):</span>
                <span className="font-semibold">{getCurrencySymbol()}{selectedTotal.toFixed(2)}</span>
              </div>
              
              {payoutType === 'instant' && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Instant Pay Fee (1.5%):</span>
                  <span className="text-red-600 font-semibold">-{getCurrencySymbol()}{instantFee.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2">
                <span className="font-semibold text-gray-900">You'll Receive:</span>
                <span className="font-bold text-green-600 text-xl">
                  {getCurrencySymbol()}{(payoutType === 'instant' ? instantNet : selectedTotal).toFixed(2)}
                </span>
              </div>

              <div className={`rounded-lg p-4 ${payoutType === 'instant' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex gap-2">
                  {payoutType === 'instant' ? (
                    <>
                      <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Estimated Arrival</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Within 30 minutes. Funds will be sent to your connected bank account or debit card.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Estimated Arrival</p>
                        <p className="text-xs text-green-700 mt-1">
                          2-3 business days. Funds will be deposited directly to your bank account.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmPayout}
                disabled={requestPayoutMutation.isPending}
                className={payoutType === 'instant' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
                  : 'bg-gradient-to-r from-green-600 to-green-700'
                }
              >
                {requestPayoutMutation.isPending ? 'Processing...' : `Confirm ${payoutType === 'instant' ? 'Instant' : 'Standard'} Payout`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}