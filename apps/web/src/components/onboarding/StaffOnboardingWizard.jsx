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
import { Switch } from "@/components/ui/switch";
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
  Sparkles,
  Briefcase,
  DollarSign,
  Star,
  Heart,
  Zap,
  Award,
  Shield,
  UserCircle,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Sun,
  Moon,
  Sunrise,
  Upload,
  MessageSquare,
  Target,
  TrendingUp
} from "lucide-react";
import Logo from "@/components/branding/Logo";

const QUALIFICATIONS = [
  "CPR", "First Aid", "Mental Health Training", "ISP Training",
  "Behavior Support", "Therap", "Drivers License", "Feeding Assistance",
  "Bathing", "Grooming", "Medical Transport"
];

export default function StaffOnboardingWizard({ user, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    phone: "",
    staff_type: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    bio: "",
    years_experience: "",
    hourly_rate: "",
    qualifications: [],
    shift_preferences: {
      preferred_shift_times: [],
      willing_to_work_weekends: true,
      willing_to_work_holidays: true,
      max_commute_miles: 25,
      prefers_urgent_shifts: false
    }
  });

  const [showModal, setShowModal] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const steps = [
    { id: "welcome", title: "Welcome to Shiftly Health! 🎉", icon: Sparkles, description: "Your gateway to flexible healthcare work" },
    { id: "why_shiftly", title: "Why Shiftly Health?", icon: Target, description: "Features that set us apart" },
    { id: "basic_info", title: "Your Profile", icon: UserCircle, description: "Tell us about yourself" },
    { id: "qualifications", title: "Your Credentials", icon: Award, description: "Licenses and certifications" },
    { id: "preferences", title: "Work Preferences", icon: Heart, description: "When and how you want to work" },
    { id: "instant_pay", title: "Get Paid Fast", icon: Zap, description: "Instant pay explained" },
    { id: "complete", title: "You're All Set! 🚀", icon: CheckCircle, description: "Start finding shifts" },
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.StaffProfile.create({
        ...data,
        user_email: user.email,
        verification_status: 'pending',
        profile_status: 'active'
      });
    },
  });

  const handleNext = async () => {
    if (currentStep === 2) {
      if (!profileData.full_name || !profileData.phone || !profileData.staff_type) {
        alert("Please fill in all required fields");
        return;
      }
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
    try {
      await saveProfileMutation.mutateAsync(profileData);
      
      await base44.entities.OnboardingProgress.create({
        user_email: user.email,
        user_type: 'staff',
        onboarding_status: 'in_progress',
        completed_steps: ['welcome', 'basic_info', 'qualifications', 'preferences'],
        checklist_items: {
          profile_created: true,
          qualifications_added: profileData.qualifications.length > 0,
          availability_set: true
        },
        started_date: new Date().toISOString(),
        show_tooltips: true
      });

      setShowModal(false);
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const toggleQualification = (qual) => {
    setProfileData(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(qual)
        ? prev.qualifications.filter(q => q !== qual)
        : [...prev.qualifications, qual]
    }));
  };

  const toggleShiftTime = (time) => {
    setProfileData(prev => ({
      ...prev,
      shift_preferences: {
        ...prev.shift_preferences,
        preferred_shift_times: prev.shift_preferences.preferred_shift_times.includes(time)
          ? prev.shift_preferences.preferred_shift_times.filter(t => t !== time)
          : [...prev.shift_preferences.preferred_shift_times, time]
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Logo size="large" className="justify-center mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to the Future of Healthcare Work!
              </h3>
              <p className="text-gray-600 text-lg">
                Let's get you set up in just 5 minutes
              </p>
            </div>

            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 border-2 border-sky-200">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">What You'll Get:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Instant Pay</p>
                    <p className="text-sm text-gray-600">Get paid in 30 minutes after your shift</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI Matching</p>
                    <p className="text-sm text-gray-600">Shifts matched to your skills & preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Direct Chat</p>
                    <p className="text-sm text-gray-600">Message facilities instantly in-app</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Earn More</p>
                    <p className="text-sm text-gray-600">No agency taking 40% of your pay</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-3xl font-bold text-sky-600">15 min</div>
                <p className="text-sm text-gray-600">Avg. match time</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-3xl font-bold text-green-600">30 min</div>
                <p className="text-sm text-gray-600">Instant pay speed</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-3xl font-bold text-purple-600">100%</div>
                <p className="text-sm text-gray-600">Keep your earnings</p>
              </div>
            </div>
          </div>
        );

      case 1: // Why Shiftly
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Features That Make Shiftly Health Different
              </h3>
            </div>

            <div className="grid gap-4">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">Instant Pay (Earned Wage Access)</h4>
                      <p className="text-gray-700">
                        Access your earnings <strong>within 30 minutes</strong> of completing your shift. 
                        No waiting for weekly payroll. Powered by Stripe Connect.
                      </p>
                      <Badge className="mt-2 bg-green-600">Industry First</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-sky-200 bg-sky-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">AI-Powered Smart Matching</h4>
                      <p className="text-gray-700">
                        Our algorithm matches you based on <strong>skills, experience, location, ratings, 
                        and preferences</strong>. Only see shifts that truly fit you.
                      </p>
                      <Badge className="mt-2 bg-sky-600">95% Match Accuracy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">Real-Time In-App Messaging</h4>
                      <p className="text-gray-700">
                        Direct messaging with facilities. Get shift details, ask questions, 
                        and coordinate instantly. <strong>Push notifications</strong> keep you updated.
                      </p>
                      <Badge className="mt-2 bg-purple-600">Built-In Communication</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2: // Basic Info
        return (
          <div className="space-y-6">
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-sm text-sky-900">
                <strong>💡 Complete profiles get 5x more shift offers!</strong> 
                Help facilities find you faster.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  Full Name * <UserCircle className="w-4 h-4 text-gray-400" />
                </Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  placeholder="Your full name"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  Phone Number * <Phone className="w-4 h-4 text-gray-400" />
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="staff_type">What type of healthcare professional are you? *</Label>
              <Select
                value={profileData.staff_type}
                onValueChange={(value) => setProfileData({...profileData, staff_type: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select your role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="licensed">Licensed Healthcare Professional (RN, LPN, NP)</SelectItem>
                  <SelectItem value="unlicensed_dsp">Direct Support Professional (DSP)</SelectItem>
                  <SelectItem value="unlicensed_caregiver">Caregiver (CNA, HHA)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="years_experience">Years of Experience *</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min="0"
                  max="50"
                  value={profileData.years_experience}
                  onChange={(e) => setProfileData({...profileData, years_experience: e.target.value})}
                  placeholder="e.g., 5"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="hourly_rate">Desired Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  value={profileData.hourly_rate}
                  onChange={(e) => setProfileData({...profileData, hourly_rate: e.target.value})}
                  placeholder="e.g., 25"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell facilities about your experience, specialties, and what makes you a great hire..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                Location <MapPin className="w-4 h-4 text-gray-400" />
              </Label>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  value={profileData.city}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  placeholder="City"
                />
                <Input
                  value={profileData.state}
                  onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                  placeholder="State"
                />
                <Input
                  value={profileData.zip_code}
                  onChange={(e) => setProfileData({...profileData, zip_code: e.target.value})}
                  placeholder="ZIP Code"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Qualifications
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Why Verification Matters</h4>
                  <p className="text-sm text-purple-800">
                    Verified credentials help you get more shifts. Facilities trust verified professionals 
                    and our AI ranks you higher in matches.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Select your certifications & skills:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {QUALIFICATIONS.map((qual) => (
                  <button
                    key={qual}
                    type="button"
                    onClick={() => toggleQualification(qual)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      profileData.qualifications.includes(qual)
                        ? 'border-sky-500 bg-sky-50 text-sky-900'
                        : 'border-gray-200 hover:border-sky-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {profileData.qualifications.includes(qual) && (
                        <CheckCircle className="w-4 h-4 text-sky-600" />
                      )}
                      <span className="text-sm font-medium">{qual}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Upload className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">📄 Document Upload</h4>
                  <p className="text-sm text-amber-800">
                    After completing this wizard, you can upload your licenses, certifications, and 
                    training documents from your Profile page. Our team verifies them within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Preferences
        return (
          <div className="space-y-6">
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-sm text-sky-900">
                <strong>🎯 Smart Matching:</strong> We'll only show you shifts that match your preferences. 
                Staff with flexible availability get 3x more offers!
              </p>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">When do you prefer to work?</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => toggleShiftTime('day')}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    profileData.shift_preferences.preferred_shift_times.includes('day')
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-200'
                  }`}
                >
                  <Sun className={`w-8 h-8 mx-auto mb-2 ${
                    profileData.shift_preferences.preferred_shift_times.includes('day')
                      ? 'text-yellow-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">Day</div>
                  <div className="text-xs text-gray-600">7am - 3pm</div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleShiftTime('evening')}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    profileData.shift_preferences.preferred_shift_times.includes('evening')
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <Sunrise className={`w-8 h-8 mx-auto mb-2 ${
                    profileData.shift_preferences.preferred_shift_times.includes('evening')
                      ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">Evening</div>
                  <div className="text-xs text-gray-600">3pm - 11pm</div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleShiftTime('night')}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    profileData.shift_preferences.preferred_shift_times.includes('night')
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <Moon className={`w-8 h-8 mx-auto mb-2 ${
                    profileData.shift_preferences.preferred_shift_times.includes('night')
                      ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">Night</div>
                  <div className="text-xs text-gray-600">11pm - 7am</div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleShiftTime('flexible')}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    profileData.shift_preferences.preferred_shift_times.includes('flexible')
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <Clock className={`w-8 h-8 mx-auto mb-2 ${
                    profileData.shift_preferences.preferred_shift_times.includes('flexible')
                      ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">Flexible</div>
                  <div className="text-xs text-gray-600">Any time</div>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <Label className="font-semibold">Work Weekends</Label>
                  <p className="text-xs text-gray-600">Available Saturdays & Sundays</p>
                </div>
                <Switch
                  checked={profileData.shift_preferences.willing_to_work_weekends}
                  onCheckedChange={(checked) => setProfileData({
                    ...profileData,
                    shift_preferences: { ...profileData.shift_preferences, willing_to_work_weekends: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <Label className="font-semibold">Urgent Shifts</Label>
                  <p className="text-xs text-gray-600">Last-minute opportunities</p>
                </div>
                <Switch
                  checked={profileData.shift_preferences.prefers_urgent_shifts}
                  onCheckedChange={(checked) => setProfileData({
                    ...profileData,
                    shift_preferences: { ...profileData.shift_preferences, prefers_urgent_shifts: checked }
                  })}
                />
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Label htmlFor="max_commute" className="font-semibold">Maximum Commute Distance (miles)</Label>
              <Input
                id="max_commute"
                type="number"
                min="5"
                max="100"
                value={profileData.shift_preferences.max_commute_miles}
                onChange={(e) => setProfileData({
                  ...profileData,
                  shift_preferences: { ...profileData.shift_preferences, max_commute_miles: parseInt(e.target.value) || 25 }
                })}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 5: // Instant Pay
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Get Paid in 30 Minutes! ⚡
              </h3>
              <p className="text-gray-700">
                Shiftly Health's Instant Pay lets you access your earnings immediately after your shift.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">How Instant Pay Works:</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-lg">
                  <div className="w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Complete Your Shift</h5>
                    <p className="text-sm text-gray-600">Work the shift and clock out as normal</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Facility Confirms Hours</h5>
                    <p className="text-sm text-gray-600">Employer approves your worked hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Request Instant Pay</h5>
                    <p className="text-sm text-gray-600">Tap "Get Paid Now" in the app</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Money in Your Account</h5>
                    <p className="text-sm text-gray-600">Funds arrive within 30 minutes via Stripe</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <h4 className="font-bold text-green-900 mb-2">💰 Instant Pay vs. Weekly Payroll</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="font-semibold text-green-900">Instant Pay</p>
                    <p className="text-sm text-gray-600">Get paid in 30 minutes (small fee)</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="font-semibold text-gray-900">Weekly Payroll</p>
                    <p className="text-sm text-gray-600">Free automatic deposits every week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6: // Complete
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-sky-50 rounded-xl p-8 border-2 border-green-200 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                You're All Set! 🎉
              </h3>
              <p className="text-lg text-gray-700">
                Your profile is ready. Start finding shifts now!
              </p>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
              <h4 className="font-bold text-sky-900 mb-4 text-lg text-center">What Happens Next?</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-gray-900">Browse Available Shifts</p>
                    <p className="text-sm text-gray-600">See shifts near you with match scores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-gray-900">Apply in Seconds</p>
                    <p className="text-sm text-gray-600">One-click apply with your profile</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-gray-900">Get Accepted & Work</p>
                    <p className="text-sm text-gray-600">Facilities respond within 15 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-semibold text-gray-900">Get Paid Fast</p>
                    <p className="text-sm text-gray-600">Instant pay or weekly direct deposit</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <Briefcase className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Browse Shifts</p>
                <p className="text-xs text-gray-600">Find opportunities</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Upload Docs</p>
                <p className="text-xs text-gray-600">Get verified</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Chat</p>
                <p className="text-xs text-gray-600">Message facilities</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full flex items-center justify-center">
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
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(progress)}% Complete</span>
              <span>{totalSteps - currentStep - 1} steps remaining</span>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {renderStepContent()}
        </div>

        <DialogFooter className="flex justify-between items-center gap-3 sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => { setShowModal(false); onSkip(); }}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for Now
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={saveProfileMutation.isPending}
              className={currentStep === totalSteps - 1 
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
              }
            >
              {saveProfileMutation.isPending ? 'Saving...' : currentStep === totalSteps - 1 ? (
                <>Find Shifts Now <Sparkles className="w-4 h-4 ml-2" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}