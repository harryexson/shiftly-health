import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  Download,
  Upload,
  AlertCircle,
  Search,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { verifyCredential } from "@/functions/verifyCredential";

export default function CredentialVerification() {
  const [user, setUser] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [autoVerifying, setAutoVerifying] = useState(false);
  
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: pendingRecords = [], refetch: refetchPending } = useQuery({
    queryKey: ['pending-credentials', filterStatus],
    queryFn: () => base44.asServiceRole.entities.ComplianceRecord.filter({ 
      verification_status: filterStatus 
    }, '-created_date'),
    enabled: !!user && user.role === 'admin',
  });

  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['staff-profiles-verification'],
    queryFn: () => base44.asServiceRole.entities.StaffProfile.list(),
    enabled: !!user && user.role === 'admin',
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ recordId, record, action, verificationNotes }) => {
      const newStatus = action === 'approve' ? 'verified' : 'rejected';
      
      // Update compliance record
      await base44.asServiceRole.entities.ComplianceRecord.update(recordId, {
        verification_status: newStatus,
        verified_by: user.email,
        verified_date: new Date().toISOString(),
        notes: verificationNotes
      });

      // Check if all staff credentials are verified
      const staffRecords = await base44.asServiceRole.entities.ComplianceRecord.filter({
        user_email: record.user_email
      });

      const allVerified = staffRecords.every(r => 
        r.id === recordId ? newStatus === 'verified' : r.verification_status === 'verified'
      );

      // Update staff profile verification status
      const staffProfile = staffProfiles.find(p => p.user_email === record.user_email);
      if (staffProfile) {
        await base44.asServiceRole.entities.StaffProfile.update(staffProfile.id, {
          verification_status: allVerified ? 'verified' : 
                              action === 'reject' ? 'rejected' : 'pending'
        });
      }

      // Create notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: record.user_email,
        type: 'verification_update',
        title: action === 'approve' 
          ? '✅ Credential Verified!' 
          : '⚠️ Credential Verification Issue',
        message: action === 'approve'
          ? `Your ${record.document_name} has been verified and approved. ${allVerified ? 'All your credentials are now verified!' : 'Please ensure all credentials are submitted for full verification.'}`
          : `Your ${record.document_name} verification requires attention: ${verificationNotes}. Please re-upload or contact support.`,
        priority: action === 'approve' ? 'high' : 'urgent',
        status: 'unread'
      });

      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: record.user_email,
        subject: action === 'approve' 
          ? `Credential Verified: ${record.document_name}` 
          : `Action Required: ${record.document_name} Verification`,
        body: action === 'approve'
          ? `
            <h2>✅ Credential Verified</h2>
            <p>Great news! Your credential has been verified:</p>
            <ul>
              <li><strong>Document:</strong> ${record.document_name}</li>
              <li><strong>Type:</strong> ${record.record_type}</li>
              <li><strong>Verified Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            ${allVerified 
              ? '<p><strong>🎉 All your credentials are now verified!</strong> You can now apply for shifts.</p>' 
              : '<p>Please submit any remaining credentials for full profile verification.</p>'}
          `
          : `
            <h2>⚠️ Credential Verification Issue</h2>
            <p>We need additional information regarding your credential:</p>
            <ul>
              <li><strong>Document:</strong> ${record.document_name}</li>
              <li><strong>Type:</strong> ${record.record_type}</li>
              <li><strong>Issue:</strong> ${verificationNotes}</li>
            </ul>
            <p>Please log in to your account and re-upload the document or contact support for assistance.</p>
          `
      });

      // Log audit trail
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: user.email,
        action: action === 'approve' ? 'verify_credential' : 'reject_credential',
        target_user_email: record.user_email,
        target_entity: 'ComplianceRecord',
        target_entity_id: recordId,
        details: `${record.document_name} (${record.record_type}) ${action === 'approve' ? 'verified' : 'rejected'}. Notes: ${verificationNotes}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['staff-profiles-verification'] });
      setShowVerifyDialog(false);
      setSelectedRecord(null);
      setActionType(null);
      setNotes("");
    },
  });

  const autoVerifyMutation = useMutation({
    mutationFn: async (record) => {
      setAutoVerifying(true);
      
      try {
        // Call third-party verification service
        const { data: verificationResult } = await verifyCredential({
          record_type: record.record_type,
          document_url: record.document_url,
          user_email: record.user_email,
          license_number: record.record_type === 'license_verification' ? record.third_party_verification_id : null,
          state: getStaffState(record.user_email),
          full_name: getStaffName(record.user_email)
        });

        if (verificationResult.verified) {
          // Auto-approve if verification passed
          await verifyMutation.mutateAsync({
            recordId: record.id,
            record: record,
            action: 'approve',
            verificationNotes: `Automatically verified via ${verificationResult.provider}. Reference: ${verificationResult.verification_id}. ${verificationResult.details || ''}`
          });
        } else {
          // Flag for manual review if verification failed
          await base44.asServiceRole.entities.ComplianceRecord.update(record.id, {
            notes: `Auto-verification failed: ${verificationResult.reason}. Requires manual review.`
          });
          
          await base44.asServiceRole.entities.Notification.create({
            user_email: user.email,
            type: 'system_alert',
            title: 'Auto-Verification Failed',
            message: `Credential for ${getStaffName(record.user_email)} requires manual review: ${verificationResult.reason}`,
            priority: 'high',
            status: 'unread'
          });
        }
        
        refetchPending();
      } catch (error) {
        console.error('Auto-verification error:', error);
      } finally {
        setAutoVerifying(false);
      }
    },
  });

  const getStaffProfile = (userEmail) => {
    return staffProfiles.find(p => p.user_email === userEmail);
  };

  const getStaffName = (userEmail) => {
    const profile = getStaffProfile(userEmail);
    return profile?.full_name || userEmail;
  };

  const getStaffState = (userEmail) => {
    const profile = getStaffProfile(userEmail);
    return profile?.license_state || profile?.state || '';
  };

  const filteredRecords = pendingRecords.filter(record => {
    const staffName = getStaffName(record.user_email).toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return staffName.includes(search) || 
           record.document_name.toLowerCase().includes(search) ||
           record.record_type.toLowerCase().includes(search);
  });

  const handleAction = (record, action) => {
    setSelectedRecord(record);
    setActionType(action);
    setShowVerifyDialog(true);
  };

  const handleSubmit = () => {
    if (!selectedRecord || !actionType) return;
    
    verifyMutation.mutate({
      recordId: selectedRecord.id,
      record: selectedRecord,
      action: actionType,
      verificationNotes: notes
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">This area is restricted to administrators only.</p>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Shield className="w-7 h-7 text-purple-600" />
                  Credential Verification Center
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Review and verify staff licenses, certifications, and compliance documents
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-amber-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {pendingRecords.filter(r => r.verification_status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verified</p>
                  <p className="text-3xl font-bold text-green-600">
                    {pendingRecords.filter(r => r.verification_status === 'verified').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">
                    {pendingRecords.filter(r => r.verification_status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {[...new Set(pendingRecords.map(r => r.user_email))].length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, document, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => refetchPending()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No credentials to review</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => {
              const staffProfile = getStaffProfile(record.user_email);
              
              return (
                <Card key={record.id} className="border-blue-100/50 hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left: Staff Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {getStaffName(record.user_email)}
                            </h3>
                            <p className="text-sm text-gray-600">{record.user_email}</p>
                            {staffProfile && (
                              <div className="flex gap-2 mt-2">
                                <Badge className="bg-blue-100 text-blue-700">
                                  {staffProfile.staff_type === 'licensed' ? 'Licensed Professional' :
                                   staffProfile.staff_type === 'unlicensed_dsp' ? 'DSP' : 'Caregiver'}
                                </Badge>
                                <Badge 
                                  className={
                                    staffProfile.verification_status === 'verified' 
                                      ? 'bg-green-100 text-green-700'
                                      : staffProfile.verification_status === 'rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-100 text-amber-700'
                                  }
                                >
                                  Profile: {staffProfile.verification_status}
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <Badge 
                            className={
                              record.verification_status === 'verified' 
                                ? 'bg-green-500 text-white'
                                : record.verification_status === 'rejected'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-amber-500 text-white'
                            }
                          >
                            {record.verification_status}
                          </Badge>
                        </div>

                        {/* Document Details */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">{record.document_name}</span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <span className="ml-2 font-medium">{record.record_type}</span>
                            </div>
                            
                            {record.issued_date && (
                              <div>
                                <span className="text-gray-600">Issued:</span>
                                <span className="ml-2 font-medium">
                                  {format(new Date(record.issued_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                            )}
                            
                            {record.expiry_date && (
                              <div>
                                <span className="text-gray-600">Expires:</span>
                                <span className="ml-2 font-medium">
                                  {format(new Date(record.expiry_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                            )}
                            
                            {record.third_party_verification_id && (
                              <div>
                                <span className="text-gray-600">License #:</span>
                                <span className="ml-2 font-medium">{record.third_party_verification_id}</span>
                              </div>
                            )}
                          </div>

                          {record.notes && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                <strong>Notes:</strong> {record.notes}
                              </p>
                            </div>
                          )}

                          {record.verified_by && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                <strong>Verified by:</strong> {record.verified_by} on{' '}
                                {format(new Date(record.verified_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="lg:w-64 space-y-3">
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => window.open(record.document_url, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                          View Document
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = record.document_url;
                            link.download = record.document_name;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>

                        {record.verification_status === 'pending' && (
                          <>
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                              onClick={() => autoVerifyMutation.mutate(record)}
                              disabled={autoVerifying}
                            >
                              <RefreshCw className={`w-4 h-4 ${autoVerifying ? 'animate-spin' : ''}`} />
                              Auto-Verify
                            </Button>

                            <div className="border-t border-gray-200 pt-3">
                              <Button
                                className="w-full bg-green-600 hover:bg-green-700 gap-2 mb-2"
                                onClick={() => handleAction(record, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </Button>

                              <Button
                                variant="outline"
                                className="w-full border-red-200 text-red-700 hover:bg-red-50 gap-2"
                                onClick={() => handleAction(record, 'reject')}
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </Button>
                            </div>
                          </>
                        )}

                        {record.verification_status !== 'pending' && (
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-600">
                              Already {record.verification_status}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Credential' : 'Reject Credential'}
            </DialogTitle>
            <DialogDescription>
              {selectedRecord && (
                <>
                  <strong>{selectedRecord.document_name}</strong> for{' '}
                  {getStaffName(selectedRecord.user_email)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="notes">
                {actionType === 'approve' ? 'Verification Notes (Optional)' : 'Rejection Reason *'}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  actionType === 'approve'
                    ? 'Add any notes about this verification...'
                    : 'Explain why this credential is being rejected...'
                }
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
                      <li>• Mark credential as verified</li>
                      <li>• Send approval notification to staff</li>
                      <li>• Update staff profile if all credentials verified</li>
                      <li>• Log verification in audit trail</li>
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
                      <li>• Mark credential as rejected</li>
                      <li>• Send rejection notification to staff</li>
                      <li>• Request staff to re-upload document</li>
                      <li>• Staff cannot apply until resolved</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowVerifyDialog(false);
                setSelectedRecord(null);
                setActionType(null);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                (actionType === 'reject' && !notes) ||
                verifyMutation.isPending
              }
              className={
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {verifyMutation.isPending
                ? 'Processing...'
                : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}