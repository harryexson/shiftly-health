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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, X, CheckCircle, Zap } from "lucide-react";
import HelpTooltip from "../components/onboarding/HelpTooltip";

const QUALIFICATIONS = [
  "CPR",
  "First Aid",
  "Mental Health Training",
  "ISP Training",
  "Behavior Support",
  "Therap",
  "Drivers License",
  "Feeding Assistance",
  "Bathing",
  "Grooming",
  "Medical Transport"
];

export default function PostShift() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    staff_type_required: "licensed",
    required_qualifications: [],
    minimum_experience_years: 0, // Added new field
    shift_date: "",
    start_time: "",
    end_time: "",
    hourly_rate: "",
    number_of_positions: 1,
    location: "",
    city: "",
    state: "",
    urgent: false,
    special_requirements: ""
  });
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: employerProfile } = useQuery({
    queryKey: ['employer-profile', user?.email],
    queryFn: () => base44.entities.EmployerProfile.filter({ user_email: user?.email }),
    enabled: !!user,
    select: (data) => data[0],
  });

  // Helper to calculate shift hours from start and end times
  const calculateShiftHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000/01/01 ${startTime}`);
    const end = new Date(`2000/01/01 ${endTime}`);
    // Handle overnight shifts (end time is on the next day)
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    const diffMs = end - start;
    return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const createShiftMutation = useMutation({
    mutationFn: async (shiftData) => {
      const shift = await base44.entities.Shift.create({
        ...shiftData,
        positions_filled: 0,
        status: 'open'
      });

      // Find matching staff members and notify them
      const allStaff = await base44.asServiceRole.entities.StaffProfile.filter({
        staff_type: shiftData.staff_type_required,
        profile_status: 'active'
      });

      // Filter staff based on preferences and location
      const matchingStaff = allStaff.filter(staff => {
        // Check if staff has shift preferences
        if (!staff.shift_preferences) return false;
        
        // Check commute distance
        if (staff.latitude && staff.longitude && shiftData.latitude && shiftData.longitude) {
          const distance = calculateDistance(
            staff.latitude,
            staff.longitude,
            shiftData.latitude,
            shiftData.longitude
          );
          const maxCommute = staff.shift_preferences.max_commute_miles || 25;
          if (distance > maxCommute) return false;
        }

        // Check if rate meets minimum
        if (staff.hourly_rate && shiftData.hourly_rate < staff.hourly_rate) {
          return false;
        }

        // Check urgent preference
        if (shiftData.urgent && !staff.shift_preferences.prefers_urgent_shifts) {
          return false;
        }

        // Check minimum experience
        if (shiftData.minimum_experience_years && (!staff.experience_years || staff.experience_years < shiftData.minimum_experience_years)) {
          return false;
        }

        return true;
      });

      // Send notifications to matching staff
      const notificationPromises = matchingStaff.slice(0, 50).map(async (staff) => {
        // Check notification preferences
        const prefs = await base44.asServiceRole.entities.NotificationPreferences.filter({
          user_email: staff.user_email
        });

        const shouldNotify = prefs.length === 0 || 
          (prefs[0].push_notifications?.enabled !== false && 
           prefs[0].push_notifications?.new_shift_matches !== false);

        if (shouldNotify) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: staff.user_email,
            type: shiftData.urgent ? 'urgent_shift' : 'shift_offer',
            title: shiftData.urgent ? `🚨 Urgent Shift Available!` : `New Shift Match: ${shiftData.title}`,
            message: `${shiftData.title} in ${shiftData.city}, ${shiftData.state} on ${new Date(shiftData.shift_date).toLocaleDateString()} - $${shiftData.hourly_rate}/hr`,
            priority: shiftData.urgent ? 'urgent' : 'high',
            action_url: createPageUrl("BrowseShifts"),
            related_id: shift.id,
            status: 'unread',
            expires_at: shiftData.urgent ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
          });

          // Send email if enabled
          const shouldEmail = prefs.length === 0 || 
            prefs[0].email_notifications?.new_shift_matches !== false;

          if (shouldEmail) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: staff.user_email,
              subject: shiftData.urgent ? `🚨 Urgent Shift Match!` : `New Shift Match: ${shiftData.title}`,
              body: `
                <h2>${shiftData.urgent ? '🚨 Urgent Shift Available!' : 'New Shift Match'}</h2>
                <p>A new shift matching your preferences has been posted:</p>
                <ul>
                  <li><strong>Position:</strong> ${shiftData.title}</li>
                  <li><strong>Date:</strong> ${new Date(shiftData.shift_date).toLocaleDateString()}</li>
                  <li><strong>Time:</strong> ${shiftData.start_time} - ${shiftData.end_time}</li>
                  <li><strong>Rate:</strong> $${shiftData.hourly_rate}/hour</li>
                  <li><strong>Location:</strong> ${shiftData.city}, ${shiftData.state}</li>
                </ul>
                ${shiftData.urgent ? '<p><strong>This is an urgent shift - apply now!</strong></p>' : ''}
                <p>Log in to view details and apply.</p>
              `
            });
          }
        }
      });

      await Promise.all(notificationPromises);

      return shift;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['employer-shifts'] });
      
      // Update onboarding progress
      const onboardingProgress = await base44.entities.OnboardingProgress.filter({
        user_email: user.email
      });
      
      if (onboardingProgress.length > 0) {
        const currentChecklist = onboardingProgress[0].checklist_items || {};
        if (!currentChecklist.first_shift_posted) {
          await base44.entities.OnboardingProgress.update(onboardingProgress[0].id, {
            checklist_items: {
              ...currentChecklist,
              first_shift_posted: true
            }
          });
          queryClient.invalidateQueries({ queryKey: ['onboarding-progress', user.email] });
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate(createPageUrl("ManageShifts"));
      }, 2000);
    },
    onError: (error) => {
      console.error("Error creating shift:", error);
      // Optionally, display an error message to the user
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !employerProfile) {
      console.error("User or employer profile not loaded yet.");
      // Optionally, provide user feedback that data is loading
      return;
    }

    // Calculate service fee (10% of hourly rate × hours)
    const shiftHours = calculateShiftHours(formData.start_time, formData.end_time);
    if (isNaN(shiftHours) || shiftHours <= 0) {
      alert("Please ensure valid start and end times are provided.");
      return;
    }
    const serviceFee = (parseFloat(formData.hourly_rate) * shiftHours * 0.10).toFixed(2);
    
    try {
      await createShiftMutation.mutateAsync({
        ...formData,
        employer_email: user.email,
        service_fee_amount: parseFloat(serviceFee),
        city: employerProfile.city,
        state: employerProfile.state,
        latitude: employerProfile.latitude,
        longitude: employerProfile.longitude,
      });

    } catch (error) {
      console.error("Failed to post shift:", error);
      // The onError of useMutation will also handle the error display
    }
  };

  const toggleQualification = (qual) => {
    setFormData(prev => ({
      ...prev,
      required_qualifications: prev.required_qualifications.includes(qual)
        ? prev.required_qualifications.filter(q => q !== qual)
        : [...prev.required_qualifications, qual]
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shift Posted Successfully!</h2>
            <p className="text-gray-600">
              Your shift is now live and visible to qualified healthcare professionals.
            </p>
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
                Post a New Shift
              </h1>
              <p className="text-gray-600">Fill urgent shifts in minutes with qualified staff</p>
              <div className="mt-4 grid md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Avg. fill time: <span className="font-semibold">23 minutes</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Save up to <span className="font-semibold">40%</span> on costs</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700"><span className="font-semibold">95%</span> match success rate</span>
                </div>
              </div>
            </div>
            <HelpTooltip
              title="How Shift Posting Works"
              content="Post your shift details and our AI matching algorithm will instantly notify qualified professionals within your area. Most facilities get applications within 15 minutes!"
            />
          </div>
        </div>

        {/* Quick Tips Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">💡 Quick Tips for Faster Fills:</p>
                <ul className="text-xs text-blue-800 mt-2 space-y-1">
                  <li>• Mark urgent shifts to get priority visibility</li>
                  <li>• Competitive rates attract more qualified applicants</li>
                  <li>• Clear descriptions help professionals understand your needs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-blue-100/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Basic Information</CardTitle>
                <HelpTooltip
                  title="Shift Basics"
                  content="Provide clear, specific details about the shift. The more complete your posting, the better quality applications you'll receive."
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Shift Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Night Shift Nurse - ICU"
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the shift responsibilities and expectations..."
                  rows={4}
                  required
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4"> {/* Changed to md:grid-cols-3 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="staff_type_required">Staff Type Required *</Label>
                    <HelpTooltip
                      title="Staff Types"
                      content="Licensed: RN, LPN, NP (requires nursing license). DSP: Direct Support Professional for developmental disabilities. Caregiver: Home health aides, CNAs for basic care."
                    />
                  </div>
                  <Select
                    value={formData.staff_type_required}
                    onValueChange={(value) => setFormData({...formData, staff_type_required: value})}
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

                {/* New Minimum Experience Input */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="minimum_experience_years">Minimum Experience (Years)</Label>
                    <HelpTooltip
                      title="Experience Requirements"
                      content="Set minimum years of experience required. This helps filter applicants and ensures qualified staff. Leave at 0 for no requirement."
                    />
                  </div>
                  <Input
                    id="minimum_experience_years"
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={formData.minimum_experience_years}
                    onChange={(e) => setFormData({...formData, minimum_experience_years: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set to 0 for no experience requirement
                  </p>
                </div>

                <div>
                  <Label htmlFor="positions">Number of Positions *</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    value={formData.number_of_positions}
                    onChange={(e) => setFormData({...formData, number_of_positions: parseInt(e.target.value)})}
                    required
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Schedule & Compensation</CardTitle>
                <HelpTooltip
                  title="Competitive Rates"
                  content="Market rates: RNs $35-55/hr, LPNs $25-35/hr, CNAs $18-25/hr, DSPs $16-22/hr. Urgent shifts and weekends command 15-20% premiums."
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="shift_date">Shift Date *</Label>
                  <Input
                    id="shift_date"
                    type="date"
                    value={formData.shift_date}
                    onChange={(e) => setFormData({...formData, shift_date: e.target.value})}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                  placeholder="25.00"
                  required
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="urgent" className="font-semibold text-red-900">Mark as Urgent</Label>
                    <HelpTooltip
                      title="Urgent Shifts"
                      content="Mark as urgent for last-minute needs (within 24-48 hours). This prioritizes your posting and notifies professionals who accept urgent shifts immediately."
                    />
                  </div>
                  <p className="text-sm text-red-700">Highlight this shift for immediate attention</p>
                </div>
                <Switch
                  id="urgent"
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData({...formData, urgent: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100/50">
            <CardHeader>
              <CardTitle>Required Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Select the certifications and skills required for this shift
              </p>
              <div className="flex flex-wrap gap-2">
                {QUALIFICATIONS.map((qual) => (
                  <Badge
                    key={qual}
                    variant={formData.required_qualifications.includes(qual) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      formData.required_qualifications.includes(qual)
                        ? 'bg-teal-500 hover:bg-teal-600'
                        : 'hover:bg-teal-50 hover:border-teal-300'
                    }`}
                    onClick={() => toggleQualification(qual)}
                  >
                    {qual}
                    {formData.required_qualifications.includes(qual) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="special_requirements">Special Requirements</Label>
                <Textarea
                  id="special_requirements"
                  value={formData.special_requirements}
                  onChange={(e) => setFormData({...formData, special_requirements: e.target.value})}
                  placeholder="Any additional requirements or notes..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("EmployerDashboard"))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createShiftMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              {createShiftMutation.isPending ? 'Posting...' : 'Post Shift'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}