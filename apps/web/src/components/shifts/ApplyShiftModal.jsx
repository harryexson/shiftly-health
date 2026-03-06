
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

export default function ApplyShiftModal({ shift, staffProfile, onClose }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  // Helper function for creating URLs (assumed based on usage in outline)
  const createPageUrl = (pageName) => {
    switch (pageName) {
      case "ManageShifts":
        return "/manage-shifts";
      // Add other cases as needed
      default:
        return "/";
    }
  };

  const calculateMatchScore = () => {
    let score = 0;
    if (staffProfile.staff_type === shift.staff_type_required) score += 40;
    if (shift.required_qualifications && staffProfile.qualifications) {
      const matched = shift.required_qualifications.filter(req => 
        staffProfile.qualifications.includes(req)
      );
      score += (matched.length / shift.required_qualifications.length) * 40;
    } else {
      score += 40;
    }
    if (staffProfile.hourly_rate && shift.hourly_rate >= staffProfile.hourly_rate) {
      score += 20;
    }
    return Math.round(score);
  };

  const applyMutation = useMutation({
    mutationFn: async (applicationData) => {
      const application = await base44.entities.ShiftApplication.create(applicationData);
      
      // Create notification for employer
      await base44.entities.Notification.create({
        user_email: shift.employer_email,
        type: 'new_application',
        title: `New Application for ${shift.title}`,
        message: `${staffProfile.full_name} has applied for your shift on ${new Date(shift.shift_date).toLocaleDateString()}. Match score: ${calculateMatchScore()}%`,
        priority: shift.urgent ? 'urgent' : 'high',
        action_url: createPageUrl("ManageShifts"),
        related_id: shift.id,
        status: 'unread'
      });

      // Send email if enabled
      const employerPrefs = await base44.entities.NotificationPreferences.filter({
        user_email: shift.employer_email
      });
      
      if (employerPrefs.length === 0 || employerPrefs[0].email_notifications?.new_applications !== false) {
        await base44.integrations.Core.SendEmail({
          to: shift.employer_email,
          subject: `New Application: ${shift.title}`,
          body: `
            <h2>New Shift Application</h2>
            <p><strong>${staffProfile.full_name}</strong> has applied for your shift:</p>
            <ul>
              <li><strong>Shift:</strong> ${shift.title}</li>
              <li><strong>Date:</strong> ${new Date(shift.shift_date).toLocaleDateString()}</li>
              <li><strong>Match Score:</strong> ${calculateMatchScore()}%</li>
            </ul>
            <p>Log in to review their profile and credentials.</p>
          `
        });
      }

      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-applications'] });
      setSubmitted(true);
      
      // Update onboarding progress
      const updateOnboarding = async () => {
        const onboardingProgress = await base44.entities.OnboardingProgress.filter({
          user_email: staffProfile.user_email
        });
        
        if (onboardingProgress.length > 0 && !onboardingProgress[0].checklist_items?.first_application_submitted) {
          await base44.entities.OnboardingProgress.update(onboardingProgress[0].id, {
            checklist_items: {
              ...onboardingProgress[0].checklist_items,
              first_application_submitted: true
            }
          });
        }
      };
      updateOnboarding();
      
      setTimeout(() => {
        onClose();
      }, 2000);
    },
  });

  const handleSubmit = async () => {
    const matchScore = calculateMatchScore();
    // Assuming 'distance' would be calculated here or passed as a prop.
    // For this implementation, we'll use a placeholder value since its calculation isn't provided in the outline.
    const distance = 0; // Placeholder for distance in miles

    applyMutation.mutate({
      shift_id: shift.id,
      staff_email: staffProfile.user_email,
      employer_email: shift.employer_email,
      cover_letter: coverLetter,
      match_score: matchScore,
      distance_miles: distance,
      applied_date: new Date().toISOString(),
      status: 'pending'
    });
  };

  if (submitted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-gray-600">
              Your application has been sent to the employer. You'll be notified when they respond.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Apply for Shift
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-1">{shift.title}</h4>
            <p className="text-sm text-gray-600">
              {shift.city}, {shift.state} • ${shift.hourly_rate}/hr
            </p>
          </div>

          <div>
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell the employer why you're a great fit for this shift..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="mt-2"
            />
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Match Score:</span> {calculateMatchScore()}%
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Based on your qualifications and shift requirements
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={applyMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={applyMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            {applyMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
