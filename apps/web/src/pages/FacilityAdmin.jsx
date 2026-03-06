import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mail,
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ROLES = [
  {
    name: "facility_admin",
    label: "Facility Administrator",
    description: "Full access to all facility functions",
    permissions: {
      view_staff_details: true,
      manage_shifts: true,
      approve_applications: true,
      manage_billing: true,
      invite_users: true,
      view_payroll: true,
      manage_credentials: true
    }
  },
  {
    name: "human_resources",
    label: "Human Resources",
    description: "Manage staff credentials and compliance",
    permissions: {
      view_staff_details: true,
      manage_shifts: false,
      approve_applications: true,
      manage_billing: false,
      invite_users: false,
      view_payroll: true,
      manage_credentials: true
    }
  },
  {
    name: "charge_nurse",
    label: "Charge Nurse",
    description: "Manage shift scheduling only",
    permissions: {
      view_staff_details: false,
      manage_shifts: true,
      approve_applications: true,
      manage_billing: false,
      invite_users: false,
      view_payroll: false,
      manage_credentials: false
    }
  },
  {
    name: "scheduler",
    label: "Scheduler",
    description: "View and manage shift assignments",
    permissions: {
      view_staff_details: false,
      manage_shifts: true,
      approve_applications: false,
      manage_billing: false,
      invite_users: false,
      view_payroll: false,
      manage_credentials: false
    }
  },
  {
    name: "billing_manager",
    label: "Billing Manager",
    description: "Manage payments and invoices",
    permissions: {
      view_staff_details: false,
      manage_shifts: false,
      approve_applications: false,
      manage_billing: true,
      invite_users: false,
      view_payroll: true,
      manage_credentials: false
    }
  },
  {
    name: "department_manager",
    label: "Department Manager",
    description: "Manage specific department operations",
    permissions: {
      view_staff_details: false,
      manage_shifts: true,
      approve_applications: true,
      manage_billing: false,
      invite_users: false,
      view_payroll: false,
      manage_credentials: false
    }
  }
];

export default function FacilityAdmin() {
  const [user, setUser] = useState(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "",
    departments: []
  });
  const queryClient = useQueryClient();

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

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', user?.email],
    queryFn: () => base44.asServiceRole.entities.EmployerUserRole.filter({ 
      employer_email: user?.email 
    }),
    enabled: !!user && !!employerProfile,
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (data) => {
      const role = ROLES.find(r => r.name === data.role);
      
      await base44.entities.EmployerUserRole.create({
        employer_email: user.email,
        user_email: data.email,
        role_name: data.role,
        permissions: role.permissions,
        department_access: data.departments,
        invitation_status: "pending",
        invited_by: user.email,
        invited_date: new Date().toISOString()
      });

      // Send notification to invited user
      await base44.entities.Notification.create({
        user_email: data.email,
        type: "system_alert",
        title: "You've Been Invited to Join a Facility Team",
        message: `${employerProfile.facility_name} has invited you to join their team as ${role.label}. Please log in to accept this invitation.`,
        priority: "high",
        status: "unread"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setShowInviteDialog(false);
      setInviteData({ email: "", role: "", departments: [] });
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: async (roleId) => {
      await base44.asServiceRole.entities.EmployerUserRole.delete(roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });

  const handleInvite = () => {
    if (!inviteData.email || !inviteData.role) {
      alert('Please fill in all required fields');
      return;
    }
    inviteUserMutation.mutate(inviteData);
  };

  if (!employerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Team Management</CardTitle>
                <p className="text-gray-600 mt-1">Invite and manage your facility's team members</p>
              </div>
              <Button 
                onClick={() => setShowInviteDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Invite Team Member
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No team members yet</p>
                <p className="text-sm text-gray-400 mt-2">Invite your first team member to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.map((member) => {
                  const role = ROLES.find(r => r.name === member.role_name);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">{member.user_email}</span>
                          <Badge className={
                            member.invitation_status === 'accepted' ? 'bg-green-100 text-green-700' :
                            member.invitation_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {member.invitation_status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {member.invitation_status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {member.invitation_status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="w-4 h-4" />
                          <span>{role?.label}</span>
                        </div>
                        {member.department_access && member.department_access.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.department_access.map((dept, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {dept}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove this team member?')) {
                            removeUserMutation.mutate(member.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your facility's team
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value) => setInviteData({...inviteData, role: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        <div>
                          <p className="font-medium">{role.label}</p>
                          <p className="text-xs text-gray-500">{role.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {inviteData.role && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <p className="text-sm font-semibold text-blue-900 mb-3">Role Permissions:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(ROLES.find(r => r.name === inviteData.role)?.permissions || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={value ? 'text-blue-900' : 'text-gray-500'}>
                            {key.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={inviteUserMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}