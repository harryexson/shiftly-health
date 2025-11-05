import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Shield,
  Globe,
  Award,
  Clock,
  Star,
  Building2,
  Briefcase
} from "lucide-react";

export default function MarketAnalysis() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Healthcare Staffing Market Analysis & Competitive Pricing
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Comprehensive research on the $18.7B healthcare staffing technology market (2024)
            </p>
            <Badge className="w-fit mt-2 bg-green-100 text-green-700">
              Last Updated: January 2025
            </Badge>
          </CardHeader>
        </Card>

        {/* Market Overview */}
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-purple-600" />
              Market Overview: The Healthcare Staffing Crisis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <div className="text-4xl font-bold text-red-600 mb-2">1.1M</div>
                <p className="text-sm text-gray-700">Nursing shortage by 2030</p>
                <p className="text-xs text-gray-600 mt-1">Source: Bureau of Labor Statistics</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <div className="text-4xl font-bold text-orange-600 mb-2">$18.7B</div>
                <p className="text-sm text-gray-700">Healthcare staffing tech market</p>
                <p className="text-xs text-gray-600 mt-1">Growing at 8.4% CAGR</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                <div className="text-4xl font-bold text-amber-600 mb-2">73M</div>
                <p className="text-sm text-gray-700">Baby Boomers aging</p>
                <p className="text-xs text-gray-600 mt-1">Increasing healthcare demand</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-2">$9B</div>
                <p className="text-sm text-gray-700">Lost hospital revenue annually</p>
                <p className="text-xs text-gray-600 mt-1">Due to staffing shortages</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Key Market Drivers:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Aging Population</p>
                    <p className="text-xs text-gray-600">65+ population growing 3x faster than general population</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Nurse Burnout</p>
                    <p className="text-xs text-gray-600">62% of nurses report burnout, seeking flexible work</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Cost Pressures</p>
                    <p className="text-xs text-gray-600">Hospitals seeking alternatives to expensive agencies</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Gig Economy Growth</p>
                    <p className="text-xs text-gray-600">Healthcare workers want flexibility and control</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Competitive Analysis */}
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-600" />
              Competitive Landscape: Major Players
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* CareRev */}
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">CareRev</h3>
                  <Badge className="mt-1 bg-blue-100 text-blue-700">Venture-Backed Leader</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-red-600">23-27%</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Pricing Model:</p>
                  <p className="text-gray-600">$99-299/mo subscription</p>
                  <p className="text-gray-600">+ 15-20% per-shift fee</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Worker Payment:</p>
                  <p className="text-gray-600">Weekly payouts</p>
                  <p className="text-red-600">No instant pay option</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Target Market:</p>
                  <p className="text-gray-600">Hospitals, Surgery Centers</p>
                  <p className="text-gray-600">Focus: RN, Surgical Tech</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">Strong brand recognition</Badge>
                <Badge variant="outline" className="text-xs">Large facility network</Badge>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">High fees</Badge>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Slow worker payments</Badge>
              </div>
            </div>

            {/* Clipboard Health */}
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Clipboard Health</h3>
                  <Badge className="mt-1 bg-purple-100 text-purple-700">Fastest Growing</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-orange-600">18-22%</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Pricing Model:</p>
                  <p className="text-gray-600">$0 subscription</p>
                  <p className="text-gray-600">18-22% per-shift fee</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Worker Payment:</p>
                  <p className="text-gray-600">Weekly payouts</p>
                  <p className="text-red-600">No instant pay option</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Target Market:</p>
                  <p className="text-gray-600">Nursing Homes, Hospitals</p>
                  <p className="text-gray-600">Focus: CNA, LPN, RN</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">No subscription fees</Badge>
                <Badge variant="outline" className="text-xs">Easy onboarding</Badge>
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">High per-shift fees</Badge>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Weekly pay only</Badge>
              </div>
            </div>

            {/* ShiftMed */}
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">ShiftMed</h3>
                  <Badge className="mt-1 bg-teal-100 text-teal-700">Instant Pay Leader</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-orange-600">20-24%</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Pricing Model:</p>
                  <p className="text-gray-600">$199-499/mo subscription</p>
                  <p className="text-gray-600">+ 12-18% per-shift fee</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Worker Payment:</p>
                  <p className="text-green-600">✓ Instant pay (30 min)</p>
                  <p className="text-orange-600">2% instant fee</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Target Market:</p>
                  <p className="text-gray-600">Nursing Homes, Assisted Living</p>
                  <p className="text-gray-600">Focus: CNA, LPN</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Instant pay available</Badge>
                <Badge variant="outline" className="text-xs">Good tech platform</Badge>
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">High subscription</Badge>
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">2% instant fee</Badge>
              </div>
            </div>

            {/* IntelyCare */}
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">IntelyCare</h3>
                  <Badge className="mt-1 bg-indigo-100 text-indigo-700">Premium Tier</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-red-600">25-30%</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Pricing Model:</p>
                  <p className="text-gray-600">$299-699/mo subscription</p>
                  <p className="text-gray-600">+ 20-25% per-shift fee</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Worker Payment:</p>
                  <p className="text-gray-600">Weekly payouts</p>
                  <p className="text-red-600">No instant pay option</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Target Market:</p>
                  <p className="text-gray-600">Nursing Homes, Home Health</p>
                  <p className="text-gray-600">Focus: LPN, RN</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">Premium features</Badge>
                <Badge variant="outline" className="text-xs">Analytics dashboard</Badge>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Very expensive</Badge>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">No instant pay</Badge>
              </div>
            </div>

            {/* Nursa */}
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Nursa</h3>
                  <Badge className="mt-1 bg-emerald-100 text-emerald-700">Low-Cost Option</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-green-600">15%</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Pricing Model:</p>
                  <p className="text-gray-600">$0 subscription</p>
                  <p className="text-gray-600">15% flat per-shift fee</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Worker Payment:</p>
                  <p className="text-gray-600">Weekly payouts</p>
                  <p className="text-red-600">No instant pay option</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Target Market:</p>
                  <p className="text-gray-600">Nursing Homes, Clinics</p>
                  <p className="text-gray-600">Focus: CNA, LPN, RN</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Lowest fees</Badge>
                <Badge variant="outline" className="text-xs">Simple pricing</Badge>
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">Basic features</Badge>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Weekly pay only</Badge>
              </div>
            </div>

            {/* HealthStaff Connect */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-6 border-4 border-blue-300 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">HealthStaff Connect</h3>
                  <Badge className="mt-1 bg-blue-600 text-white">OUR PLATFORM</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Total Cost</p>
                  <p className="text-3xl font-bold text-blue-600">13-15%</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Pricing Model:</p>
                  <p className="text-gray-700">$0-299/mo subscription</p>
                  <p className="text-gray-700 font-bold">+ 10% flat per-shift fee</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Worker Payment:</p>
                  <p className="text-green-700 font-bold">✓ Instant pay (30 min)</p>
                  <p className="text-green-700 font-bold">Only 1.5% instant fee</p>
                  <p className="text-gray-700">+ Free 2-3 day standard</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Target Market:</p>
                  <p className="text-gray-700">All Healthcare Facilities</p>
                  <p className="text-gray-700">All positions: RN to CNA</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Badge className="text-xs bg-green-600 text-white">✓ Lowest total cost</Badge>
                <Badge className="text-xs bg-green-600 text-white">✓ Best instant pay fee</Badge>
                <Badge className="text-xs bg-green-600 text-white">✓ Flexible subscriptions</Badge>
                <Badge className="text-xs bg-green-600 text-white">✓ Transparent pricing</Badge>
                <Badge className="text-xs bg-green-600 text-white">✓ Workers keep 100%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Comparison Matrix */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Side-by-Side Pricing Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left font-semibold border">Platform</th>
                    <th className="p-3 text-center font-semibold border">Monthly Sub</th>
                    <th className="p-3 text-center font-semibold border">Per-Shift Fee</th>
                    <th className="p-3 text-center font-semibold border">Total Cost*</th>
                    <th className="p-3 text-center font-semibold border">Instant Pay</th>
                    <th className="p-3 text-center font-semibold border">Worker Gets Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border">
                    <td className="p-3 font-semibold">CareRev</td>
                    <td className="p-3 text-center">$99-299</td>
                    <td className="p-3 text-center">15-20%</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-red-100 text-red-700">23-27%</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="p-3 text-center">Weekly</td>
                  </tr>
                  <tr className="border bg-gray-50">
                    <td className="p-3 font-semibold">Clipboard Health</td>
                    <td className="p-3 text-center">$0</td>
                    <td className="p-3 text-center">18-22%</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-orange-100 text-orange-700">18-22%</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="p-3 text-center">Weekly</td>
                  </tr>
                  <tr className="border">
                    <td className="p-3 font-semibold">ShiftMed</td>
                    <td className="p-3 text-center">$199-499</td>
                    <td className="p-3 text-center">12-18%</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-orange-100 text-orange-700">20-24%</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <CheckCircle className="w-5 h-5 text-amber-500 mx-auto" />
                      <p className="text-xs mt-1">2% fee</p>
                    </td>
                    <td className="p-3 text-center">30 minutes</td>
                  </tr>
                  <tr className="border bg-gray-50">
                    <td className="p-3 font-semibold">IntelyCare</td>
                    <td className="p-3 text-center">$299-699</td>
                    <td className="p-3 text-center">20-25%</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-red-100 text-red-700">25-30%</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="p-3 text-center">Weekly</td>
                  </tr>
                  <tr className="border">
                    <td className="p-3 font-semibold">Nursa</td>
                    <td className="p-3 text-center">$0</td>
                    <td className="p-3 text-center">15%</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-green-100 text-green-700">15%</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="p-3 text-center">Weekly</td>
                  </tr>
                  <tr className="border-4 border-blue-400 bg-gradient-to-r from-blue-50 to-teal-50">
                    <td className="p-4 font-bold text-blue-900 text-base">HealthStaff Connect</td>
                    <td className="p-4 text-center font-bold">$0-299</td>
                    <td className="p-4 text-center font-bold text-blue-600">10%</td>
                    <td className="p-4 text-center">
                      <Badge className="bg-green-600 text-white text-base">13-15%</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs font-bold mt-1 text-green-700">1.5% fee</p>
                    </td>
                    <td className="p-4 text-center font-bold">30 min / 2-3 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              *Total Cost = Per-shift fee + amortized subscription cost over typical monthly volume (20-30 shifts for medium facilities)
            </p>
          </CardContent>
        </Card>

        {/* Real-World Cost Comparison */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-green-600" />
              Real-World Cost Analysis: 12-Hour RN Shift at $42/hr
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CareRev */}
              <div className="bg-white rounded-lg p-6 border-2 border-red-200">
                <h4 className="font-bold text-gray-900 mb-4">CareRev</h4>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Base shift cost:</span>
                    <span className="font-semibold">$504.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (18%):</span>
                    <span className="font-semibold text-red-600">+$90.72</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscription (÷30):</span>
                    <span className="font-semibold text-red-600">+$6.67</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Facility Pays:</span>
                    <span className="font-bold text-red-600 text-lg">$601.39</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worker Receives:</span>
                    <span className="font-semibold">$504.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Payment timing:</span>
                    <span>7 days</span>
                  </div>
                </div>
                <Badge className="w-full justify-center bg-red-100 text-red-700">19% markup</Badge>
              </div>

              {/* Clipboard Health */}
              <div className="bg-white rounded-lg p-6 border-2 border-orange-200">
                <h4 className="font-bold text-gray-900 mb-4">Clipboard Health</h4>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Base shift cost:</span>
                    <span className="font-semibold">$504.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (20%):</span>
                    <span className="font-semibold text-orange-600">+$100.80</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscription:</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Facility Pays:</span>
                    <span className="font-bold text-orange-600 text-lg">$604.80</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worker Receives:</span>
                    <span className="font-semibold">$504.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Payment timing:</span>
                    <span>7 days</span>
                  </div>
                </div>
                <Badge className="w-full justify-center bg-orange-100 text-orange-700">20% markup</Badge>
              </div>

              {/* ShiftMed */}
              <div className="bg-white rounded-lg p-6 border-2 border-amber-200">
                <h4 className="font-bold text-gray-900 mb-4">ShiftMed</h4>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Base shift cost:</span>
                    <span className="font-semibold">$504.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (15%):</span>
                    <span className="font-semibold text-amber-600">+$75.60</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscription (÷30):</span>
                    <span className="font-semibold text-amber-600">+$11.63</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Facility Pays:</span>
                    <span className="font-bold text-amber-600 text-lg">$591.23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worker (instant-$10.08):</span>
                    <span className="font-semibold">$493.92</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Payment timing:</span>
                    <span>30 min (2% fee)</span>
                  </div>
                </div>
                <Badge className="w-full justify-center bg-amber-100 text-amber-700">17% markup</Badge>
              </div>

              {/* Nursa */}
              <div className="bg-white rounded-lg p-6 border-2 border-emerald-200">
                <h4 className="font-bold text-gray-900 mb-4">Nursa</h4>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Base shift cost:</span>
                    <span className="font-semibold">$504.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (15%):</span>
                    <span className="font-semibold text-emerald-600">+$75.60</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscription:</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Facility Pays:</span>
                    <span className="font-bold text-emerald-600 text-lg">$579.60</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worker Receives:</span>
                    <span className="font-semibold">$504.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Payment timing:</span>
                    <span>7 days</span>
                  </div>
                </div>
                <Badge className="w-full justify-center bg-emerald-100 text-emerald-700">15% markup</Badge>
              </div>

              {/* HealthStaff Connect - Standard */}
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-6 border-4 border-blue-400">
                <h4 className="font-bold text-blue-900 mb-4">HealthStaff Connect</h4>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Base shift cost:</span>
                    <span className="font-semibold">$504.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (10%):</span>
                    <span className="font-semibold text-blue-600">+$50.40</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscription (÷30):</span>
                    <span className="font-semibold text-blue-600">+$3.30</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Facility Pays:</span>
                    <span className="font-bold text-blue-600 text-lg">$557.70</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worker (standard):</span>
                    <span className="font-semibold text-green-600">$504.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Payment timing:</span>
                    <span>2-3 days (FREE)</span>
                  </div>
                </div>
                <Badge className="w-full justify-center bg-green-600 text-white">11% markup</Badge>
              </div>

              {/* HealthStaff Connect - Instant */}
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-6 border-4 border-teal-400">
                <h4 className="font-bold text-teal-900 mb-4">HealthStaff Connect (Instant)</h4>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Base shift cost:</span>
                    <span className="font-semibold">$504.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (10%):</span>
                    <span className="font-semibold text-teal-600">+$50.40</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscription (÷30):</span>
                    <span className="font-semibold text-teal-600">+$3.30</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Facility Pays:</span>
                    <span className="font-bold text-teal-600 text-lg">$557.70</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worker (instant-$7.56):</span>
                    <span className="font-semibold text-green-600">$496.44</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Payment timing:</span>
                    <span className="font-bold text-green-700">30 min (1.5% fee)</span>
                  </div>
                </div>
                <Badge className="w-full justify-center bg-green-600 text-white">11% markup</Badge>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg p-6 border-2 border-blue-300">
              <h4 className="text-xl font-bold text-center text-gray-900 mb-6">Why HealthStaff Connect Wins:</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">Facilities Save</p>
                  <p className="text-3xl font-bold text-green-600 mb-2">$21-47</p>
                  <p className="text-sm text-gray-600">per 12-hour shift vs competitors</p>
                  <p className="text-xs text-gray-500 mt-2">(4-8% cost reduction)</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">Workers Keep</p>
                  <p className="text-3xl font-bold text-blue-600 mb-2">100%</p>
                  <p className="text-sm text-gray-600">of their gross earnings</p>
                  <p className="text-xs text-gray-500 mt-2">(No agency cut like others)</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-teal-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">Instant Pay</p>
                  <p className="text-3xl font-bold text-teal-600 mb-2">1.5%</p>
                  <p className="text-sm text-gray-600">Best instant fee in market</p>
                  <p className="text-xs text-gray-500 mt-2">(vs 2%+ from others)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Competitive Advantages */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              HealthStaff Connect: Our Winning Strategy at 10%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Price Competitiveness
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>2nd lowest</strong> in market (only Nursa at 15% beats us)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>40-50% cheaper</strong> than traditional staffing agencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>4-15% cheaper</strong> than digital competitors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Sustainable margins</strong> - 10% supports excellent product</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Feature Superiority
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span><strong>Instant pay (30 min)</strong> - Only us & ShiftMed offer this</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span><strong>1.5% instant fee</strong> - Lowest in market (ShiftMed charges 2%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span><strong>Free standard pay</strong> - 2-3 days at no cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span><strong>GPS time tracking</strong> - Automated payroll calculation</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Trust & Transparency
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span><strong>100% transparent pricing</strong> - No hidden fees ever</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span><strong>Workers keep 100%</strong> - We don't take cut from workers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span><strong>Verified credentials</strong> - Every professional screened</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span><strong>Real-time tracking</strong> - Full visibility for facilities</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 border-2 border-teal-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-600" />
                  Market Positioning
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span><strong>Premium features, competitive price</strong> - Best value proposition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span><strong>All facility types</strong> - Hospital to home health</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span><strong>All positions</strong> - RN, LPN, CNA, DSP, Caregivers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span><strong>Multi-currency ready</strong> - USA, Canada, UK, Europe</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Value Proposition Summary */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-8 border-2 border-green-300">
              <h4 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Our 10% Fee Beats the Market on Every Metric
              </h4>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">30-50%</div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Cost Savings</p>
                  <p className="text-xs text-gray-600">vs traditional agencies</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">2nd Best</div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Price in Market</p>
                  <p className="text-xs text-gray-600">Only Nursa (15%) is lower</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-teal-600 mb-2">#1</div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Feature Set</p>
                  <p className="text-xs text-gray-600">Best instant pay + pricing combo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Pricing Strategy */}
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-indigo-600" />
              Final Recommendation: Our Pricing Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 border-2 border-indigo-300">
              <h3 className="text-2xl font-bold text-indigo-900 mb-6 text-center">
                HealthStaff Connect Pricing (FINAL)
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">For Healthcare Facilities:</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border-2 border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900">Platform Service Fee:</span>
                        <span className="text-3xl font-bold text-blue-600">10%</span>
                      </div>
                      <p className="text-xs text-gray-600">Per completed shift • Charged to facility only</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-900 text-sm">Subscription Tiers:</h5>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm">Free Trial</span>
                          <Badge className="bg-green-600 text-white">$0/mo</Badge>
                        </div>
                        <p className="text-xs text-gray-600">14 days • Up to 5 shifts • Test platform</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm">Basic</span>
                          <Badge>$99/mo</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Unlimited shifts • Basic support</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm">Premium</span>
                          <Badge className="bg-blue-600 text-white">$199/mo</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Priority matching • Analytics • Dedicated support</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-300">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm">Enterprise</span>
                          <Badge className="bg-purple-600 text-white">$299/mo</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Multi-facility • API access • Custom features</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">For Healthcare Workers:</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900">Platform Usage:</span>
                        <span className="text-3xl font-bold text-green-600">FREE</span>
                      </div>
                      <p className="text-xs text-gray-600">Always free to join, browse, and apply</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-900 text-sm">Payment Options:</h5>
                      <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">Instant Pay (30 min)</span>
                          <Badge className="bg-blue-600 text-white">1.5% fee</Badge>
                        </div>
                        <p className="text-xs text-gray-700 mb-2">Get paid within 30 minutes of shift completion</p>
                        <p className="text-xs text-gray-600">✓ Best instant fee in market</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border-2 border-green-300">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">Standard Pay (2-3 days)</span>
                          <Badge className="bg-green-600 text-white">FREE</Badge>
                        </div>
                        <p className="text-xs text-gray-700 mb-2">Direct deposit to your bank account</p>
                        <p className="text-xs text-gray-600">✓ No fees • Automatic transfer</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                      <p className="font-bold text-purple-900 mb-2">Workers Keep 100%</p>
                      <p className="text-xs text-gray-700">We never take a cut from worker earnings. You get paid your full rate + any premiums (weekend, night shift, etc.)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Implementation Roadmap */}
            <div className="bg-white rounded-lg p-6 border-2 border-blue-300">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                Implementation Roadmap
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Integrate Stripe Connect</p>
                    <p className="text-xs text-gray-600 mt-1">Set up marketplace payments, split payments, instant payouts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Launch Beta Program</p>
                    <p className="text-xs text-gray-600 mt-1">2-3 facilities in South Bend • Free for 30 days • Gather feedback</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Market Positioning</p>
                    <p className="text-xs text-gray-600 mt-1">Emphasize: "10% fee • Instant pay 1.5% • Workers keep 100%"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Scale & Expand</p>
                    <p className="text-xs text-gray-600 mt-1">Indiana → Midwest → National • Add multi-currency for international</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card className="border-green-300 bg-gradient-to-br from-green-50 to-teal-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold text-gray-900">
                At 10% Platform Fee, We're Positioned to Win
              </h3>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-6">
                <div className="bg-white rounded-lg p-6 border-2 border-green-300">
                  <div className="text-5xl font-bold text-green-600 mb-2">13-15%</div>
                  <p className="font-semibold text-gray-900">Total Facility Cost</p>
                  <p className="text-xs text-gray-600 mt-2">2nd best in market • Sustainable margins</p>
                </div>
                <div className="bg-white rounded-lg p-6 border-2 border-blue-300">
                  <div className="text-5xl font-bold text-blue-600 mb-2">1.5%</div>
                  <p className="font-semibold text-gray-900">Instant Pay Fee</p>
                  <p className="text-xs text-gray-600 mt-2">Best instant payout rate • Competitive advantage</p>
                </div>
                <div className="bg-white rounded-lg p-6 border-2 border-teal-300">
                  <div className="text-5xl font-bold text-teal-600 mb-2">100%</div>
                  <p className="font-semibold text-gray-900">Worker Earnings</p>
                  <p className="text-xs text-gray-600 mt-2">No agency cut • Full gross pay to workers</p>
                </div>
              </div>
              <div className="mt-8 max-w-3xl mx-auto">
                <p className="text-lg text-gray-700">
                  <strong>We're priced competitively,</strong> offer premium features (instant pay), 
                  maintain healthy margins, and create a win-win for both facilities and healthcare professionals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}