import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Briefcase,
  Building2,
  UserCircle,
  Calendar,
  DollarSign,
  Star,
  Heart,
  Zap,
  Award,
  Shield,
  TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STAFF_ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Shiftly Health! 🎉",
    icon: Sparkles,
    description: "Let's get you set up to find your next healthcare shift in minutes.",
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-lg text-gray-900 mb-3">Why You'll Love Working Here:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Find Shifts Fast</p>
                <p className="text-sm text-gray-600">Get matched to nearby shifts in seconds, not days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Earn More Money</p>
                <p className="text-sm text-gray-600">Keep 100% of your pay + instant payout options</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Work on Your Terms</p>
                <p className="text-sm text-gray-600">Choose shifts that fit your schedule and location</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>⏱️ Quick Setup:</strong> This will take just 3-5 minutes. Let's get started!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "profile_basics",
    title: "Complete Your Profile",
    icon: UserCircle,
    description: "Add your basic information so facilities can find you.",
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">What to Include:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Full Name & Contact</p>
                <p className="text-xs text-gray-600">So facilities can reach you about shifts</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Location & Address</p>
                <p className="text-xs text-gray-600">We'll match you with nearby shifts within your commute range</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Professional Bio</p>
                <p className="text-xs text-gray-600">Share your experience and what makes you a great hire</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900">
            <strong>💡 Pro Tip:</strong> Profiles with photos get 3x more shift offers!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "credentials",
    title: "Add Your Qualifications",
    icon: Award,
    description: "Tell us about your licenses, certifications, and skills.",
    content: (
      <div className="space-y-4">
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">What We Verify:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Professional License</p>
                <p className="text-xs text-gray-600">RN, LPN, CNA, etc.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Certifications</p>
                <p className="text-xs text-gray-600">CPR, BLS, ACLS, etc.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Special Skills</p>
                <p className="text-xs text-gray-600">Therap, feeding, etc.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Experience</p>
                <p className="text-xs text-gray-600">Years in healthcare</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>🔒 Secure:</strong> Your credentials are verified and encrypted. Only qualified matches see your profile.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "preferences",
    title: "Set Your Preferences",
    icon: Heart,
    description: "Tell us when and where you want to work.",
    content: (
      <div className="space-y-4">
        <div className="bg-teal-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Customize Your Experience:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Shift Times</p>
                <p className="text-xs text-gray-600">Day, evening, night, or flexible scheduling</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Days Available</p>
                <p className="text-xs text-gray-600">Weekdays, weekends, or holidays</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Max Commute</p>
                <p className="text-xs text-gray-600">How far you're willing to travel (miles)</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Desired Rate</p>
                <p className="text-xs text-gray-600">Minimum hourly rate you'll accept</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-900">
            <strong>🎯 Smart Matching:</strong> We'll only show you shifts that match your preferences!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "ready",
    title: "You're All Set! 🎊",
    icon: Star,
    description: "Start browsing and applying to shifts right now.",
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
          <h3 className="font-bold text-xl text-gray-900 mb-4 text-center">What Happens Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Browse Available Shifts</p>
                <p className="text-sm text-gray-600">See shifts near you with match scores showing compatibility</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Apply in Seconds</p>
                <p className="text-sm text-gray-600">One-click apply with your completed profile</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Get Accepted Fast</p>
                <p className="text-sm text-gray-600">Facilities typically respond within 15 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-gray-900">Work & Get Paid</p>
                <p className="text-sm text-gray-600">Complete shift, get rated, and access instant pay</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-900 font-semibold">
            🚀 Ready to find your next shift? Let's go!
          </p>
        </div>
      </div>
    ),
  },
];

