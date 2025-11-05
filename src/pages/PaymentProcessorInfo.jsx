import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Zap, 
  Globe, 
  CheckCircle, 
  TrendingUp,
  CreditCard,
  Shield,
  Clock,
  ArrowRight
} from "lucide-react";

export default function PaymentProcessorInfo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              Payment Processing & Earned Wage Access System
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Comprehensive guide to our multi-currency payment infrastructure supporting instant payouts globally
            </p>
          </CardHeader>
        </Card>

        {/* Primary Recommendation: Stripe Connect */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-green-600 text-white mb-3">RECOMMENDED PRIMARY</Badge>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  Stripe Connect with Instant Payouts
                </CardTitle>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Processing Fee</p>
                <p className="text-2xl font-bold text-green-600">2.9% + $0.30</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Why Stripe Connect is Perfect for Healthcare Staffing:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Instant Payouts (30 minutes)</p>
                    <p className="text-sm text-gray-600">Healthcare workers get paid within 30 minutes of shift completion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Multi-Currency Support</p>
                    <p className="text-sm text-gray-600">USD, CAD, GBP, EUR with automatic conversion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Split Payments</p>
                    <p className="text-sm text-gray-600">Automatically split payments between platform and workers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Built-in Compliance</p>
                    <p className="text-sm text-gray-600">Handles KYC/AML, tax forms (1099-K), identity verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Marketplace Features</p>
                    <p className="text-sm text-gray-600">Platform takes service fee, facility pays subscription</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Bank Account & Debit Card</p>
                    <p className="text-sm text-gray-600">Workers can receive via bank transfer or debit card</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-4">Stripe Connect Implementation Model:</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                  <p className="text-gray-700"><span className="font-semibold">Healthcare Facility</span> → Pays platform subscription (monthly) + Service fee per shift</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
                  <p className="text-gray-700"><span className="font-semibold">Platform</span> → Collects 5% service fee + subscription revenue</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
                  <p className="text-gray-700"><span className="font-semibold">Healthcare Worker</span> → Receives 95% of shift payment instantly via Stripe</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">Instant Payout Fee</p>
                <p className="text-2xl font-bold text-blue-600 mb-1">1.5%</p>
                <p className="text-xs text-blue-700">Workers pay this for instant access (optional)</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm font-semibold text-purple-900 mb-2">Standard Payout</p>
                <p className="text-2xl font-bold text-purple-600 mb-1">FREE</p>
                <p className="text-xs text-purple-700">2-3 business days (no fee)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Wise Business */}
          <Card className="border-purple-200">
            <CardHeader>
              <Badge className="bg-purple-600 text-white mb-3">INTERNATIONAL PAYMENTS</Badge>
              <CardTitle className="text-xl flex items-center gap-2">
                <Globe className="w-6 h-6 text-purple-600" />
                Wise Business (formerly TransferWise)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Best for:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    International contractors (Europe, Canada, UK)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    Lower fees for currency conversion (0.35-1%)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    Real exchange rates (no markup)
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-900 font-semibold mb-1">Processing Time</p>
                <p className="text-lg font-bold text-purple-600">1-2 business days</p>
              </div>
            </CardContent>
          </Card>

          {/* PayPal/Venmo */}
          <Card className="border-blue-200">
            <CardHeader>
              <Badge className="bg-blue-600 text-white mb-3">ALTERNATIVE OPTION</Badge>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
                PayPal Payouts / Venmo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Best for:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Workers who prefer PayPal/Venmo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Instant to PayPal balance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Familiar platform for users
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-900 font-semibold mb-1">Fee Structure</p>
                <p className="text-lg font-bold text-blue-600">2% (up to $1 cap)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Calculation System */}
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-600" />
              Automated Payroll Calculation System
            </CardTitle>
            <p className="text-gray-600 mt-2">How we calculate earnings for gig healthcare workers</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-6 border border-teal-200">
              <h3 className="font-semibold text-gray-900 mb-4">Shift Completion to Payment Flow:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-gray-900">Shift Check-In/Check-Out</p>
                    <p className="text-sm text-gray-600">Worker clocks in/out via GPS-enabled mobile app or facility confirms hours</p>
                    <div className="mt-2 bg-white rounded p-3 text-sm font-mono">
                      <p>Clock In: 7:00 AM</p>
                      <p>Clock Out: 3:30 PM</p>
                      <p className="text-teal-600 font-semibold">Total Hours: 8.5 hours</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Automatic Calculation</p>
                    <p className="text-sm text-gray-600 mb-2">System calculates gross pay with premiums</p>
                    <div className="bg-white rounded p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Base Rate (8.5 hrs × $45/hr)</span>
                        <span className="font-semibold">$382.50</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>+ Weekend Premium (20%)</span>
                        <span className="font-semibold">$76.50</span>
                      </div>
                      <div className="flex justify-between text-purple-600">
                        <span>+ Urgent Shift Bonus</span>
                        <span className="font-semibold">$50.00</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Gross Pay</span>
                        <span className="text-green-600">$509.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Platform Fee Deduction</p>
                    <p className="text-sm text-gray-600 mb-2">Service fee for platform use (paid by facility)</p>
                    <div className="bg-white rounded p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Gross Pay</span>
                        <span className="font-semibold">$509.00</span>
                      </div>
                      <div className="flex justify-between text-amber-600">
                        <span>Platform Service Fee (5%) - Paid by Facility</span>
                        <span className="font-semibold">$25.45</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Worker Receives</span>
                        <span className="text-green-600">$509.00</span>
                      </div>
                      <p className="text-xs text-gray-500 italic">Note: Worker receives 100% of agreed rate. Facility pays 5% service fee separately.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Worker Payment Choice</p>
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-blue-900">Instant Pay</span>
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mb-1">$501.36</p>
                        <p className="text-xs text-blue-700">After 1.5% instant fee ($7.64)</p>
                        <p className="text-xs text-blue-600 mt-2 font-semibold">⚡ Arrives in 30 minutes</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-green-900">Standard Pay</span>
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600 mb-1">$509.00</p>
                        <p className="text-xs text-green-700">No fees - Full amount</p>
                        <p className="text-xs text-green-600 mt-2 font-semibold">📅 2-3 business days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">5</div>
                  <div>
                    <p className="font-semibold text-gray-900">Tax Documentation</p>
                    <p className="text-sm text-gray-600 mb-2">Automated 1099 generation and reporting</p>
                    <div className="bg-white rounded p-3 text-sm">
                      <ul className="space-y-1 text-gray-700">
                        <li>✓ Quarterly earnings summaries</li>
                        <li>✓ Annual 1099-K forms (auto-generated)</li>
                        <li>✓ Expense tracking for deductions</li>
                        <li>✓ Tax withholding calculator</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Structures */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Premium Pay Structures:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="font-semibold text-orange-900 mb-2">Weekend Premium</p>
                  <p className="text-3xl font-bold text-orange-600 mb-1">+20%</p>
                  <p className="text-xs text-orange-700">Saturday & Sunday shifts</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="font-semibold text-purple-900 mb-2">Night Shift Premium</p>
                  <p className="text-3xl font-bold text-purple-600 mb-1">+15%</p>
                  <p className="text-xs text-purple-700">11 PM - 7 AM shifts</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-900 mb-2">Urgent/Last Minute</p>
                  <p className="text-3xl font-bold text-red-600 mb-1">+$25-100</p>
                  <p className="text-xs text-red-700">Posted less than 24 hours notice</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison with Other Platforms */}
        <Card className="border-indigo-200">
          <CardHeader>
            <CardTitle className="text-2xl">How Leading Healthcare Gig Platforms Handle Payments:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">CareRev (Market Leader)</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Uses <span className="font-semibold">Stripe Connect</span> for instant payouts</li>
                  <li>• Workers paid within 24-48 hours of shift completion</li>
                  <li>• Option for instant pay (small fee) or standard 2-day ACH</li>
                  <li>• Facilities billed separately via subscription model</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Clipboard Health</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Instant pay via <span className="font-semibold">debit card</span> (1-2% fee)</li>
                  <li>• Standard pay via direct deposit (free, 2-3 days)</li>
                  <li>• Built-in tip functionality for exceptional performance</li>
                  <li>• Weekly earnings summaries with tax withholding estimates</li>
                </ul>
              </div>

              <div className="border-l-4 border-teal-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">ShiftMed</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Partners with <span className="font-semibold">Branch/DailyPay</span> for earned wage access</li>
                  <li>• Workers can access up to 50% of earned wages before payday</li>
                  <li>• Full payment processes on bi-weekly schedule</li>
                  <li>• Integrated expense tracking and mileage reimbursement</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Uber (Gig Economy Benchmark)</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Instant Pay to debit card multiple times per day</li>
                  <li>• $0.50 fee per instant cash-out</li>
                  <li>• Weekly automatic deposits (free)</li>
                  <li>• Integration with Uber Debit Card for fee-free instant access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Recommendation */}
        <Card className="border-green-300 bg-gradient-to-br from-green-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              Our Recommended Implementation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-6 border-2 border-green-300">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Multi-Provider Strategy:</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-gray-900">Primary: Stripe Connect</p>
                    <p className="text-sm text-gray-600">Handles all US, Canada, UK, Europe payments with instant payout option</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-gray-900">Secondary: Wise Business</p>
                    <p className="text-sm text-gray-600">For international workers in markets Stripe does not cover as well</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-gray-900">Optional: PayPal Integration</p>
                    <p className="text-sm text-gray-600">Give workers choice if they prefer PayPal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">For Workers:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>✓ Choose instant pay (30 min) or standard (2-3 days)</li>
                  <li>✓ Transparent fee structure</li>
                  <li>✓ Automatic tax documentation</li>
                  <li>✓ Mobile app with earnings dashboard</li>
                </ul>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">For Facilities:</h4>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li>✓ Monthly subscription + 5% service fee per shift</li>
                  <li>✓ Automated billing and invoicing</li>
                  <li>✓ Multi-currency support</li>
                  <li>✓ Comprehensive reporting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <ArrowRight className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Next Steps to Implement:</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>Create Stripe Connect account (Platform account)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>Set up Connected Accounts for each healthcare worker (onboarding flow)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>Implement backend function to calculate earnings and trigger payouts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">4.</span>
                    <span>Build worker dashboard to show earnings and initiate instant payouts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">5.</span>
                    <span>Set up webhook handlers for payment confirmations and failures</span>
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}