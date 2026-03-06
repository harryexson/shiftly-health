import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle, 
  Trash2,
  AlertTriangle,
  Shield
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AccountManagement() {
  const [user, setUser] = React.useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users-management'],
    queryFn: () => base44.asServiceRole.entities.User.list(),
    enabled: !!user && user.role === 'admin',
  });

  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['all-staff-profiles'],
    queryFn: () => base44.asServiceRole.entities.StaffProfile.list(),
    enabled: !!user && user.role === 'admin',
  });

  const { data: employerProfiles = [] } = useQuery({
    queryKey: ['all-employer-profiles'],
    queryFn: () => base44.asServiceRole.entities.EmployerProfile.list(),
    enabled: !!user && user.role === 'admin',
  });

  const { data: accountStatuses = [] } = useQuery({
    queryKey: ['all-account-statuses'],
    queryFn: () => base44.asServiceRole.entities.AccountStatus.list(),
    enabled: !!user && user.role === 'admin',
  });

  const suspendAccountMutation = useMutation({
    mutationFn: async ({ userEmail, reason }) => {
      const existingStatus = accountStatuses.find(s => s.user_email === userEmail);
      
      const statusData = {
        user_email: userEmail,
        account_status: 'suspended',
        suspension_reason: reason,
        suspension_date: new Date().toISOString(),
        suspended_by: user.email,
        notes: actionReason
      };

      if (existingStatus) {
        await base44.asServiceRole.entities.AccountStatus.update(existingStatus.id, statusData);
      } else {
        await base44.asServiceRole.entities.AccountStatus.create(statusData);
      }

      // Update profile status
      const staffProfile = staffProfiles.find(p => p.user_email === userEmail);
      const employerProfile = employerProfiles.find(p => p.user_email === userEmail);

      if (staffProfile) {
        await base44.asServiceRole.entities.StaffProfile.update(staffProfile.id, {
          profile_status: 'suspended'
        });
      }
      if (employerProfile) {
        await base44.asServiceRole.entities.EmployerProfile.update(employerProfile.id, {
          profile_status: 'suspended'
        });
      }

      // Create notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: userEmail,
        type: 'system_alert',
        title: 'Account Suspended',
        message: `Your account has been suspended. Reason: ${reason}. Please contact support for assistance.`,
        priority: 'urgent',
        status: 'unread'
      });

      // Log audit
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: user.email,
        action: 'suspend_account',
        target_user_email: userEmail,
        target_entity: 'AccountStatus',
        details: `Account suspended. Reason: ${reason}. Notes: ${actionReason}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-account-statuses'] });
      queryClient.invalidateQueries({ queryKey: ['all-staff-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['all-employer-profiles'] });
      setSelectedUser(null);
      setActionType(null);
      setActionReason("");
    },
  });

  const reactivateAccountMutation = useMutation({
    mutationFn: async (userEmail) => {
      const existingStatus = accountStatuses.find(s => s.user_email === userEmail);
      
      const statusData = {
        user_email: userEmail,
        account_status: 'active',
        suspension_reason: null,
        reactivation_date: new Date().toISOString(),
        notes: actionReason
      };

      if (existingStatus) {
        await base44.asServiceRole.entities.AccountStatus.update(existingStatus.id, statusData);
      } else {
        await base44.asServiceRole.entities.AccountStatus.create(statusData);
      }

      // Update profile status
      const staffProfile = staffProfiles.find(p => p.user_email === userEmail);
      const employerProfile = employerProfiles.find(p => p.user_email === userEmail);

      if (staffProfile) {
        await base44.asServiceRole.entities.StaffProfile.update(staffProfile.id, {
          profile_status: 'active'
        });
      }
      if (employerProfile) {
        await base44.asServiceRole.entities.EmployerProfile.update(employerProfile.id, {
          profile_status: 'active'
        });
      }

      // Create notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: userEmail,
        type: 'system_alert',
        title: 'Account Reactivated',
        message: 'Your account has been reactivated. You can now access all platform features.',
        priority: 'high',
        status: 'unread'
      });

      // Log audit
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: user.email,
        action: 'reactivate_account',
        target_user_email: userEmail,
        target_entity: 'AccountStatus',
        details: `Account reactivated. Notes: ${actionReason}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-account-statuses'] });
      queryClient.invalidateQueries({ queryKey: ['all-staff-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['all-employer-profiles'] });
      setSelectedUser(null);
      setActionType(null);
      setActionReason("");
    },
  });

  const deactivateAccountMutation = useMutation({
    mutationFn: async (userEmail) => {
      const existingStatus = accountStatuses.find(s => s.user_email === userEmail);
      
      const statusData = {
        user_email: userEmail,
        account_status: 'deactivated',
        notes: actionReason
      };

      if (existingStatus) {
        await base44.asServiceRole.entities.AccountStatus.update(existingStatus.id, statusData);
      } else {
        await base44.asServiceRole.entities.AccountStatus.create(statusData);
      }

      // Log audit
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: user.email,
        action: 'deactivate_account',
        target_user_email: userEmail,
        target_entity: 'AccountStatus',
        details: `Account deactivated. Notes: ${actionReason}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-account-statuses'] });
      setSelectedUser(null);
      setActionType(null);
      setActionReason("");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (userEmail) => {
      // Mark as deleted (soft delete)
      const existingStatus = accountStatuses.find(s => s.user_email === userEmail);
      
      const statusData = {
        user_email: userEmail,
        account_status: 'deleted',
        notes: `Deleted by ${user.email}. Reason: ${actionReason}`
      };

      if (existingStatus) {
        await base44.asServiceRole.entities.AccountStatus.update(existingStatus.id, statusData);
      } else {
        await base44.asServiceRole.entities.AccountStatus.create(statusData);
      }

      // Log audit
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: user.email,
        action: 'delete_account',
        target_user_email: userEmail,
        target_entity: 'User',
        details: `Account marked for deletion. Reason: ${actionReason}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-account-statuses'] });
      setSelectedUser(null);
      setActionType(null);
      setActionReason("");
    },
  });

  const handleAction = () => {
    if (!selectedUser || !actionType) return;

    switch (actionType) {
      case 'suspend':
        if (!actionReason) {
          alert('Please select a suspension reason');
          return;
        }
        suspendAccountMutation.mutate({ 
          userEmail: selectedUser.email, 
          reason: actionReason 
        });
        break;
      case 'reactivate':
        reactivateAccountMutation.mutate(selectedUser.email);
        break;
      case 'deactivate':
        deactivateAccountMutation.mutate(selectedUser.email);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to permanently delete this account? This action cannot be undone.')) {
          deleteAccountMutation.mutate(selectedUser.email);
        }
        break;
    }
  };

  const getUserStatus = (userEmail) => {
    const status = accountStatuses.find(s => s.user_email === userEmail);
    const staffProfile = staffProfiles.find(p => p.user_email === userEmail);
    const employerProfile = employerProfiles.find(p => p.user_email === userEmail);
    
    return {
      accountStatus: status?.account_status || 'active',
      profileStatus: staffProfile?.profile_status || employerProfile?.profile_status || 'active',
      suspensionReason: status?.suspension_reason,
      pastDueAmount: status?.past_due_amount || 0
    };
  };

  const filteredUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Card className="border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Users className="w-7 h-7 text-blue-600" />
              Account Management
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Manage user accounts, suspensions, and access control
            </p>
          </CardHeader>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((u) => {
                const userStatus = getUserStatus(u.email);
                return (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-gray-900">{u.full_name || 'No Name'}</p>
                        <Badge variant="outline">{u.role}</Badge>
                        <Badge className={
                          userStatus.accountStatus === 'active' ? 'bg-green-100 text-green-700' :
                          userStatus.accountStatus === 'suspended' ? 'bg-red-100 text-red-700' :
                          userStatus.accountStatus === 'deactivated' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-200 text-red-800'
                        }>
                          {userStatus.accountStatus}
                        </Badge>
                        {userStatus.pastDueAmount > 0 && (
                          <Badge className="bg-amber-100 text-amber-700">
                            ${userStatus.pastDueAmount.toFixed(2)} Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{u.email}</p>
                      {userStatus.suspensionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Suspended: {userStatus.suspensionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {userStatus.accountStatus === 'suspended' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setSelectedUser(u);
                            setActionType('reactivate');
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Reactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedUser(u);
                            setActionType('suspend');
                          }}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-200"
                        onClick={() => {
                          setSelectedUser(u);
                          setActionType('deactivate');
                        }}
                      >
                        Deactivate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedUser(u);
                          setActionType('delete');
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={!!actionType} onOpenChange={(open) => !open && (setActionType(null), setActionReason(""), setSelectedUser(null))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'suspend' && 'Suspend Account'}
                {actionType === 'reactivate' && 'Reactivate Account'}
                {actionType === 'deactivate' && 'Deactivate Account'}
                {actionType === 'delete' && 'Delete Account'}
              </DialogTitle>
              <DialogDescription>
                {selectedUser && `Action for: ${selectedUser.email}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {actionType === 'suspend' && (
                <div>
                  <Label htmlFor="reason">Suspension Reason *</Label>
                  <Select value={actionReason} onValueChange={setActionReason}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non_payment">Non-Payment</SelectItem>
                      <SelectItem value="terms_violation">Terms of Service Violation</SelectItem>
                      <SelectItem value="security_concern">Security Concern</SelectItem>
                      <SelectItem value="manual_suspension">Manual Suspension</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              {actionType === 'delete' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Warning: Permanent Action</p>
                      <p className="text-sm text-red-700 mt-1">
                        This will permanently delete the account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => (setActionType(null), setActionReason(""), setSelectedUser(null))}>
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={
                  (actionType === 'suspend' && !actionReason) ||
                  suspendAccountMutation.isPending ||
                  reactivateAccountMutation.isPending ||
                  deactivateAccountMutation.isPending ||
                  deleteAccountMutation.isPending
                }
                className={
                  actionType === 'delete' || actionType === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700'
                    : actionType === 'reactivate'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }
              >
                {(suspendAccountMutation.isPending || 
                  reactivateAccountMutation.isPending || 
                  deactivateAccountMutation.isPending || 
                  deleteAccountMutation.isPending) ? 'Processing...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}