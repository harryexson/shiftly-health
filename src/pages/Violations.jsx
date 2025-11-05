import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Shield,
  CheckCircle,
  XCircle
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
import { format } from "date-fns";

export default function Violations() {
  const [user, setUser] = React.useState(null);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [actionTaken, setActionTaken] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: violations = [] } = useQuery({
    queryKey: ['all-violations'],
    queryFn: () => base44.asServiceRole.entities.AccountViolation.list('-reported_date'),
    enabled: !!user && user.role === 'admin',
  });

  const resolveViolationMutation = useMutation({
    mutationFn: async ({ violationId, action, notes }) => {
      const violation = violations.find(v => v.id === violationId);
      
      await base44.asServiceRole.entities.AccountViolation.update(violationId, {
        resolved: true,
        action_taken: action,
        resolution_notes: notes,
        resolved_date: new Date().toISOString()
      });

      // If action is suspension or ban, update account status
      if (action === 'suspension' || action === 'permanent_ban') {
        const accountStatuses = await base44.asServiceRole.entities.AccountStatus.filter({
          user_email: violation.user_email
        });
        
        const accountStatus = accountStatuses[0];
        
        const statusData = {
          user_email: violation.user_email,
          account_status: action === 'permanent_ban' ? 'deleted' : 'suspended',
          suspension_reason: violation.violation_type,
          suspension_date: new Date().toISOString(),
          suspended_by: user.email,
          notes: `Violation: ${violation.description}. Resolution: ${notes}`
        };

        if (accountStatus) {
          await base44.asServiceRole.entities.AccountStatus.update(accountStatus.id, statusData);
        } else {
          await base44.asServiceRole.entities.AccountStatus.create(statusData);
        }

        // Notify user
        await base44.asServiceRole.entities.Notification.create({
          user_email: violation.user_email,
          type: 'system_alert',
          title: action === 'permanent_ban' ? 'Account Permanently Banned' : 'Account Suspended',
          message: `Your account has been ${action === 'permanent_ban' ? 'permanently banned' : 'suspended'} due to: ${violation.violation_type}. ${notes}`,
          priority: 'urgent',
          status: 'unread'
        });
      }

      // Log audit
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: user.email,
        action: 'resolve_violation',
        target_user_email: violation.user_email,
        target_entity: 'AccountViolation',
        target_entity_id: violationId,
        details: `Violation resolved. Action: ${action}. Notes: ${notes}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-violations'] });
      setSelectedViolation(null);
      setActionTaken("");
      setResolutionNotes("");
    },
  });

  const activeViolations = violations.filter(v => !v.resolved);
  const resolvedViolations = violations.filter(v => v.resolved);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-red-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <AlertTriangle className="w-7 h-7 text-red-600" />
              Violations & Enforcement
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Manage terms of service violations and enforcement actions
            </p>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-red-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{activeViolations.length}</div>
                <p className="text-sm text-gray-600 mt-1">Active Violations</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{resolvedViolations.length}</div>
                <p className="text-sm text-gray-600 mt-1">Resolved</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">
                  {violations.filter(v => v.severity === 'critical' && !v.resolved).length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Critical Priority</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Violations */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Active Violations ({activeViolations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {activeViolations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No active violations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeViolations.map((violation) => (
                  <div key={violation.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            violation.severity === 'critical' ? 'bg-red-600 text-white' :
                            violation.severity === 'high' ? 'bg-orange-500 text-white' :
                            violation.severity === 'medium' ? 'bg-amber-500 text-white' :
                            'bg-yellow-500 text-white'
                          }>
                            {violation.severity}
                          </Badge>
                          <Badge variant="outline">{violation.violation_type.replace('_', ' ')}</Badge>
                        </div>
                        <p className="font-semibold text-gray-900">{violation.user_email}</p>
                        <p className="text-sm text-gray-700 mt-1">{violation.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Reported by {violation.reported_by} on {format(new Date(violation.reported_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setSelectedViolation(violation)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Take Action
                      </Button>
                    </div>
                    {violation.evidence_urls && violation.evidence_urls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <p className="text-xs text-gray-600">Evidence: {violation.evidence_urls.length} file(s) attached</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resolved Violations */}
        {resolvedViolations.length > 0 && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle>Recently Resolved ({resolvedViolations.slice(0, 10).length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resolvedViolations.slice(0, 10).map((violation) => (
                  <div key={violation.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="font-semibold text-gray-900">{violation.user_email}</p>
                          <Badge variant="outline">{violation.violation_type.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{violation.description}</p>
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-gray-600">
                            Action: <span className="font-semibold">{violation.action_taken}</span>
                          </p>
                          {violation.resolution_notes && (
                            <p className="text-xs text-gray-600 mt-1">Notes: {violation.resolution_notes}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Resolved on {format(new Date(violation.resolved_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Dialog */}
        <Dialog open={!!selectedViolation} onOpenChange={(open) => !open && (setSelectedViolation(null), setActionTaken(""), setResolutionNotes(""))}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Resolve Violation</DialogTitle>
              <DialogDescription>
                Take enforcement action for this violation
              </DialogDescription>
            </DialogHeader>

            {selectedViolation && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{selectedViolation.user_email}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedViolation.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={
                      selectedViolation.severity === 'critical' ? 'bg-red-600' :
                      selectedViolation.severity === 'high' ? 'bg-orange-500' :
                      'bg-amber-500'
                    }>
                      {selectedViolation.severity}
                    </Badge>
                    <Badge variant="outline">{selectedViolation.violation_type}</Badge>
                  </div>
                </div>

                <div>
                  <Label htmlFor="action">Enforcement Action *</Label>
                  <Select value={actionTaken} onValueChange={setActionTaken}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Issue Warning</SelectItem>
                      <SelectItem value="suspension">Suspend Account</SelectItem>
                      <SelectItem value="permanent_ban">Permanent Ban</SelectItem>
                      <SelectItem value="legal_action">Initiate Legal Action</SelectItem>
                      <SelectItem value="none">No Action (False Report)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resolution">Resolution Notes *</Label>
                  <Textarea
                    id="resolution"
                    placeholder="Document the resolution and any additional context..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                {(actionTaken === 'suspension' || actionTaken === 'permanent_ban') && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Warning</p>
                        <p className="text-sm text-red-700 mt-1">
                          This will {actionTaken === 'permanent_ban' ? 'permanently ban' : 'suspend'} the user's account and send them a notification.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => (setSelectedViolation(null), setActionTaken(""), setResolutionNotes(""))}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedViolation && actionTaken && resolutionNotes) {
                    resolveViolationMutation.mutate({
                      violationId: selectedViolation.id,
                      action: actionTaken,
                      notes: resolutionNotes
                    });
                  }
                }}
                disabled={!actionTaken || !resolutionNotes || resolveViolationMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {resolveViolationMutation.isPending ? 'Processing...' : 'Confirm Action'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}