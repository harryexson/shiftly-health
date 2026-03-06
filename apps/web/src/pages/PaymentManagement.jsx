import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Search, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function PaymentManagement() {
  const [user, setUser] = React.useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [transactionId, setTransactionId] = useState("");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: allPayments = [] } = useQuery({
    queryKey: ['all-payments-admin'],
    queryFn: () => base44.asServiceRole.entities.Payment.list('-created_date'),
    enabled: !!user && user.role === 'admin',
  });

  const { data: accountStatuses = [] } = useQuery({
    queryKey: ['account-statuses-payments'],
    queryFn: () => base44.asServiceRole.entities.AccountStatus.list(),
    enabled: !!user && user.role === 'admin',
  });

  const { data: employerProfiles = [] } = useQuery({
    queryKey: ['employer-profiles-payments'],
    queryFn: () => base44.asServiceRole.entities.EmployerProfile.list(),
    enabled: !!user && user.role === 'admin',
  });

  const processPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, status }) => {
      const payment = allPayments.find(p => p.id === paymentId);
      
      await base44.asServiceRole.entities.Payment.update(paymentId, {
        status: status,
        payment_method: paymentMethod,
        transaction_id: transactionId || `TXN-${Date.now()}`,
        payment_date: new Date().toISOString().split('T')[0],
        processed_by: user.email
      });

      // If payment completed and was overdue, update account status
      if (status === 'completed' && payment) {
        const accountStatus = accountStatuses.find(s => s.user_email === payment.employer_email);
        if (accountStatus && accountStatus.past_due_amount > 0) {
          const newPastDue = Math.max(0, accountStatus.past_due_amount - payment.amount);
          
          await base44.asServiceRole.entities.AccountStatus.update(accountStatus.id, {
            past_due_amount: newPastDue,
            last_payment_date: new Date().toISOString().split('T')[0],
            days_overdue: newPastDue > 0 ? accountStatus.days_overdue : 0,
            account_status: newPastDue === 0 ? 'active' : accountStatus.account_status
          });

          // If fully paid and was suspended, reactivate
          if (newPastDue === 0 && accountStatus.account_status === 'suspended' && accountStatus.suspension_reason === 'non_payment') {
            await base44.asServiceRole.entities.AccountStatus.update(accountStatus.id, {
              account_status: 'active',
              suspension_reason: null,
              reactivation_date: new Date().toISOString()
            });

            // Reactivate employer profile
            const employerProfile = employerProfiles.find(p => p.user_email === payment.employer_email);
            if (employerProfile) {
              await base44.asServiceRole.entities.EmployerProfile.update(employerProfile.id, {
                profile_status: 'active',
                subscription_status: 'active'
              });
            }

            // Notify user
            await base44.asServiceRole.entities.Notification.create({
              user_email: payment.employer_email,
              type: 'system_alert',
              title: 'Account Reactivated',
              message: 'Your payment has been received and your account has been reactivated. Thank you!',
              priority: 'high',
              status: 'unread'
            });
          }
        }
      }

      // Log audit
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: user.email,
        action: 'process_payment',
        target_user_email: payment.employer_email,
        target_entity: 'Payment',
        target_entity_id: paymentId,
        details: `Payment ${status}. Amount: $${payment.amount}. Method: ${paymentMethod}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-payments-admin'] });
      queryClient.invalidateQueries({ queryKey: ['account-statuses-payments'] });
      queryClient.invalidateQueries({ queryKey: ['employer-profiles-payments'] });
      setShowProcessDialog(false);
      setSelectedPayment(null);
      setPaymentMethod("credit_card");
      setTransactionId("");
    },
  });

  const createOverduePaymentMutation = useMutation({
    mutationFn: async (accountStatus) => {
      const employer = employerProfiles.find(p => p.user_email === accountStatus.user_email);
      if (!employer) return;

      const monthlyAmount = 
        employer.subscription_plan === 'trial' ? 0 :
        employer.subscription_plan === 'basic' ? 99 :
        employer.subscription_plan === 'premium' ? 199 :
        499;

      await base44.asServiceRole.entities.Payment.create({
        employer_email: accountStatus.user_email,
        amount: monthlyAmount,
        payment_type: 'subscription',
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0],
        description: `${employer.subscription_plan} subscription - Overdue`,
        invoice_number: `INV-${Date.now()}`
      });

      await base44.asServiceRole.entities.AccountStatus.update(accountStatus.id, {
        past_due_amount: (accountStatus.past_due_amount || 0) + monthlyAmount,
        days_overdue: (accountStatus.days_overdue || 0) + 30
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-payments-admin'] });
      queryClient.invalidateQueries({ queryKey: ['account-statuses-payments'] });
    },
  });

  const pendingPayments = allPayments.filter(p => p.status === 'pending');
  const completedPayments = allPayments.filter(p => p.status === 'completed');
  const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const overdueAccounts = accountStatuses.filter(s => s.past_due_amount > 0);
  const totalOverdue = overdueAccounts.reduce((sum, s) => sum + (s.past_due_amount || 0), 0);

  const filteredPayments = allPayments.filter(p => 
    p.employer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-green-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <DollarSign className="w-7 h-7 text-green-600" />
              Payment Management
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Track payments, process transactions, and manage billing
            </p>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-green-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Overdue</p>
                  <p className="text-2xl font-bold text-amber-600">${totalOverdue.toFixed(2)}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-blue-600">{pendingPayments.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue Accounts</p>
                  <p className="text-2xl font-bold text-red-600">{overdueAccounts.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Alerts */}
        {overdueAccounts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Overdue Accounts Requiring Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueAccounts.map((account) => {
                  const employer = employerProfiles.find(p => p.user_email === account.user_email);
                  return (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div>
                        <p className="font-semibold text-gray-900">{employer?.facility_name || account.user_email}</p>
                        <p className="text-sm text-red-700">
                          ${account.past_due_amount.toFixed(2)} overdue • {account.days_overdue} days
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={account.account_status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                          {account.account_status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by email or invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Payments ({filteredPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPayments.map((payment) => {
                const employer = employerProfiles.find(p => p.user_email === payment.employer_email);
                return (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-gray-900">{employer?.facility_name || payment.employer_email}</p>
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
                        <span className="font-semibold text-lg text-gray-900">${payment.amount.toFixed(2)}</span>
                        {payment.invoice_number && <span>Invoice: {payment.invoice_number}</span>}
                        {payment.due_date && <span>Due: {format(new Date(payment.due_date), 'MMM d, yyyy')}</span>}
                        {payment.payment_date && <span>Paid: {format(new Date(payment.payment_date), 'MMM d, yyyy')}</span>}
                      </div>
                      {payment.description && (
                        <p className="text-xs text-gray-500 mt-1">{payment.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {payment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowProcessDialog(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Process
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm('Mark this payment as failed?')) {
                                processPaymentMutation.mutate({ paymentId: payment.id, status: 'failed' });
                              }
                            }}
                          >
                            Mark Failed
                          </Button>
                        </>
                      )}
                      {payment.status === 'completed' && payment.transaction_id && (
                        <span className="text-xs text-gray-500">TXN: {payment.transaction_id}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Process Payment Dialog */}
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
              <DialogDescription>
                {selectedPayment && `Processing payment of $${selectedPayment.amount.toFixed(2)}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transaction-id">Transaction ID (Optional)</Label>
                <Input
                  id="transaction-id"
                  placeholder="Enter transaction reference..."
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedPayment) {
                    processPaymentMutation.mutate({ paymentId: selectedPayment.id, status: 'completed' });
                  }
                }}
                disabled={processPaymentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {processPaymentMutation.isPending ? 'Processing...' : 'Mark as Paid'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}