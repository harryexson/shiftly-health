
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Added useMutation and useQueryClient
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

export default function ManageShifts() {
  const [user, setUser] = React.useState(null);
  const [selectedApplication, setSelectedApplication] = React.useState(null); // Added state for selected application
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false); // Added state for accept dialog
  const [showRejectDialog, setShowRejectDialog] = React.useState(false); // Added state for reject dialog

  const queryClient = useQueryClient(); // Initialize query client

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: shifts = [] } = useQuery({
    queryKey: ['my-shifts', user?.email],
    queryFn: () => base44.entities.Shift.filter({ employer_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  // Placeholder for createPageUrl function (in a real app, this would likely be imported from a routing utility)
  const createPageUrl = (pageName) => {
    // This is a simplified example. In a real application, you might use a router's `generatePath` or similar.
    switch (pageName) {
      case "MyApplications":
        return "/staff/applications";
      case "BrowseShifts":
        return "/staff/browse-shifts";
      default:
        return "/";
    }
  };

  const acceptApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, application }) => {
      // Update application status
      await base44.entities.ShiftApplication.update(applicationId, {
        status: 'accepted',
        response_date: new Date().toISOString(),
        response_notes: 'Application accepted'
      });

      // Update shift positions filled
      const shift = shifts.find(s => s.id === application.shift_id);
      if (shift) {
        await base44.entities.Shift.update(shift.id, {
          positions_filled: shift.positions_filled + 1,
          status: shift.positions_filled + 1 >= shift.number_of_positions ? 'filled' : 'open'
        });
      }

      // Create notification for staff
      await base44.entities.Notification.create({
        user_email: application.staff_email,
        type: 'application_update',
        title: 'Application Accepted! 🎉',
        message: `Congratulations! Your application for "${shift?.title}" on ${new Date(shift?.shift_date).toLocaleDateString()} has been accepted.`,
        priority: 'high',
        action_url: createPageUrl("MyApplications"),
        related_id: application.id,
        status: 'unread'
      });

      // Send email notification
      const staffPrefs = await base44.entities.NotificationPreferences.filter({
        user_email: application.staff_email
      });
      
      if (staffPrefs.length === 0 || staffPrefs[0].email_notifications?.application_updates !== false) {
        await base44.integrations.Core.SendEmail({
          to: application.staff_email,
          subject: `Application Accepted: ${shift?.title}`,
          body: `
            <h2>🎉 Congratulations!</h2>
            <p>Your application has been accepted!</p>
            <ul>
              <li><strong>Shift:</strong> ${shift?.title}</li>
              <li><strong>Date:</strong> ${new Date(shift?.shift_date).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${shift?.start_time} - ${shift?.end_time}</li>
              <li><strong>Rate:</strong> $${shift?.hourly_rate}/hour</li>
              <li><strong>Location:</strong> ${shift?.city}, ${shift?.state}</li>
            </ul>
            <p>Please arrive 10 minutes early and bring your credentials.</p>
          `
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-shifts'] }); // This key might need adjustment based on how shifts are fetched
      queryClient.invalidateQueries({ queryKey: ['my-shifts'] }); // Invalidate employer's shifts to reflect filled positions
      queryClient.invalidateQueries({ queryKey: ['shift-applications'] }); // Invalidate relevant applications
      setSelectedApplication(null);
      setShowAcceptDialog(false);
    },
  });

  const rejectApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, application, reason }) => {
      // Update application status
      await base44.entities.ShiftApplication.update(applicationId, {
        status: 'rejected',
        response_date: new Date().toISOString(),
        response_notes: reason || 'Application not selected at this time'
      });

      // Create notification for staff
      const shift = shifts.find(s => s.id === application.shift_id);
      await base44.entities.Notification.create({
        user_email: application.staff_email,
        type: 'application_update',
        title: 'Application Update',
        message: `Your application for "${shift?.title}" has not been selected at this time. Keep applying to other great opportunities!`,
        priority: 'medium',
        action_url: createPageUrl("BrowseShifts"),
        related_id: application.id,
        status: 'unread'
      });

      // Send email notification (optional)
      const staffPrefs = await base44.entities.NotificationPreferences.filter({
        user_email: application.staff_email
      });
      
      if (staffPrefs.length === 0 || staffPrefs[0].email_notifications?.application_updates !== false) {
        await base44.integrations.Core.SendEmail({
          to: application.staff_email,
          subject: `Application Update: ${shift?.title}`,
          body: `
            <h2>Application Update</h2>
            <p>Thank you for your interest in the shift "${shift?.title}".</p>
            <p>We've decided to move forward with another candidate for this particular shift.</p>
            <p>We encourage you to continue applying to other opportunities on our platform!</p>
          `
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-applications'] }); // Invalidate relevant applications
      setSelectedApplication(null);
      setShowRejectDialog(false);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Manage Shifts
          </h1>
          <p className="text-gray-600">View and manage all your posted shifts</p>
        </div>

        {shifts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No shifts posted yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {shifts.map((shift) => (
              <Card key={shift.id} className="border-blue-100/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{shift.title}</CardTitle>
                    <Badge>{shift.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{shift.description}</p>
                  {/* Additional shift details or actions related to managing applications could go here */}
                  <div className="mt-4 text-sm text-gray-500">
                    Positions: {shift.positions_filled}/{shift.number_of_positions}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
