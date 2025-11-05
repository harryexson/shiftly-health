import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Building2,
  Sparkles,
  Briefcase,
  DollarSign,
  CreditCard,
  Star,
  Heart,
  Ban,
  Info,
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
  Zap,
  Calendar,
  Users,
  Shield
} from "lucide-react";

const FACILITY_TYPES = [
  "Hospital",
  "Nursing Home",
  "Assisted Living",
  "Home Health",
  "Rehabilitation Center",
  "Mental Health Facility",
  "Group Home",
  "Other"
];

const STAFF_TYPES = [
  { value: "licensed", label: "Licensed Healthcare Professional (RN, LPN, NP)" },
  { value: "unlicensed_dsp", label: "Direct Support Professional (DSP)" },
  { value: "unlicensed_caregiver", label: "Caregiver (CNA, HHA)" }
];

const QUALIFICATIONS = [
  "CPR", "First Aid", "Mental Health Training", "ISP Training",
  "Behavior Support", "Therap", "Drivers License", "Feeding Assistance",
  "Bathing", "Grooming", "Medical Transport"
];

export default function EmployerOnboardingWizard({ user, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [facilityData, setFacilityData] = useState({
    facility_name: "",
    facility_type: "",
    contact_name: user?.full_name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    description: "",
    website: "",
    license_number: ""
  });

  const [shiftData, setShiftData] = useState({
    title: "",
    description: "",
    staff_type_required: "",
    required_qualifications: [],
    shift_date: "",
    start_time: "",
    end_time: "",
    hourly_rate: "",
    number_of_positions: 1,
    urgent: false,
    special_requirements: ""
  });

  const [showModal, setShowModal] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const steps = [
    {
      id: "welcome",
      title: "Welcome to HealthStaff Connect! 🏥",
      icon: Sparkles,
      description: "Let's get your facility set up to start filling shifts",
    },
    {
      id: "facility_profile",
      title: "Set Up Your Facility Profile",
      icon: Building2,
      description: "Tell staff about your healthcare facility",
    },
    {
      id: "first_shift",
      title: "Post Your First Shift",
      icon: Briefcase,
      description: "Create a shift posting to attract qualified staff",
    },
    {
      id: "review_process",
      title: "Understanding Applications",
      icon: Star,
      description: "Learn how to evaluate and accept staff",
    },
    {
      id: "advanced_features",
      title: "Advanced Features",
      icon: Heart,
      description: "Staff preferences and management tools",
    },
    {
      id: "payment_setup",
      title: "Payment & Billing",
      icon: CreditCard,
      description: "Set up your billing information",
    },
    {
      id: "complete",
      title: "You're All Set! 🎉",
      icon: CheckCircle,
      description: "Start managing your healthcare staffing",
    },
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);
      
      return await base44.entities.EmployerProfile.create({
        ...data,
        user_email: user.email,
        subscription_plan: 'trial',
        subscription_status: 'trial',
        trial_end_date: trialEndDate.toISOString().split('T')[0],
      });
    },
  });

  const handleNext = async () => {
    // Validate and save at specific steps
    if (currentStep === 1) { // Facility profile step
      if (!facilityData.facility_name || !facilityData.facility_type || !facilityData.phone) {
        alert("Please fill in all required fields");
        return;
      }
      await saveProfileMutation.mutateAsync(facilityData);
    }

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

  const handleComplete = async () => {
    // Create onboarding progress
    await base44.entities.OnboardingProgress.create({
      user_email: user.email,
      user_type: 'employer',
      onboarding_status: 'in_progress',
      completed_steps: ['welcome', 'facility_profile'],
      checklist_items: {
        profile_created: true,
        first_shift_posted: false,
        first_shift_accepted: false,
        payment_method_added: false
      },
      started_date: new Date().toISOString(),
      show_tooltips: true
    });

    setShowModal(false);
    onComplete();
  };

  const handleSkipWizard = () => {
    setShowModal(false);
    onSkip();
  };

  const toggleQualification = (qual) => {
    setShiftData(prev => ({
      ...prev,
      required_qualifications: prev.required_qualifications.includes(qual)
        ? prev.required_qualifications.filter(q => q !== qual)
        : [...prev.required_qualifications, qual]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Welcome to the Future of Healthcare Staffing! 🚀
              </h3>
              <p className="text-gray-700 text-center mb-6 text-lg">
                We'll help you get set up in just 5 minutes. Here's what we'll cover:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Facility Profile</h4>
                  </div>
                  <p className="text-sm text-gray-600">Set up your facility information and branding</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-teal-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Post a Shift</h4>
                  </div>
                  <p className="text-sm text-gray-600">Learn how to create effective shift postings</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Review Applications</h4>
                  </div>
                  <p className="text-sm text-gray-600">Understand our matching and review process</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Billing Setup</h4>
                  </div>
                  <p className="text-sm text-gray-600">Configure payment and billing information</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">🎁 14-Day Free Trial</h4>
                  <p className="text-sm text-amber-800">
                    Test drive all features with no credit card required. Cancel anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">15 min</div>
                <p className="text-sm text-gray-600">Avg. shift fill time</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-600">40%</div>
                <p className="text-sm text-gray-600">Cost savings</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">95%</div>
                <p className="text-sm text-gray-600">Match success rate</p>
              </div>
            </div>
          </div>
        );

      case 1: // Facility Profile
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Why This Matters</h4>
                  <p className="text-sm text-blue-800">
                    A complete profile helps qualified staff find and trust your facility. 
                    Profiles with descriptions get 5x more applications!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facility_name" className="flex items-center gap-2">
                  Facility Name * <Building2 className="w-4 h-4 text-gray-400" />
                </Label>
                <Input
                  id="facility_name"
                  value={facilityData.facility_name}
                  onChange={(e) => setFacilityData({...facilityData, facility_name: e.target.value})}
                  placeholder="e.g., Memorial Hospital"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="facility_type">Facility Type *</Label>
                <Select
                  value={facilityData.facility_type}
                  onValueChange={(value) => setFacilityData({...facilityData, facility_type: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FACILITY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contact_name" className="flex items-center gap-2">
                  Contact Name * <Mail className="w-4 h-4 text-gray-400" />
                </Label>
                <Input
                  id="contact_name"
                  value={facilityData.contact_name}
                  onChange={(e) => setFacilityData({...facilityData, contact_name: e.target.value})}
                  placeholder="Your name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  Phone Number * <Phone className="w-4 h-4 text-gray-400" />
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={facilityData.phone}
                  onChange={(e) => setFacilityData({...facilityData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="flex items-center gap-2">
                About Your Facility <FileText className="w-4 h-4 text-gray-400" />
              </Label>
              <Textarea
                id="description"
                value={facilityData.description}
                onChange={(e) => setFacilityData({...facilityData, description: e.target.value})}
                placeholder="Tell staff what makes your facility great to work at..."
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Mention your facility's values, work environment, and any perks
              </p>
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                Location <MapPin className="w-4 h-4 text-gray-400" />
              </Label>
              <Input
                id="address"
                value={facilityData.address}
                onChange={(e) => setFacilityData({...facilityData, address: e.target.value})}
                placeholder="Street address"
                className="mt-2"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={facilityData.city}
                  onChange={(e) => setFacilityData({...facilityData, city: e.target.value})}
                  placeholder="City"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={facilityData.state}
                  onChange={(e) => setFacilityData({...facilityData, state: e.target.value})}
                  placeholder="State"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={facilityData.zip_code}
                  onChange={(e) => setFacilityData({...facilityData, zip_code: e.target.value})}
                  placeholder="12345"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 2: // First Shift (Preview only in wizard)
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Creating Great Shift Postings</h4>
                  <p className="text-sm text-purple-800">
                    After completing this wizard, you'll be guided through posting your first shift. 
                    Here's what makes a great posting:
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-blue-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Clear Position Details</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Specific job title (RN, LPN, CNA)</li>
                    <li>• Required certifications</li>
                    <li>• Years of experience needed</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-teal-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-teal-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Competitive Pay</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Market rates attract best staff</li>
                    <li>• RNs: $35-55/hr | LPNs: $25-35/hr</li>
                    <li>• CNAs: $18-25/hr | DSPs: $16-22/hr</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Complete Schedule</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Exact date and times</li>
                    <li>• Break information</li>
                    <li>• Shift duration</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Detailed Description</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Main responsibilities</li>
                    <li>• Patient population/unit</li>
                    <li>• Facility culture & environment</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">💡 Pro Tip: Use "Urgent" Flag</h4>
                  <p className="text-sm text-amber-800">
                    For last-minute needs (within 24-48 hours), mark shifts as "Urgent" to get priority visibility 
                    and instant notifications to professionals who prefer urgent shifts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Review Process
        return (
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-teal-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-teal-900 mb-1">Smart Matching Algorithm</h4>
                  <p className="text-sm text-teal-800">
                    Our AI matches staff to your shifts based on qualifications, location, ratings, 
                    and preferences. You'll see a match score for each applicant.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">What You'll See for Each Applicant:</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Match Score (0-100%)</h5>
                    <p className="text-sm text-gray-600">
                      Based on qualifications, distance, ratings, preferences, and past performance. 
                      Higher scores mean better fit for your requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Verified Credentials</h5>
                    <p className="text-sm text-gray-600">
                      All licenses, certifications, and background checks are verified before they can apply. 
                      You'll see their credentials and expiration dates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Ratings & Reviews</h5>
                    <p className="text-sm text-gray-600">
                      See ratings from other facilities for punctuality, professionalism, clinical skills, 
                      and teamwork. Read detailed reviews from past employers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Distance & Availability</h5>
                    <p className="text-sm text-gray-600">
                      See how far they are from your facility and their availability preferences. 
                      Closer staff are more likely to accept and arrive on time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Quick Decision Metrics</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Total shifts completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Reliability score (attendance)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Response time to shifts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Years of experience</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Advanced Features
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Staff Preference Management</h4>
                  <p className="text-sm text-purple-800">
                    Build your preferred staff roster and block problematic workers. 
                    Our algorithm prioritizes your favorites for future shifts.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Favorite Staff */}
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">Favorite Staff</h4>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-700">
                      When you have a great experience with a staff member:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Click the "Add to Favorites" button</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>They get <strong>priority notifications</strong> for your shifts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Appear first in search results</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Build your reliable staff roster</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-green-800">
                      <strong>💡 Pro Tip:</strong> Add detailed notes about each favorite to remember 
                      their strengths for specific shifts or units.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Block Staff */}
              <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Ban className="w-6 h-6 text-red-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">Block Staff</h4>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-700">
                      If you have a negative experience:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Click "Block Staff Member"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>They <strong>cannot see</strong> your future shifts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Cannot apply to any of your postings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Keep your facility safe and reliable</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="text-xs text-red-800">
                      <strong>🔒 Privacy:</strong> Blocked staff won't know they're blocked. 
                      They simply won't see your shifts appear in their feed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">Where to Manage Preferences</h4>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <ArrowRight className="w-4 h-4" />
                <span>Navigate to <strong>"Manage Staff Preferences"</strong> from your dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800 mt-2">
                <ArrowRight className="w-4 h-4" />
                <span>Or click the ♥️ or 🚫 icons next to any staff member's name</span>
              </div>
            </div>
          </div>
        );

      case 5: // Payment Setup
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">Simple, Transparent Pricing</h4>
                  <p className="text-sm text-green-800">
                    Only 10% platform fee per shift. No hidden charges, no monthly fees during trial.
                    You only pay when you successfully fill shifts.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">How Billing Works:</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Post Shifts Free</h5>
                    <p className="text-sm text-gray-600">
                      No cost to post shifts. No upfront fees. No subscription during trial.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-lg">
                  <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Staff Works Shift</h5>
                    <p className="text-sm text-gray-600">
                      Accept qualified staff, they complete the shift. You confirm hours worked.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">You Get Invoiced</h5>
                    <p className="text-sm text-gray-600">
                      Receive weekly invoice: (Staff hourly rate × hours) + 10% platform fee
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Staff Gets Paid</h5>
                    <p className="text-sm text-gray-600">
                      We handle payroll. Staff receives 100% of their hourly rate + instant pay options.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50">
              <CardContent className="pt-6">
                <h4 className="font-bold text-gray-900 mb-4 text-lg">💰 Cost Comparison Example:</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-900">Traditional Agency:</span>
                      <span className="text-lg font-bold text-red-600">$720</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      RN @ $30/hr base + 60% markup × 8 hours
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-2 border-teal-300">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-teal-900">HealthStaff Connect:</span>
                      <span className="text-lg font-bold text-teal-600">$432</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      RN @ $45/hr (staff gets more!) + 10% platform fee × 8 hours
                    </p>
                  </div>

                  <div className="text-center pt-2">
                    <div className="text-2xl font-bold text-green-600">Save $288 per shift!</div>
                    <p className="text-sm text-gray-600 mt-1">That's 40% cost savings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">📝 After Trial</h4>
              <p className="text-sm text-amber-800">
                After your 14-day trial, you can add a payment method in the Billing section. 
                No credit card required to get started!
              </p>
            </div>
          </div>
        );

      case 6: // Complete
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-8 border-2 border-green-200 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Congratulations! 🎉
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Your facility is now set up and ready to start filling shifts!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Profile Complete</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your facility profile is live and visible to qualified healthcare professionals
                  </p>
                </CardContent>
              </Card>

              <Card className="border-teal-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-teal-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">14-Day Free Trial</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Test all features with no commitment. Cancel anytime.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 mb-4 text-lg text-center">What Happens Next?</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Post Your First Shift</p>
                    <p className="text-sm text-gray-600">We'll guide you through creating a shift posting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Receive Applications</p>
                    <p className="text-sm text-gray-600">Get notified within minutes of qualified matches</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Review & Accept</p>
                    <p className="text-sm text-gray-600">See match scores, ratings, and credentials</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Shift Filled!</p>
                    <p className="text-sm text-gray-600">Staff shows up, works, and you rate them for future reference</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">📍</div>
                <p className="text-sm font-semibold text-gray-900">Dashboard</p>
                <p className="text-xs text-gray-600">Track all your shifts</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-600 mb-1">💬</div>
                <p className="text-sm font-semibold text-gray-900">Support</p>
                <p className="text-xs text-gray-600">24/7 help available</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">📊</div>
                <p className="text-sm font-semibold text-gray-900">Analytics</p>
                <p className="text-xs text-gray-600">Track cost savings</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <DialogDescription>{currentStepData.description}</DialogDescription>
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
          {renderStepContent()}
        </div>

        <DialogFooter className="flex justify-between items-center gap-3 sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkipWizard}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip Setup
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && currentStep < totalSteps - 1 && (
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
              disabled={saveProfileMutation.isPending}
              className={currentStep === totalSteps - 1 
                ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700" 
                : "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              }
            >
              {saveProfileMutation.isPending ? (
                'Saving...'
              ) : currentStep === totalSteps - 1 ? (
                <>
                  Go to Dashboard
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : currentStep === 1 ? (
                <>
                  Save & Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
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