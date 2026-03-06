import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, Briefcase, Building2, ArrowRight, Clock, TrendingUp, CheckCircle, Zap, Users, DollarSign, Star, Award, Heart, Stethoscope, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import OnboardingFlow from "../components/onboarding/OnboardingFlow";
import EmployerOnboardingWizard from "../components/onboarding/EmployerOnboardingWizard";
import StaffOnboardingWizard from "../components/onboarding/StaffOnboardingWizard";
import StaffGuidedOnboarding from "../components/onboarding/StaffGuidedOnboarding";

export default function Welcome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showEmployerWizard, setShowEmployerWizard] = useState(false);
  const [showGuidedOnboarding, setShowGuidedOnboarding] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Admin users go straight to admin dashboard
        if (currentUser.role === 'admin') {
          navigate(createPageUrl("AdminDashboard"));
          return;
        }
        
        // Check if user has profiles
        const staffProfiles = await base44.entities.StaffProfile.filter({ user_email: currentUser.email });
        const employerProfiles = await base44.entities.EmployerProfile.filter({ user_email: currentUser.email });
        
        // Staff users - route to dashboard if profile exists
        if (staffProfiles.length > 0) {
          navigate(createPageUrl("StaffDashboard"));
          return;
        }
        
        // Employer users - check subscription status
        if (employerProfiles.length > 0) {
          const profile = employerProfiles[0];
          const today = new Date();
          const trialEnd = profile.trial_end_date ? new Date(profile.trial_end_date) : null;
          
          // Active subscription - go to dashboard
          if (profile.subscription_status === 'active') {
            navigate(createPageUrl("EmployerDashboard"));
            return;
          }
          
          // Trial period active - go to dashboard
          if (profile.subscription_status === 'trial' && trialEnd && today <= trialEnd) {
            navigate(createPageUrl("EmployerDashboard"));
            return;
          }
          
          // Trial expired or suspended - redirect to billing
          if ((profile.subscription_status === 'trial' && trialEnd && today > trialEnd) || 
              profile.subscription_status === 'suspended' || 
              profile.subscription_status === 'cancelled') {
            navigate(createPageUrl("Billing"));
            return;
          }
          
          // Default - go to dashboard (shouldn't reach here normally)
          navigate(createPageUrl("EmployerDashboard"));
          return;
        }
        
        // No profile exists - stay on Welcome page for onboarding
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, [navigate]);

  const handleRoleSelection = async (role) => {
    setSelectedUserType(role);
    
    // Check if onboarding progress exists
    const onboardingProgress = await base44.entities.OnboardingProgress.filter({
      user_email: user.email
    });

    if (onboardingProgress.length === 0 || !onboardingProgress[0].skipped_onboarding) {
      // Show appropriate onboarding flow
      if (role === 'employer') {
        setShowEmployerWizard(true);
      } else {
        setShowGuidedOnboarding(true);
      }
    } else {
      // Skip directly to profile creation
      if (role === 'staff') {
        navigate(createPageUrl("StaffProfile"));
      } else if (role === 'employer') {
        navigate(createPageUrl("EmployerProfile"));
      }
    }
  };

  const handleOnboardingComplete = async () => {
    // This function needs to update the onboarding progress based on completion.
    // The previous logic for updating progress was inside the `handleOnboardingComplete`
    // within the file's original structure. For the new `OnboardingFlow` and `EmployerOnboardingWizard`,
    // it's assumed that the wizard/flow itself handles its own progress updates
    // upon completion or that the parent will handle the final navigation.
    // Given the outline, we'll navigate directly based on selectedUserType after completion.

    // No need to create/update OnboardingProgress here if the wizard itself handles it.
    // For now, just handle navigation based on the selected type.
    if (selectedUserType === 'staff') {
      navigate(createPageUrl("StaffProfile"));
    } else {
      // Employer onboarding completion should lead to dashboard, not profile creation as per the initial check.
      navigate(createPageUrl("EmployerDashboard"));
    }
  };

  const handleSkipOnboarding = async () => {
    // Mark as skipped
    const existingProgress = await base44.entities.OnboardingProgress.filter({
      user_email: user.email
    });

    const progressData = {
      user_email: user.email,
      user_type: selectedUserType,
      onboarding_status: 'in_progress', // Changed to 'in_progress' to reflect they skipped direct onboarding to profile creation
      skipped_onboarding: true,
      show_tooltips: false,
      started_date: existingProgress.length > 0 ? existingProgress[0].started_date : new Date().toISOString(), // Preserve original started_date if exists
      completed_steps: existingProgress.length > 0 ? existingProgress[0].completed_steps : ['welcome']
    };

    if (existingProgress.length > 0) {
      await base44.entities.OnboardingProgress.update(existingProgress[0].id, progressData);
    } else {
      await base44.entities.OnboardingProgress.create(progressData);
    }

    // Navigate to profile
    if (selectedUserType === 'staff') {
      navigate(createPageUrl("StaffProfile"));
    } else {
      navigate(createPageUrl("EmployerProfile"));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="animate-pulse text-blue-600 text-xl font-medium">Loading...</div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return null; // Will redirect to admin dashboard
  }

  return (
    <>
      {showGuidedOnboarding && (
        <StaffGuidedOnboarding
          user={user}
          open={showGuidedOnboarding}
          onClose={() => {
            setShowGuidedOnboarding(false);
            navigate(createPageUrl("StaffDashboard"));
          }}
        />
      )}

      {showOnboarding && selectedUserType === 'staff' && (
        <StaffOnboardingWizard
          user={user}
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      )}

      {showEmployerWizard && (
        <EmployerOnboardingWizard
          user={user}
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      )}
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
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
                onClick={() => handleRoleSelection('employer')}
                className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl"
              >
                <Building2 className="w-5 h-5 mr-2" />
                For Healthcare Facilities
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                onClick={() => handleRoleSelection('staff')}
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                For Healthcare Professionals
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Trust Indicators */}
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

        {/* Wave SVG Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Crisis Stats Section */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-red-100 text-red-700 border-red-200 px-4 py-2">
              The Healthcare Staffing Crisis
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Problem Is Real. The Solution Is Here.
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Healthcare facilities across America are struggling with critical staffing shortages. 
              Traditional agencies are slow and expensive. Your patients can't wait.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-red-200 bg-white shadow-lg">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-4xl font-bold text-red-600 mb-2">1.1M</h3>
                <p className="text-gray-900 font-semibold mb-2">Nurses Needed by 2030</p>
                <p className="text-sm text-gray-600">
                  National healthcare worker shortage projected to worsen significantly
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-white shadow-lg">
              <CardContent className="pt-8           text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-4xl font-bold text-orange-600 mb-2">73M</h3>
                <p className="text-gray-900 font-semibold mb-2">Baby Boomers Aging</p>
                <p className="text-sm text-gray-600">
                  Increasing demand for healthcare services and care providers
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-white shadow-lg">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-4xl font-bold text-amber-600 mb-2">$9B</h3>
                <p className="text-gray-900 font-semibold mb-2">Lost Revenue Annually</p>
                <p className="text-sm text-gray-600">
                  Due to staffing shortages and inability to admit patients
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Traditional Staffing Agencies Are Too Slow & Too Expensive
              </h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-red-600 font-semibold mb-2">❌ Traditional Agencies</p>
                  <ul className="text-left space-y-2 text-sm text-gray-700">
                    <li>• Days or weeks to fill shifts</li>
                    <li>• 40-60% markup on hourly rates</li>
                    <li>• Limited candidate pool</li>
                    <li>• Complex contracts & paperwork</li>
                    <li>• No real-time visibility</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-2 border-teal-200">
                  <p className="text-teal-600 font-semibold mb-2">✓ Shiftly Health</p>
                  <ul className="text-left space-y-2 text-sm text-gray-700">
                    <li>• <strong>Fill shifts in minutes</strong></li>
                    <li>• <strong>Save up to 40% on costs</strong></li>
                    <li>• <strong>Thousands of qualified professionals</strong></li>
                    <li>• <strong>Simple, digital process</strong></li>
                    <li>• <strong>Real-time tracking & updates</strong></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* For Healthcare Facilities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 px-4 py-2">
              For Healthcare Facilities
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Staff Your Facility in Minutes,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Not Days or Weeks
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a hospital, nursing home, assisted living facility, or home health agency—
              get immediate access to qualified, credentialed healthcare professionals when you need them most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-blue-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Fill Shifts in 15 Minutes</h3>
                <p className="text-gray-600 mb-4">
                  Post a shift and get qualified applicants within minutes. Our intelligent matching system finds professionals within a 15-mile radius who meet your exact requirements.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Instant notifications to qualified staff</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>GPS proximity matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time application tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-teal-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Save Up to 40% on Staffing Costs</h3>
                <p className="text-gray-600 mb-4">
                  Traditional agencies charge 40-60% markups. We charge a simple 5% platform fee, giving you massive savings while professionals earn more.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Transparent, predictable pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>No hidden fees or markups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Flexible subscription plans</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-100 hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">100% Verified & Credentialed</h3>
                <p className="text-gray-600 mb-4">
                  Every professional is thoroughly vetted. We verify licenses, certifications, background checks, and work history before they can accept shifts.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>License verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Background checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Skills assessment & ratings</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Facility Types */}
          <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Trusted by Healthcare Facilities Across All Sectors
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Hospitals</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Nursing Homes</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Assisted Living</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Stethoscope className="w-6 h-6 text-pink-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Home Health</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* For Healthcare Professionals Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 text-teal-700 px-4 py-2">
              For Healthcare Professionals
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Work on Your Terms,
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Earn What You Deserve
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're an RN, LPN, CNA, Doctor, Therapist, DSP, or Caregiver—
              find flexible shifts that fit your schedule, skills, and income goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Build Your Perfect Schedule
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Shifts</h4>
                    <p className="text-gray-600">
                      Browse hundreds of available shifts nearby. Work as much or as little as you want. Day, evening, night, or weekend shifts—you decide.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Earn More Money</h4>
                    <p className="text-gray-600">
                      No agency taking 40-60% of your pay. You earn competitive market rates plus instant pay options to access your earnings immediately after shifts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Instant Matching</h4>
                    <p className="text-gray-600">
                      Our AI matches you with shifts that fit your qualifications, location, and preferences. Get notified of opportunities within 15 miles of you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Build Your Reputation</h4>
                    <p className="text-gray-600">
                      Earn ratings and reviews from facilities. Top-rated professionals get priority access to high-paying shifts and long-term opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Card className="border-teal-200 shadow-xl">
                <CardContent className="p-8">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Who Can Join?
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Licensed Nurses</p>
                        <p className="text-sm text-gray-600">RN, LPN, NP</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Nursing Assistants</p>
                        <p className="text-sm text-gray-600">CNA, PCT, HHA</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Allied Health</p>
                        <p className="text-sm text-gray-600">PT, OT, ST, RT</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">DSPs & Caregivers</p>
                        <p className="text-sm text-gray-600">Direct Support, Home Care</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Physicians</p>
                        <p className="text-sm text-gray-600">MD, DO, PA</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRoleSelection('staff')}
                    className="w-full mt-6 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-lg py-6"
                  >
                    Join as Healthcare Professional
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Shiftly Health Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, fast, and efficient for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Facilities */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  For Healthcare Facilities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Post Your Shift</h4>
                      <p className="text-gray-600 text-sm">
                        Takes less than 2 minutes. Specify position, qualifications, date, time, and rate.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Get Instant Matches</h4>
                      <p className="text-gray-600 text-sm">
                        Our system notifies qualified professionals within 15 miles immediately.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Review Applications</h4>
                      <p className="text-gray-600 text-sm">
                        See qualifications, ratings, distance, and match scores. Accept the best fit.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Shift Completed</h4>
                      <p className="text-gray-600 text-sm">
                        Professional shows up, works the shift, and gets paid. You pay a simple 5% fee.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Professionals */}
            <Card className="border-2 border-teal-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  For Healthcare Professionals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Create Your Profile</h4>
                      <p className="text-gray-600 text-sm">
                        Add your credentials, certifications, experience, and preferences.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Get Notified</h4>
                      <p className="text-gray-600 text-sm">
                        Receive instant alerts when shifts matching your profile are posted nearby.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Apply in Seconds</h4>
                      <p className="text-gray-600 text-sm">
                        Review shift details and apply with one click. Get accepted within minutes.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Work & Get Paid</h4>
                      <p className="text-gray-600 text-sm">
                        Complete your shift, rate the facility, and get paid fast with instant pay options.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals & Facilities
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are saying about Shiftly Health
            </p>
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
                  "Shiftly Health saved our hospital during a critical staffing shortage. We filled 6 nursing shifts in under an hour. Incredible!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">St. Mary's Hospital</p>
                    <p className="text-sm text-gray-600">Boston, MA</p>
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
                  "As a traveling nurse, this platform lets me pick up extra shifts wherever I am. The instant pay feature is a game-changer!"
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
                    <p className="font-semibold text-gray-900">Sunshine Senior Living</p>
                    <p className="text-sm text-gray-600">Cambridge, MA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              No hidden fees. No surprises. Just honest pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-blue-200 shadow-xl">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-2xl text-center">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  For Healthcare Facilities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <p className="text-5xl font-bold text-blue-600 mb-2">5%</p>
                  <p className="text-gray-600">Platform Fee Per Shift</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited shift postings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Access to thousands of professionals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Real-time matching & notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Verified credentials & background checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">24/7 customer support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">14-day free trial</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handleRoleSelection('employer')}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-lg py-6"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-teal-200 shadow-xl">
              <CardHeader className="bg-teal-50">
                <CardTitle className="text-2xl text-center">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-teal-600" />
                  For Healthcare Professionals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <p className="text-5xl font-bold text-teal-600 mb-2">FREE</p>
                  <p className="text-gray-600">Always Free to Join & Apply</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">No membership fees ever</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Browse unlimited shifts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Instant notifications for nearby shifts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Competitive pay rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Instant pay options available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Build your professional reputation</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handleRoleSelection('staff')}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-lg py-6"
                >
                  Join Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKCIvPjwvc3ZnPg==')]" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Healthcare Staffing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals and facilities already using Shiftly Health to solve their staffing challenges.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={() => handleRoleSelection('employer')}
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              onClick={() => handleRoleSelection('staff')}
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Join as Professional
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-200 mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-300" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-300" />
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-300" />
              <span>Cancel anytime</span>
            </div>
          </div>

          <div className="pt-8 border-t border-blue-700">
            <p className="text-blue-200 mb-4">Questions? We're here to help.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
              <a href="tel:1-800-STAFFING" className="flex items-center justify-center gap-2 text-white hover:text-teal-300 transition-colors">
                <Phone className="w-4 h-4" />
                <span>1-800-STAFFING</span>
              </a>
              <a href="mailto:support@shiftlyhealth.com" className="flex items-center justify-center gap-2 text-white hover:text-teal-300 transition-colors">
                <Mail className="w-4 h-4" />
                <span>support@shiftlyhealth.com</span>
              </a>
            </div>
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
                <span className="text-white font-bold text-lg">Shiftly Health</span>
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
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">For Professionals</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Find Shifts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instant Pay</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Shiftly Health. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}