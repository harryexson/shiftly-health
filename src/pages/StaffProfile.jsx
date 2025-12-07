import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, CheckCircle, XCircle, Clock, FileText, Shield, Award, Book, Upload, Sun, Moon, Sunrise, Calendar } from "lucide-react";
import HelpTooltip from "../components/onboarding/HelpTooltip";
import BackgroundCheckStatus from "../components/verification/BackgroundCheckStatus";

const QUALIFICATIONS = [
  "CPR", "First Aid", "Mental Health Training", "ISP Training",
  "Behavior Support", "Therap", "Drivers License", "Feeding Assistance",
  "Bathing", "Grooming", "Medical Transport"
];

export default function StaffProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    staff_type: "licensed",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    license_number: "",
    license_state: "",
    license_expiry: "",
    specialties: [],
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

  const [uploadingDoc, setUploadingDoc] = useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const profiles = await base44.entities.StaffProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setFormData({
          ...profiles[0],
          shift_preferences: profiles[0].shift_preferences || {
            preferred_shift_times: [],
            willing_to_work_weekends: true,
            willing_to_work_holidays: true,
            max_commute_miles: 25,
            prefers_urgent_shifts: false
          }
        });
      } else {
        setFormData(prev => ({ ...prev, full_name: currentUser.full_name || "" }));
      }
    };
    loadUser();
  }, []);

  const { data: existingProfile } = useQuery({
    queryKey: ['staff-profile', user?.email],
    queryFn: () => base44.entities.StaffProfile.filter({ user_email: user?.email }),
    enabled: !!user,
    select: (data) => data[0],
  });

  const { data: complianceRecords = [] } = useQuery({
    queryKey: ['compliance-records', user?.email],
    queryFn: () => base44.entities.ComplianceRecord.filter({ user_email: user?.email }),
    enabled: !!user,
  });

  const { data: documentRequests = [] } = useQuery({
    queryKey: ['document-requests', user?.email],
    queryFn: () => base44.entities.DocumentRequest.filter({ staff_email: user?.email }),
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (profileData) => {
      if (existingProfile) {
        return await base44.entities.StaffProfile.update(existingProfile.id, profileData);
      } else {
        return await base44.entities.StaffProfile.create(profileData);
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profile'] });
      
      const onboardingProgress = await base44.entities.OnboardingProgress.filter({
        user_email: user.email
      });
      
      if (onboardingProgress.length > 0) {
        await base44.entities.OnboardingProgress.update(onboardingProgress[0].id, {
          checklist_items: {
            ...onboardingProgress[0].checklist_items,
            profile_created: true,
            qualifications_added: formData.qualifications && formData.qualifications.length > 0,
            availability_set: !!(formData.shift_preferences?.max_commute_miles)
          }
        });
      }
      
      setSubmitted(true);
      setTimeout(() => {
        navigate(createPageUrl("StaffDashboard"));
      }, 2000);
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, docType, docName, licenseNumber, expiryDate }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.ComplianceRecord.create({
        user_email: user.email,
        record_type: docType,
        document_name: docName,
        document_url: file_url,
        verification_status: 'pending',
        issued_date: new Date().toISOString(),
        expiry_date: expiryDate || null,
        third_party_verification_id: licenseNumber || null
      });

      await base44.integrations.Core.SendEmail({
        to: 'admin@healthstaffconnect.com',
        subject: 'New Credential Submitted for Verification',
        body: `
          <h2>New Credential Upload</h2>
          <p>A staff member has uploaded a new credential for verification:</p>
          <ul>
            <li><strong>Staff:</strong> ${user.full_name || user.email}</li>
            <li><strong>Document:</strong> ${docName}</li>
            <li><strong>Type:</strong> ${docType}</li>
          </ul>
          <p>Please review in the Credential Verification Center.</p>
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-records'] });
      alert('Document uploaded successfully! It will be reviewed by our team.');
    },
  });

  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    const docName = prompt('Enter document name (e.g., "RN License", "CPR Certification"):');
    if (!docName) return;

    let licenseNumber = null;
    let expiryDate = null;

    if (docType === 'license_verification') {
      licenseNumber = prompt('Enter license number:');
      expiryDate = prompt('Enter expiry date (YYYY-MM-DD):');
    } else if (docType === 'certification') {
      expiryDate = prompt('Enter expiry date (YYYY-MM-DD, or leave blank):');
    }

    setUploadingDoc(true);
    try {
      await uploadDocumentMutation.mutateAsync({ 
        file, 
        docType, 
        docName, 
        licenseNumber,
        expiryDate 
      });
    } finally {
      setUploadingDoc(false);
      e.target.value = null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      user_email: user.email,
    });
  };

  const toggleQualification = (qual) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(qual)
        ? prev.qualifications.filter(q => q !== qual)
        : [...prev.qualifications, qual]
    }));
  };

  const toggleShiftTime = (time) => {
    setFormData(prev => ({
      ...prev,
      shift_preferences: {
        ...prev.shift_preferences,
        preferred_shift_times: prev.shift_preferences.preferred_shift_times.includes(time)
          ? prev.shift_preferences.preferred_shift_times.filter(t => t !== time)
          : [...prev.shift_preferences.preferred_shift_times, time]
      }
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-200">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Saved!</h2>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                {existingProfile ? 'Edit Your Profile' : 'Create Your Staff Profile'}
              </h1>
              <p className="text-gray-600">Complete your profile to start finding shifts</p>
            </div>
            <HelpTooltip
              title="Profile Completion Tips"
              content="A complete profile gets 5x more shift offers! Add your photo, qualifications, and preferences to stand out to facilities."
            />
          </div>
        </div>

        {existingProfile && (
          <Card className={`border-2 ${
            existingProfile.verification_status === 'verified' 
              ? 'border-green-200 bg-green-50' 
              : existingProfile.verification_status === 'rejected'
                ? 'border-red-200 bg-red-50'
                : 'border-amber-200 bg-amber-50'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {existingProfile.verification_status === 'verified' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : existingProfile.verification_status === 'rejected' ? (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                ) : (
                  <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${
                    existingProfile.verification_status === 'verified' 
                      ? 'text-green-900' 
                      : existingProfile.verification_status === 'rejected'
                        ? 'text-red-900'
                        : 'text-amber-900'
                  }`}>
                    {existingProfile.verification_status === 'verified' 
                      ? '✅ Profile Verified' 
                      : existingProfile.verification_status === 'rejected'
                        ? '⚠️ Verification Issues'
                        : '⏳ Verification Pending'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    existingProfile.verification_status === 'verified' 
                      ? 'text-green-700' 
                      : existingProfile.verification_status === 'rejected'
                        ? 'text-red-700'
                        : 'text-amber-700'
                  }`}>
                    {existingProfile.verification_status === 'verified' 
                      ? 'Your profile and credentials have been verified. You can now apply for shifts!' 
                      : existingProfile.verification_status === 'rejected'
                        ? 'Some of your credentials require attention. Please check your notifications and re-upload documents.'
                        : 'Your profile is under review. You\'ll be notified once verification is complete (typically 24-48 hours).'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="border-blue-100/50">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="staff_type">Staff Type *</Label>
                <Select
                  value={formData.staff_type}
                  onValueChange={(value) => setFormData({...formData, staff_type: value})}
                >
                  <SelectTrigger className="mt-2">
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
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell employers about your experience and skills..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="years_experience">Years of Experience *</Label>
                    <HelpTooltip
                      title="Experience Matters"
                      content="Your years of experience help employers find the right match and may unlock higher-paying opportunities."
                    />
                  </div>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                    placeholder="e.g., 5"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Desired Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferred Shift Times - NEW ENHANCED SECTION */}
          <Card className="border-purple-100/50 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <CardTitle>Preferred Shift Times</CardTitle>
                <HelpTooltip
                  title="Why This Matters"
                  content="Setting your preferred shift times helps us match you with shifts that fit your schedule. You'll get priority for shifts during your preferred times!"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Shift Time Preferences */}
              <div>
                <Label className="text-base font-semibold mb-3 block">When do you prefer to work? *</Label>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleShiftTime('day')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.shift_preferences.preferred_shift_times.includes('day')
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-200'
                    }`}
                  >
                    <Sun className={`w-8 h-8 mx-auto mb-2 ${
                      formData.shift_preferences.preferred_shift_times.includes('day')
                        ? 'text-yellow-600'
                        : 'text-gray-400'
                    }`} />
                    <div className="font-semibold">Day Shift</div>
                    <div className="text-xs text-gray-600">7am - 3pm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleShiftTime('evening')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.shift_preferences.preferred_shift_times.includes('evening')
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <Sunrise className={`w-8 h-8 mx-auto mb-2 ${
                      formData.shift_preferences.preferred_shift_times.includes('evening')
                        ? 'text-orange-600'
                        : 'text-gray-400'
                    }`} />
                    <div className="font-semibold">Evening Shift</div>
                    <div className="text-xs text-gray-600">3pm - 11pm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleShiftTime('night')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.shift_preferences.preferred_shift_times.includes('night')
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <Moon className={`w-8 h-8 mx-auto mb-2 ${
                      formData.shift_preferences.preferred_shift_times.includes('night')
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`} />
                    <div className="font-semibold">Night Shift</div>
                    <div className="text-xs text-gray-600">11pm - 7am</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleShiftTime('flexible')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.shift_preferences.preferred_shift_times.includes('flexible')
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <Clock className={`w-8 h-8 mx-auto mb-2 ${
                      formData.shift_preferences.preferred_shift_times.includes('flexible')
                        ? 'text-purple-600'
                        : 'text-gray-400'
                    }`} />
                    <div className="font-semibold">Flexible</div>
                    <div className="text-xs text-gray-600">Any time</div>
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 Select multiple options to increase your shift opportunities
                </p>
              </div>

              {/* Additional Preferences */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <Label className="font-semibold">Work Weekends</Label>
                    <p className="text-xs text-gray-600">Available Saturdays & Sundays</p>
                  </div>
                  <Switch
                    checked={formData.shift_preferences.willing_to_work_weekends}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      shift_preferences: { ...formData.shift_preferences, willing_to_work_weekends: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <Label className="font-semibold">Work Holidays</Label>
                    <p className="text-xs text-gray-600">Available on major holidays</p>
                  </div>
                  <Switch
                    checked={formData.shift_preferences.willing_to_work_holidays}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      shift_preferences: { ...formData.shift_preferences, willing_to_work_holidays: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <Label className="font-semibold">Urgent Shifts</Label>
                    <p className="text-xs text-gray-600">Prefer last-minute opportunities</p>
                  </div>
                  <Switch
                    checked={formData.shift_preferences.prefers_urgent_shifts}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      shift_preferences: { ...formData.shift_preferences, prefers_urgent_shifts: checked }
                    })}
                  />
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <Label htmlFor="max_commute" className="font-semibold">Max Commute (miles)</Label>
                  <Input
                    id="max_commute"
                    type="number"
                    min="5"
                    max="100"
                    value={formData.shift_preferences.max_commute_miles}
                    onChange={(e) => setFormData({
                      ...formData,
                      shift_preferences: { ...formData.shift_preferences, max_commute_miles: parseInt(e.target.value) }
                    })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Pro Tip:</strong> Staff with flexible shift preferences get 3x more shift offers! 
                  Being available for evenings and weekends significantly increases your earning potential.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-blue-100/50">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Check Status */}
          <BackgroundCheckStatus
            staffProfile={existingProfile}
            complianceRecords={complianceRecords}
            onUpdate={() => queryClient.invalidateQueries(['compliance-records'])}
          />

          {/* Credentials & Documents */}
          <Card className="border-teal-100/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Credentials & Documents</CardTitle>
                <HelpTooltip
                  title="Required for Verification"
                  content="Upload your professional license, certifications, and other credentials. All documents will be verified by our compliance team."
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pending Document Requests from Facilities */}
              {documentRequests.filter(r => r.status === 'pending').length > 0 && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <Label className="text-blue-900">Requested by Facilities:</Label>
                  </div>
                  {documentRequests.filter(r => r.status === 'pending').map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">{request.document_name}</p>
                          <p className="text-xs text-blue-700">
                            {request.reason || 'Requested for verification'}
                            {request.due_date && ` • Due: ${new Date(request.due_date).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-600 text-white">Action Required</Badge>
                    </div>
                  ))}
                  <p className="text-xs text-blue-700">
                    💡 Upload the requested documents below to complete verification
                  </p>
                </div>
              )}

              {complianceRecords.length > 0 && (
                <div className="space-y-3 mb-4">
                  <Label>Uploaded Documents:</Label>
                  {complianceRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{record.document_name}</p>
                          <p className="text-xs text-gray-600">
                            {record.record_type.replace(/_/g, ' ')}
                            {record.expiry_date && ` • Expires: ${new Date(record.expiry_date).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        record.verification_status === 'verified' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : record.verification_status === 'rejected'
                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                      }>
                        {record.verification_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
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
                      {uploadingDoc ? "Uploading..." : "Upload License"}
                    </Button>
                  </label>
                  <input
                    id="license-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleDocumentUpload(e, 'license_verification')}
                    disabled={uploadingDoc}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
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
                      {uploadingDoc ? "Uploading..." : "Upload Certificate"}
                    </Button>
                  </label>
                  <input
                    id="cert-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleDocumentUpload(e, 'certification')}
                    disabled={uploadingDoc}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <label htmlFor="training-upload" className="cursor-pointer block text-center">
                    <Book className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900 mb-1">Training Completion</p>
                    <p className="text-xs text-gray-600 mb-3">Specialized training</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingDoc}
                      onClick={() => document.getElementById('training-upload').click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingDoc ? "Uploading..." : "Upload Training"}
                    </Button>
                  </label>
                  <input
                    id="training-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleDocumentUpload(e, 'training')}
                    disabled={uploadingDoc}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <label htmlFor="bg-upload" className="cursor-pointer block text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900 mb-1">Background Check</p>
                    <p className="text-xs text-gray-600 mb-3">If available</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingDoc}
                      onClick={() => document.getElementById('bg-upload').click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingDoc ? "Uploading..." : "Upload Check"}
                    </Button>
                  </label>
                  <input
                    id="bg-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleDocumentUpload(e, 'background_check')}
                    disabled={uploadingDoc}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <strong>📋 Verification Process:</strong> Documents are reviewed within 24-48 hours. 
                  You'll receive a notification once verification is complete. Formats: PDF, JPG, PNG (max 10MB).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* License Details */}
          <Card className="border-teal-100/50">
            <CardHeader>
              <CardTitle>License & Certification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    placeholder="N/A if unlicensed"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="license_state">License State</Label>
                  <Input
                    id="license_state"
                    value={formData.license_state}
                    onChange={(e) => setFormData({...formData, license_state: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="license_expiry">License Expiry</Label>
                  <Input
                    id="license_expiry"
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Qualifications & Certifications</Label>
                <div className="flex flex-wrap gap-2 mt-2">
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Welcome"))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}