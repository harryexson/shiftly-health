import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, Building2, ArrowRight, Clock, TrendingUp, CheckCircle, Zap, 
  Users, DollarSign, Star, Heart, Stethoscope, MessageSquare, Calendar, FileText,
  BarChart3, CreditCard, Award, Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/branding/Logo";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = async (role) => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        navigate(createPageUrl("Welcome"));
      } else {
        base44.auth.redirectToLogin(createPageUrl("Welcome"));
      }
    } catch (error) {
      base44.auth.redirectToLogin(createPageUrl("Welcome"));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="default" />
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Welcome"))}
                className="text-gray-700 hover:text-blue-600"
              >
                Sign In
              </Button>
              <Button
                onClick={() => handleGetStarted()}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white overflow-hidden py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-6 py-2">
              <Zap className="w-4 h-4 mr-2" />
              #1 Healthcare Gig Platform - Powered by Shiftly Health
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Healthcare Staffing
              <br />
              <span className="bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">
                Revolutionized
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-sky-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              The only platform with <strong>AI-powered matching</strong>, <strong>instant pay</strong>, <strong>real-time chat</strong>, 
              and <strong>Stripe-powered payments</strong>. Fill shifts in 15 minutes, not days.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => handleGetStarted('employer')}
                className="bg-white text-blue-700 hover:bg-sky-50 px-8 py-6 text-lg font-semibold shadow-xl"
              >
                <Building2 className="w-5 h-5 mr-2" />
                For Healthcare Facilities
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                onClick={() => handleGetStarted('staff')}
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                For Healthcare Professionals
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-sky-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-300" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-300" />
                <span>Stripe Connect Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-300" />
                <span>AI-Powered Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-300" />
                <span>Instant Pay Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-sky-600 mb-2">15 min</div>
              <p className="text-gray-600">Average Fill Time</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">40%</div>
              <p className="text-gray-600">Cost Savings</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-600 mb-2">30 min</div>
              <p className="text-gray-600">Instant Pay Speed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <p className="text-gray-600">Match Accuracy</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <p className="text-gray-600">Platform Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-sky-500 text-white px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Why We're Different
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Features No Other Platform Offers
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              We built the most comprehensive healthcare staffing platform with features competitors simply don't have
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI-Powered Smart Matching</h3>
                <p className="text-blue-200 mb-4">
                  Our algorithm scores candidates based on <strong>skill proximity</strong>, <strong>historical performance</strong>, 
                  <strong>location</strong>, and <strong>experience</strong>.
                </p>
                <Badge className="bg-sky-500/20 text-cyan-300 border-sky-500/30">95% Match Accuracy</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Instant Pay (Earned Wage Access)</h3>
                <p className="text-blue-200 mb-4">
                  Staff can access their earnings <strong>within 30 minutes</strong> of shift completion — powered by Stripe Connect.
                </p>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Get Paid in 30 Minutes</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-Time In-App Messaging</h3>
                <p className="text-blue-200 mb-4">
                  Direct messaging, shift-specific group chats, and facility-wide announcements with push notifications.
                </p>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Built-In Communication</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Recurring Shifts & Templates</h3>
                <p className="text-blue-200 mb-4">
                  Create shift templates, set <strong>recurring patterns</strong>, and manage everything from a calendar view.
                </p>
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">80% Faster Posting</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Market Analysis & Reports</h3>
                <p className="text-blue-200 mb-4">
                  <strong>Downloadable PDF reports</strong> with competitive pricing data and market recommendations.
                </p>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">PDF Reports</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Credential Verification System</h3>
                <p className="text-blue-200 mb-4">
                  Upload licenses, certifications, and training documents. <strong>Verified within 24-48 hours</strong>.
                </p>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">100% Verified Staff</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Shiftly Health vs. Traditional Agencies
            </h2>
            <p className="text-xl text-gray-600">See why facilities and professionals choose us</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-4 text-gray-600">Feature</th>
                  <th className="text-center p-4">
                    <span className="text-sky-600 font-bold">Shiftly Health</span>
                  </th>
                  <th className="text-center p-4 text-gray-500">Traditional Agencies</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium">Fill Time</td>
                  <td className="text-center p-4"><span className="text-green-600 font-bold">15 minutes</span></td>
                  <td className="text-center p-4 text-gray-500">24-72 hours</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="p-4 font-medium">Platform Fee</td>
                  <td className="text-center p-4"><span className="text-green-600 font-bold">5%</span></td>
                  <td className="text-center p-4 text-gray-500">40-60%</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium">Instant Pay</td>
                  <td className="text-center p-4"><CheckCircle className="w-6 h-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 text-gray-400">✗</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="p-4 font-medium">Real-Time Messaging</td>
                  <td className="text-center p-4"><CheckCircle className="w-6 h-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 text-gray-400">✗</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium">AI Matching</td>
                  <td className="text-center p-4"><CheckCircle className="w-6 h-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 text-gray-400">✗</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="p-4 font-medium">Market Analytics</td>
                  <td className="text-center p-4"><CheckCircle className="w-6 h-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 text-gray-400">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* For Facilities Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-sky-600 text-white px-4 py-2">For Healthcare Facilities</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Fill Critical Shifts in Minutes</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-sky-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <Clock className="w-10 h-10 text-sky-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">15-Min Fill Time</h4>
                <p className="text-sm text-gray-600">Get qualified applicants instantly</p>
              </CardContent>
            </Card>
            <Card className="border-blue-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <DollarSign className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Save 40%</h4>
                <p className="text-sm text-gray-600">Only 5% platform fee</p>
              </CardContent>
            </Card>
            <Card className="border-purple-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <Calendar className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Recurring Shifts</h4>
                <p className="text-sm text-gray-600">Templates & automation</p>
              </CardContent>
            </Card>
            <Card className="border-green-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <Award className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Verified Staff</h4>
                <p className="text-sm text-gray-600">100% credential verified</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => handleGetStarted('employer')}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-8 py-6 text-lg"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Start Free 14-Day Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-600 text-white px-4 py-2">For Healthcare Professionals</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Work on Your Terms, Get Paid Fast</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="border-green-100">
              <CardContent className="pt-6 text-center">
                <Zap className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Instant Pay</h4>
                <p className="text-sm text-gray-600">Get paid in 30 minutes</p>
              </CardContent>
            </Card>
            <Card className="border-sky-100">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-10 h-10 text-sky-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Earn More</h4>
                <p className="text-sm text-gray-600">No agency taking 40%</p>
              </CardContent>
            </Card>
            <Card className="border-purple-100">
              <CardContent className="pt-6 text-center">
                <Clock className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Flexible Schedule</h4>
                <p className="text-sm text-gray-600">Set your availability</p>
              </CardContent>
            </Card>
            <Card className="border-orange-100">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Direct Chat</h4>
                <p className="text-sm text-gray-600">Message employers</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => handleGetStarted('staff')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-6 text-lg"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Join as Healthcare Professional
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Healthcare Leaders</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-sky-200 shadow-lg">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The instant pay feature is incredible. I worked a shift Friday night and had the money in my account before I even got home!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Marcus T., RN</p>
                    <p className="text-sm text-gray-600">Registered Nurse</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-lg">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "We filled 8 urgent shifts in under 2 hours. The AI matching found us perfectly qualified staff."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">St. Joseph Hospital</p>
                    <p className="text-sm text-gray-600">South Bend, IN</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 shadow-lg">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The recurring shift feature saves us hours every week. Qualified staff automatically see opportunities."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Harmony Senior Living</p>
                    <p className="text-sm text-gray-600">Elkhart, IN</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Healthcare Staffing?
          </h2>
          <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
            Join the platform with AI matching, instant pay, real-time chat, and direct payments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => handleGetStarted('employer')}
              className="bg-white text-blue-700 hover:bg-sky-50 px-8 py-6 text-lg font-semibold shadow-xl"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              onClick={() => handleGetStarted('staff')}
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Join as Professional
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Logo size="small" />
              </div>
              <p className="text-sm">
                The #1 healthcare gig platform with AI matching, instant pay, and real-time communication.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">For Facilities</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Post Shifts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shift Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Market Analytics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">For Professionals</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Find Shifts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instant Pay</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Set Availability</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Shiftly Health. All rights reserved. Powered by Stripe.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}