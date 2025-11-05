import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Briefcase, Building2, ArrowRight, Clock, TrendingUp, CheckCircle, Zap, Users, DollarSign, Star, Heart, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

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
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HealthStaff Connect</span>
            </div>
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
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white overflow-hidden py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-6 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Solving America's Healthcare Staffing Crisis
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Healthcare Staffing
              <br />
              <span className="bg-gradient-to-r from-teal-300 to-blue-300 bg-clip-text text-transparent">
                In Minutes, Not Days
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect qualified healthcare professionals with facilities instantly. 
              Fill urgent shifts, maintain quality care, and reduce staffing costs by up to 40%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => handleGetStarted('employer')}
                className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl"
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

            <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-300" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-300" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-300" />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-300" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1.1M</div>
              <p className="text-gray-600">Nurses Needed by 2030</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">40%</div>
              <p className="text-gray-600">Cost Savings vs Agencies</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">15 min</div>
              <p className="text-gray-600">Average Fill Time</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <p className="text-gray-600">Platform Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Facilities Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-600 text-white px-4 py-2">
              For Healthcare Facilities
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Fill Critical Shifts in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hospitals, Nursing Homes, Assisted Living, and Home Health agencies trust us for immediate staffing solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Matching</h3>
                <p className="text-gray-600">
                  Post a shift and get qualified applicants within 15 minutes. Our AI matches the right professionals to your needs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-teal-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Save 40% on Costs</h3>
                <p className="text-gray-600">
                  Traditional agencies charge 40-60% markups. We charge a simple 5% platform fee. Massive savings for your facility.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">100% Verified Staff</h3>
                <p className="text-gray-600">
                  Every professional is thoroughly vetted. We verify licenses, certifications, and conduct background checks.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => handleGetStarted('employer')}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 px-8 py-6 text-lg"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-600 text-white px-4 py-2">
              For Healthcare Professionals
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Work on Your Terms, Earn More
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              RNs, LPNs, CNAs, Caregivers, DSPs, Doctors, and Allied Health professionals—find flexible shifts that fit your life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-teal-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-6 h-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Licensed Nurses</h4>
                <p className="text-sm text-gray-600">RN, LPN, NP</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Nursing Assistants</h4>
                <p className="text-sm text-gray-600">CNA, PCT, HHA</p>
              </CardContent>
            </Card>

            <Card className="border-purple-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Caregivers & DSPs</h4>
                <p className="text-sm text-gray-600">Direct Support, Home Care</p>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Allied Health</h4>
                <p className="text-sm text-gray-600">PT, OT, ST, RT</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Zap className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Instant Pay Available</h4>
                <p className="text-sm text-gray-600">Get paid within 30 minutes of completing your shift</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Earn More Money</h4>
                <p className="text-sm text-gray-600">No agency taking 40% of your pay. Keep what you earn.</p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Flexible Schedule</h4>
                <p className="text-sm text-gray-600">Choose shifts that fit your life and availability</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => handleGetStarted('staff')}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 px-8 py-6 text-lg"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Join as Healthcare Professional
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals & Facilities
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-200 shadow-lg">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "HealthStaff Connect saved our hospital during a critical staffing shortage. We filled 6 nursing shifts in under an hour!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Memorial Hospital</p>
                    <p className="text-sm text-gray-600">South Bend, IN</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal-200 shadow-lg">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "As a traveling nurse, this platform lets me pick up shifts wherever I am. The instant pay feature is a game-changer!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah M., RN</p>
                    <p className="text-sm text-gray-600">Registered Nurse</p>
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
                  "We're saving over $12,000 monthly compared to traditional agencies. The quality of professionals is outstanding."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Harmony Senior Living</p>
                    <p className="text-sm text-gray-600">South Bend, IN</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Healthcare Staffing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals and facilities solving their staffing challenges.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => handleGetStarted('employer')}
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl"
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
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-teal-500" />
                <span className="text-white font-bold text-lg">HealthStaff Connect</span>
              </div>
              <p className="text-sm">
                The leading on-demand healthcare staffing platform connecting professionals with facilities.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">For Facilities</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Post Shifts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">For Professionals</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Find Shifts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instant Pay</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 HealthStaff Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}