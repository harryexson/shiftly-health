import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OnboardingChecklist({ progress, userType }) {
  const navigate = useNavigate();

  const staffChecklist = [
    {
      id: "profile_created",
      label: "Complete your profile",
      description: "Add your basic information",
      action: () => navigate(createPageUrl("StaffProfile")),
      actionLabel: "Complete Profile"
    },
    {
      id: "qualifications_added",
      label: "Add qualifications",
      description: "Upload licenses and certifications",
      action: () => navigate(createPageUrl("StaffProfile")),
      actionLabel: "Add Credentials"
    },
    {
      id: "availability_set",
      label: "Set your preferences",
      description: "When and where you want to work",
      action: () => navigate(createPageUrl("StaffProfile")),
      actionLabel: "Set Preferences"
    },
    {
      id: "first_application_submitted",
      label: "Apply to your first shift",
      description: "Browse available opportunities",
      action: () => navigate(createPageUrl("BrowseShifts")),
      actionLabel: "Find Shifts"
    },
  ];

  const employerChecklist = [
    {
      id: "profile_created",
      label: "Complete facility profile",
      description: "Add your facility information",
      action: () => navigate(createPageUrl("EmployerProfile")),
      actionLabel: "Complete Profile"
    },
    {
      id: "first_shift_posted",
      label: "Post your first shift",
      description: "Create a shift posting",
      action: () => navigate(createPageUrl("PostShift")),
      actionLabel: "Post Shift"
    },
    {
      id: "first_shift_accepted",
      label: "Review and accept applications",
      description: "Find the right staff",
      action: () => navigate(createPageUrl("ManageShifts")),
      actionLabel: "View Applications"
    },
    {
      id: "payment_method_added",
      label: "Add payment method",
      description: "Set up billing for seamless payments",
      action: () => navigate(createPageUrl("Billing")),
      actionLabel: "Add Payment"
    },
  ];

  const checklist = userType === 'staff' ? staffChecklist : employerChecklist;
  const completedItems = checklist.filter(item => progress.checklist_items?.[item.id]).length;
  const completionPercentage = (completedItems / checklist.length) * 100;

  if (progress.onboarding_status === 'completed' && completionPercentage === 100) {
    return null; // Don't show if fully completed
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {completionPercentage === 100 ? "You're All Set! 🎉" : "Complete Your Setup"}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {completedItems} of {checklist.length} steps completed
              </p>
            </div>
          </div>
          <Badge 
            className={completionPercentage === 100 
              ? "bg-green-500" 
              : completionPercentage >= 50 
                ? "bg-blue-500" 
                : "bg-gray-400"
            }
          >
            {Math.round(completionPercentage)}%
          </Badge>
        </div>
        <Progress value={completionPercentage} className="mt-4 h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklist.map((item) => {
            const isCompleted = progress.checklist_items?.[item.id];
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-blue-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-semibold ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                </div>
                {!isCompleted && (
                  <Button
                    size="sm"
                    onClick={item.action}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    {item.actionLabel}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {completionPercentage === 100 && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
            <p className="text-green-900 font-semibold">
              🎊 Congratulations! You've completed all onboarding steps.
            </p>
            <p className="text-sm text-green-700 mt-1">
              You're ready to make the most of HealthStaff Connect!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}