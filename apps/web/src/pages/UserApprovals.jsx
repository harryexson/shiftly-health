import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Award,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function UserApprovals() {
  const [user, setUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['pending-staff-profiles'],
    queryFn: () => base44.asServiceRole.entities.StaffProfile.filter({ verification_status: 'pending' }),
    enabled: !!user && user.role === 'admin',
  });

  const { data: employerProfiles = [] } = useQuery({
    queryKey: ['pending-employer-profiles'],
    queryFn: () => base44.asServiceRole.entities.EmployerProfile.filter({ profile_status: 'pending_approval' }),
    enabled: !!user && user.role === 'admin',
  });

  const { data: complianceRecords = [] } = useQuery({
    queryKey: ['pending-compliance'],
    queryFn: () => base44.asServiceRole.entities.ComplianceRecord.filter({ verification_status: 'pending' }),
    enabled: !!user && user.role === 'admin',
  });

  const approveStaffMutation = useMutation({
    mutationFn: async ({ profileId, action, reason }) => {
      const profile = staffProfiles.find(p => p.id === profileId);
      
      await base44.asServiceRole.entities.StaffProfile.update(profileId, {
        verification_status: action === 'approve' ? 'verified' : 'rejected',
        profile_status: action === 'approve' ? 'active' : 'inactive'
      });

      // Create notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: profile.user_email,
        type: 'verification_update',
        title: action === 'approve' ? 'Profile Approved! 🎉' : 'Profile Verification Issue',
        message: action === 'approve' 
          ? 'Your profile has been verified and approved. You can now start applying for shifts!'
          : `Your profile verification requires attention: ${reason}. Please update your information and resubmit.`,
        priority: action === 'approve' ? 'high' : 'urgent',
        status: 'unread'
      });

      // Log audit
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: user.email,
        action: action === 'approve' ? 'approve_staff_profile' : 'reject_staff_profile',
        target_user_email: profile.user_email,
        target_entity: 'StaffProfile',
        target_entity_id: profileId,
        details: `Profile ${action === 'approve' ? 'approved' : 'rejected'}. Notes: ${reason}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-staff-profiles'] });
      setShowApprovalDialog(false);
      setSelectedProfile(null);
      setActionType(null);
      setNotes("");
    },
  });

  const approveEmployerMutation = useMutation({
    mutationFn: async ({ profileId, action, reason }) => {
      const profile = employerProfiles.find(p => p.id === profileId);
      
      await base44.asServiceRole.entities.EmployerProfile.update(profileId, {
        profile_status: action === 'approve' ? 'active' : 'inactive'
      });

      // Create notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: profile.user_email,
        type: 'verification_update',
        title: action === 'approve' ? 'Facility Approved! 🏥' : 'Facility Verification Issue',
        message: action === 'approve' 
          ? 'Your facility has been verified and approved. You can now start posting shifts!'
          : `Your facility verification requires attention: ${reason}. Please provide additional documentation.`,
        priority: action === 'approve' ? 'high' : 'urgent',
        status: 'unread'
      });

      // Log audit
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: user.email,
        action: action === 'approve' ? 'approve_employer_profile' : 'reject_employer_profile',
        target_user_email: profile.user_email,
        target_entity: 'EmployerProfile',
        target_entity_id: profileId,
        details: `Facility ${action === 'approve' ? 'approved' : 'rejected'}. Notes: ${reason}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-employer-profiles'] });
      setShowApprovalDialog(false);
      setSelectedProfile(null);
      setActionType(null);
      setNotes("");
    },
  });

  const handleAction = () => {
    if (!selectedProfile || !actionType || !notes) return;

    if (selectedProfile.type === 'staff') {
      approveStaffMutation.mutate({
        profileId: selectedProfile.id,
        action: actionType,
        reason: notes
      });
    } else if (selectedProfile.type === 'employer') {
      approveEmployerMutation.mutate({
        profileId: selectedProfile.id,
        action: actionType,
        reason: notes
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">This area is restricted to platform administrators only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-purple-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <UserCheck className="w-7 h-7 text-purple-600" />
              User Approvals & Verification
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Review and approve healthcare staff and facility profiles
            </p>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-blue-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{staffProfiles.length}</div>
                <p className="text-sm text-gray-600 mt-1">Staff Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">{employerProfiles.length}</div>
                <p className="text-sm text-gray-600 mt-1">Facilities Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{complianceRecords.length}</div>
                <p className="text-sm text-gray-600 mt-1">Documents Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Staff Profiles */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Pending Staff Approvals ({staffProfiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {staffProfiles.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No pending staff approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {staffProfiles.map((profile) => (
                  <div key={profile.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{profile.full_name}</h3>
                          <Badge className="bg-blue-600 text-white">
                            {profile.staff_type === 'licensed' ? 'Licensed Professional' : 
                             profile.staff_type === 'unlicensed_dsp' ? 'DSP/CNA' : 'Caregiver'}
                          </Badge>
                          <Badge variant="outline">
                            {profile.years_experience} years experience
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{profile.user_email}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {profile.qualifications?.map((qual) => (
                            <Badge key={qual} variant="outline" className="text-xs">
                              {qual}
                            </Badge>
                          ))}
                        </div>
                        {profile.bio && (
                          <p className="text-sm text-gray-700 mt-2">{profile.bio}</p>
                        )}
                        {profile.license_number && profile.license_number !== 'N/A' && (
                          <div className="mt-2 text-sm text-gray-700">
                            <Award className="w-4 h-4 inline mr-1" />
                            License: {profile.license_number} ({profile.license_state})
                            {profile.license_expiry && ` - Expires: ${format(new Date(profile.license_expiry), 'MM/dd/yyyy')}`}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedProfile({ ...profile, type: 'staff' });
                            setActionType('approve');
                            setShowApprovalDialog(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedProfile({ ...profile, type: 'staff' });
                            setActionType('reject');
                            setShowApprovalDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Employer Profiles */}
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle>Pending Facility Approvals ({employerProfiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {employerProfiles.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No pending facility approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {employerProfiles.map((profile) => (
                  <div key={profile.id} className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{profile.facility_name}</h3>
                          <Badge className="bg-teal-600 text-white">{profile.facility_type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{profile.user_email}</p>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p><strong>Contact:</strong> {profile.contact_name}</p>
                          <p><strong>Phone:</strong> {profile.phone}</p>
                          <p><strong>Address:</strong> {profile.address}, {profile.city}, {profile.state} {profile.zip_code}</p>
                          <p><strong>License:</strong> {profile.license_number}</p>
                        </div>
                        {profile.description && (
                          <p className="text-sm text-gray-700 mt-2">{profile.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedProfile({ ...profile, type: 'employer' });
                            setActionType('approve');
                            setShowApprovalDialog(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedProfile({ ...profile, type: 'employer' });
                            setActionType('reject');
                            setShowApprovalDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve Profile' : 'Reject Profile'}
              </DialogTitle>
              <DialogDescription>
                {selectedProfile && `${selectedProfile.type === 'staff' ? selectedProfile.full_name : selectedProfile.facility_name}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="notes">
                  {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={actionType === 'approve' ? 
                    'Add any notes about this approval...' : 
                    'Explain why this profile is being rejected...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>

              {actionType === 'approve' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">This will:</p>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Verify and activate the profile</li>
                        <li>• Send approval notification to user</li>
                        <li>• Allow user to {selectedProfile?.type === 'staff' ? 'apply for shifts' : 'post shifts'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {actionType === 'reject' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">This will:</p>
                      <ul className="text-sm text-red-700 mt-1 space-y-1">
                        <li>• Mark the profile as rejected</li>
                        <li>• Send detailed rejection notification</li>
                        <li>• User can update and resubmit</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowApprovalDialog(false);
                setSelectedProfile(null);
                setActionType(null);
                setNotes("");
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={
                  (actionType === 'reject' && !notes) ||
                  approveStaffMutation.isPending ||
                  approveEmployerMutation.isPending
                }
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {(approveStaffMutation.isPending || approveEmployerMutation.isPending) ? 
                  'Processing...' : 
                  `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}