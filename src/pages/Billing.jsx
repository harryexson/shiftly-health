import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Check, 
  Zap, 
  Clock,
  Download,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { createCheckout } from "@/functions/createCheckout";
import { getSubscriptionStatus } from "@/functions/getSubscriptionStatus";
import { getPaymentHistory } from "@/functions/getPaymentHistory";
import { cancelSubscription } from "@/functions/cancelSubscription";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    description: 'Perfect for small facilities',
    features: [
      'Up to 20 shift postings/month',
      'Basic matching algorithm',
      'Email support',
      'Standard analytics'
    ],
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199,
    description: 'Best for growing facilities',
    features: [
      'Unlimited shift postings',
      'AI-powered smart matching',
      'Priority support',
      'Advanced analytics',
      'Staff preference management',
      'Recurring shift templates'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    description: 'For large healthcare organizations',
    features: [
      'Everything in Premium',
      'Multi-facility management',
      'Dedicated account manager',
      'Custom integrations',
      'API access',
      'SLA guarantee'
    ],
    popular: false
  }
];

export default function Billing() {
  const [user, setUser] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
      queryClient.invalidateQueries(['subscription-status']);
      queryClient.invalidateQueries(['payment-history']);
    }
  }, []);

  const { data: subscriptionData, isLoading: subLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const response = await getSubscriptionStatus();
      return response.data;
    },
    enabled: !!user
  });

  const { data: paymentData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => {
      const response = await getPaymentHistory();
      return response.data;
    },
    enabled: !!user
  });

  const checkoutMutation = useMutation({
    mutationFn: async (plan) => {
      const response = await createCheckout({ plan });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await cancelSubscription({
        subscriptionId: subscriptionData?.subscriptionId,
        cancelImmediately: false
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription-status']);
      setShowCancelDialog(false);
    }
  });

  const handleSubscribe = (planId) => {
    checkoutMutation.mutate(planId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Billing & Subscription
          </h1>
          <p className="text-gray-600">Manage your subscription and view payment history</p>
        </div>

        {subscriptionData?.hasSubscription && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <CardTitle className="text-green-900">Active Subscription</CardTitle>
                    <CardDescription className="text-green-700">
                      {subscriptionData.plan} Plan
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-600">{subscriptionData.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-green-700">Current Period</p>
                  <p className="font-semibold text-green-900">
                    {format(new Date(subscriptionData.currentPeriodStart), 'MMM d, yyyy')} - {format(new Date(subscriptionData.currentPeriodEnd), 'MMM d, yyyy')}
                  </p>
                </div>
                {subscriptionData.cancelAtPeriodEnd && (
                  <div>
                    <p className="text-amber-700">Cancels On</p>
                    <p className="font-semibold text-amber-900">
                      {format(new Date(subscriptionData.currentPeriodEnd), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
              {!subscriptionData.cancelAtPeriodEnd && (
                <Button 
                  variant="outline" 
                  className="mt-4 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel Subscription
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {subscriptionData?.hasSubscription ? 'Change Your Plan' : 'Choose Your Plan'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700' 
                      : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-600" />
              <div>
                <CardTitle className="text-amber-900">Platform Fees</CardTitle>
                <CardDescription className="text-amber-700">
                  In addition to your subscription, a 5% platform fee applies to each filled shift
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800">
              Platform fees are calculated as 5% of the total shift cost (hourly rate × hours worked) 
              and are billed weekly. This helps us maintain the platform, verify credentials, and provide support.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <p className="text-gray-500 text-center py-8">Loading payments...</p>
            ) : !paymentData?.payments?.length ? (
              <p className="text-gray-500 text-center py-8">No payment history yet</p>
            ) : (
              <div className="space-y-3">
                {paymentData.payments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === 'succeeded' || payment.status === 'paid' 
                          ? 'bg-green-100' 
                          : 'bg-amber-100'
                      }`}>
                        {payment.status === 'succeeded' || payment.status === 'paid' 
                          ? <CheckCircle className="w-5 h-5 text-green-600" />
                          : <Clock className="w-5 h-5 text-amber-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.description}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(payment.created), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <Badge className={
                        payment.status === 'succeeded' || payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }>
                        {payment.status}
                      </Badge>
                      {payment.invoicePdf && (
                        <a href={payment.invoicePdf} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel? You'll continue to have access until the end of your current billing period.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}