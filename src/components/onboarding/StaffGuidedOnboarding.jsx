import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Shield,
  Upload,
  CheckCircle,
  Award,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileText,
  Calendar
} from "lucide-react";
import { X } from "lucide-react";

const QUALIFICATIONS = [
  "CPR", "First Aid", "Mental Health Training", "ISP Training",
  "Behavior Support", "Therap", "Drivers License", "Feeding Assistance",
  "Bathing", "Grooming", "Medical Transport"
];

export default function StaffGuidedOnboarding({ user, open, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: "",
    staff_type: "licensed",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    license_number: "",
    license_state: "",
    license_expiry: "",
    qualifications: [],
    hourly_rate: "",
    bio: "",
    years_experience: "",
    shift_preferences: {
      preferred_shift_times: [],
      willing_to_work_weekends: true,
      willing_to_work_holidays: true,
      max_commute_miles: 25,
      prefers_urgent_shifts: false
    }
  });
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const steps = [
    {
      id: 'profile',
      title: 'Personal Information',
      icon: User,
      description: 'Basic details about you'
    },
    {
      id: 'qualifications',
      title: 'Qualifications & Experience',
      icon: Award,
      description: 'Your certifications and skills'
    },
    {
      id: 'credentials',
      title: 'Upload Credentials',
      icon: Upload,
      description: 'License and certifications'
    },
    {
      id: 'background',
      title: 'Background Check',
      icon: Shield,
      description: 'Initiate verification'
    },
    {
      id: 'complete',
      title: 'All Set!',
      icon: CheckCircle,
      description: 'Start finding shifts'
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const saveProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const existing = await base44.entities.StaffProfile.filter({ 
        user_email: user.email 
      });
      
      if (existing.length > 0) {
        return await base44.entities.StaffProfile.update(existing[0].id, profileData);
      } else {
        return await base44.entities.StaffProfile.create(profileData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profile'] });
    }
  });

  const initiateBackgroundCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('initiateBackgroundCheck', {
        staff_email: user.email,
        first_name: formData.full_name.split(' ')[0],
        last_name: formData.full_name.split(' ').slice(1).join(' '),
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code
      });
      return response.data;
    }
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, docType, docName, expiryDate }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.ComplianceRecord.create({
        user_email: user.email,
        record_type: docType,
        document_name: docName,
        document_url: file_url,
        verification_status: 'pending',
        issued_date: new Date().toISOString(),
        expiry_date: expiryDate || null
      });

      return { docName, file_url };
    },
    onSuccess: (data) => {
      setUploadedDocs([...uploadedDocs, data.docName]);
      queryClient.invalidateQueries({ queryKey: ['compliance-records'] });
    }
  });

  const handleDocumentUpload = async (e, docType, docName) => {
    const file = e.target.files[0];
    if (!file) return;

    let expiryDate = null;
    if (docType === 'license_verification' || docType === 'certification') {
      expiryDate = prompt('Enter expiry date (YYYY-MM-DD) or leave blank:');
    }

    setUploadingDoc(true);
    try {
      await uploadDocumentMutation.mutateAsync({ file, docType, docName, expiryDate });
    } finally {
      setUploadingDoc(false);
      e.target.value = null;
    }
  };

  const handleNext = async () => {
    if (currentStep === 0 || currentStep === 1) {
      // Save profile data
      await saveProfileMutation.mutateAsync({
        ...formData,
        user_email: user.email
      });
    }

    if (currentStep === 3) {
      // Initiate background check
      await initiateBackgroundCheckMutation.mutateAsync();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await base44.entities.OnboardingProgress.create({
        user_email: user.email,
        user_type: 'staff',
        onboarding_status: 'completed',
        current_step: steps.length,
        completed_steps: steps.map(s => s.id),
        checklist_items: {
          profile_created: true,
          profile_photo_uploaded: false,
          qualifications_added: formData.qualifications.length > 0,
          availability_set: true
        },
        completed_date: new Date().toISOString()
      });

      onClose();
      navigate(createPageUrl("StaffDashboard"));
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleQualification = (qual) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(qual)
        ? prev.qualifications.filter(q => q !== qual)
        : [...prev.qualifications, qual]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.full_name && formData.phone && formData.staff_type;
      case 1:
        return formData.years_experience;
      case 2:
        return uploadedDocs.length > 0;
      case 3:
        return formData.address && formData.city && formData.state && formData.zip_code;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Welcome to Shiftly Health! 🎉
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center flex-1 ${
                    idx <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    idx <= currentStep ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-center hidden md:block">{step.title}</p>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
          </p>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Staff Type *</Label>
                  <Select
                    value={formData.staff_type}
                    onValueChange={(value) => setFormData({...formData, staff_type: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="licensed">Licensed Healthcare Professional</SelectItem>
                      <SelectItem value="unlicensed_dsp">Direct Support Professional (DSP)</SelectItem>
                      <SelectItem value="unlicensed_caregiver">Caregiver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Professional Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell employers about your experience..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Qualifications & Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Years of Experience *</Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                      placeholder="5"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Desired Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                      placeholder="25.00"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Select Your Qualifications</Label>
                  <div className="flex flex-wrap gap-2">
                    {QUALIFICATIONS.map((qual) => (
                      <Badge
                        key={qual}
                        variant={formData.qualifications.includes(qual) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          formData.qualifications.includes(qual)
                            ? 'bg-teal-500 hover:bg-teal-600'
                            : 'hover:bg-teal-50 hover:border-teal-300'
                        }`}
                        onClick={() => toggleQualification(qual)}
                      >
                        {qual}
                        {formData.qualifications.includes(qual) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>License Number</Label>
                    <Input
                      value={formData.license_number}
                      onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                      placeholder="RN123456"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>License State</Label>
                    <Input
                      value={formData.license_state}
                      onChange={(e) => setFormData({...formData, license_state: e.target.value})}
                      placeholder="CA"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>License Expiry</Label>
                    <Input
                      type="date"
                      value={formData.license_expiry}
                      onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Your Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload your professional license, certifications, and other credentials. These will be verified by our compliance team.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <label htmlFor="license-upload" className="cursor-pointer block text-center">
                      <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 mb-1">Professional License</p>
                      <p className="text-xs text-gray-600 mb-3">RN, LPN, CNA, etc.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingDoc}
                        onClick={() => document.getElementById('license-upload').click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingDoc ? "Uploading..." : "Upload"}
                      </Button>
                    </label>
                    <input
                      id="license-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleDocumentUpload(e, 'license_verification', 'Professional License')}
                      disabled={uploadingDoc}
                    />
                  </div>

                  <div className="border-2 border-dashed border-teal-300 rounded-lg p-4 hover:border-teal-400 transition-colors">
                    <label htmlFor="cert-upload" className="cursor-pointer block text-center">
                      <Award className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 mb-1">Certifications</p>
                      <p className="text-xs text-gray-600 mb-3">CPR, BLS, ACLS, etc.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingDoc}
                        onClick={() => document.getElementById('cert-upload').click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingDoc ? "Uploading..." : "Upload"}
                      </Button>
                    </label>
                    <input
                      id="cert-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleDocumentUpload(e, 'certification', 'Certification')}
                      disabled={uploadingDoc}
                    />
                  </div>
                </div>

                {uploadedDocs.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Uploaded Documents
                    </p>
                    <ul className="space-y-1">
                      {uploadedDocs.map((doc, idx) => (
                        <li key={idx} className="text-sm text-green-700">✓ {doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Background Check & Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-4">
                    <strong>Required:</strong> We need your address to initiate the automated background check through Checkr.
                  </p>
                </div>

                <div>
                  <Label>Street Address *</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Main St"
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Boston"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="MA"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>ZIP Code *</Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                      placeholder="02101"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="text-sm text-green-800 mt-2 space-y-1">
                    <li>✓ Background check initiated automatically with Checkr</li>
                    <li>✓ Results typically available within 24-48 hours</li>
                    <li>✓ You'll be notified when verification is complete</li>
                    <li>✓ Once verified, you can start applying for shifts!</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="pt-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  You're All Set! 🎉
                </h2>
                <p className="text-gray-700 mb-6 max-w-md mx-auto">
                  Your profile is complete and your background check has been initiated. 
                  You can start browsing available shifts while we verify your credentials.
                </p>
                <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                  <div className="bg-white p-4 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-sm">Profile Created</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-sm">{uploadedDocs.length} Docs Uploaded</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="font-semibold text-sm">Verification Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || saveProfileMutation.isPending || initiateBackgroundCheckMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-teal-600"
          >
            {saveProfileMutation.isPending || initiateBackgroundCheckMutation.isPending ? (
              "Processing..."
            ) : currentStep === steps.length - 1 ? (
              "Complete & Go to Dashboard"
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}