const EMPLOYER_ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Shiftly Health! 🏥",
    icon: Sparkles,
    description: "Let's get you set up to fill shifts in minutes, not days.",
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-lg text-gray-900 mb-3">Why Facilities Choose Us:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Fill Shifts in 15 Minutes</p>
                <p className="text-sm text-gray-600">Post and get qualified applications instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Save Up to 40% on Costs</p>
                <p className="text-sm text-gray-600">Only 10% platform fee vs 40-60% agency markups</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">100% Verified Staff</p>
                <p className="text-sm text-gray-600">All credentials checked and background verified</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>🎯 14-Day Free Trial:</strong> Test drive the platform risk-free!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "facility_profile",
    title: "Set Up Your Facility",
    icon: Building2,
    description: "Tell staff about your healthcare facility.",
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">What to Include:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Facility Information</p>
                <p className="text-xs text-gray-600">Name, type, location, and license number</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">About Your Facility</p>
                <p className="text-xs text-gray-600">Description to attract quality staff</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Contact Details</p>
                <p className="text-xs text-gray-600">Primary contact for shift coordination</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900">
            <strong>💡 Pro Tip:</strong> Complete profiles receive 5x more applications!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "first_shift",
    title: "Post Your First Shift",
    icon: Calendar,
    description: "Learn how to create a shift posting that attracts top talent.",
    content: (
      <div className="space-y-4">
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">How to Create a Great Shift Post:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Choose Position Type</p>
                <p className="text-xs text-gray-600">RN, LPN, CNA, DSP, etc.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Set Date, Time & Rate</p>
                <p className="text-xs text-gray-600">Be competitive to attract the best staff</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Add Requirements</p>
                <p className="text-xs text-gray-600">Certifications, skills, experience needed</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Write Clear Description</p>
                <p className="text-xs text-gray-600">Duties, facility details, what to expect</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>⚡ Mark as "Urgent"</strong> for last-minute needs - you'll get notified professionals instantly!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "reviewing",
    title: "Review & Accept Applications",
    icon: Star,
    description: "Learn how to evaluate applicants and make hiring decisions.",
    content: (
      <div className="space-y-4">
        <div className="bg-teal-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">What You'll See for Each Applicant:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Match Score (0-100%)</p>
                <p className="text-xs text-gray-600">How well they fit your requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Star className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Ratings & Reviews</p>
                <p className="text-xs text-gray-600">From past facilities they've worked with</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Verified Credentials</p>
                <p className="text-xs text-gray-600">Licenses, certifications, background checks</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Award className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Experience & Reliability</p>
                <p className="text-xs text-gray-600">Shifts completed, attendance record</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Best Practice:</strong> Accept applications within 15 minutes for best results!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "ready",
    title: "You're Ready to Go! 🎉",
    icon: CheckCircle,
    description: "Start posting shifts and building your team.",
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
          <h3 className="font-bold text-xl text-gray-900 mb-4 text-center">Your Next Steps:</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Post Your First Shift</p>
                <p className="text-sm text-gray-600">Takes less than 2 minutes to create</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Review Applications</p>
                <p className="text-sm text-gray-600">Get notified of qualified matches instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Accept & Coordinate</p>
                <p className="text-sm text-gray-600">Communicate shift details and confirm</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-gray-900">Rate Your Staff</p>
                <p className="text-sm text-gray-600">Build your favorites list for future shifts</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-900 font-semibold">
            🚀 Let's fill your first shift! You've got this.
          </p>
        </div>
      </div>
    ),
  },
];

export default function OnboardingFlow({ userType, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(true);
  
  const steps = userType === 'staff' ? STAFF_ONBOARDING_STEPS : EMPLOYER_ONBOARDING_STEPS;
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setShowModal(false);
    onComplete();
  };

  const handleSkipOnboarding = () => {
    setShowModal(false);
    onSkip();
  };

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <StepIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {currentStepData.title}
                </DialogTitle>
                <p className="text-sm text-gray-600">{currentStepData.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 text-center">{Math.round(progress)}% Complete</p>
          </div>
        </DialogHeader>

        <div className="py-6">
          {currentStepData.content}
        </div>

        <DialogFooter className="flex justify-between items-center gap-3 sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkipOnboarding}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip Tour
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              className={currentStep === totalSteps - 1 
                ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700" 
                : "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              }
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}