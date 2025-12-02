import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Award, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Plus,
  ExternalLink,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DOCUMENT_TYPES = [
  { value: "license_verification", label: "Professional License", icon: Shield },
  { value: "certification", label: "Certification", icon: Award },
  { value: "training", label: "Training Completion", icon: FileText },
  { value: "background_check", label: "Background Check", icon: CheckCircle },
  { value: "drug_test", label: "Drug Test", icon: FileText },
  { value: "other", label: "Other Document", icon: FileText }
];

const COMMON_DOCUMENTS = [
  "RN License", "LPN License", "CNA Certification", "CPR Certification",
  "BLS Certification", "ACLS Certification", "First Aid Certification",
  "TB Test Results", "Hepatitis B Vaccination", "Background Check",
  "Drug Screening", "COVID-19 Vaccination", "Flu Vaccination"
];

export default function StaffCredentialsViewer({ staffEmail, employerEmail, onClose }) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestData, setRequestData] = useState({
    document_type: "certification",
    document_name: "",
    reason: "",
    due_date: "",
    notes: ""
  });
  
  const queryClient = useQueryClient();

  const { data: complianceRecords = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['staff-compliance', staffEmail],
    queryFn: () => base44.entities.ComplianceRecord.filter({ user_email: staffEmail }),
    enabled: !!staffEmail
  });

  const { data: documentRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['document-requests', staffEmail, employerEmail],
    queryFn: () => base44.entities.DocumentRequest.filter({ 
      staff_email: staffEmail,
      employer_email: employerEmail
    }),
    enabled: !!staffEmail && !!employerEmail
  });

  const requestMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.DocumentRequest.create({
        ...data,
        employer_email: employerEmail,
        staff_email: staffEmail,
        status: 'pending'
      });

      // Notify staff
      await base44.entities.Notification.create({
        user_email: staffEmail,
        type: 'verification_update',
        title: 'Document Requested',
        message: `A facility has requested you upload: ${data.document_name}`,
        priority: 'high',
        action_url: '/StaffProfile',
        status: 'unread'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['document-requests']);
      setShowRequestDialog(false);
      setRequestData({
        document_type: "certification",
        document_name: "",
        reason: "",
        due_date: "",
        notes: ""
      });
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-700"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'uploaded':
        return <Badge className="bg-blue-100 text-blue-700"><FileText className="w-3 h-3 mr-1" />Uploaded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocIcon = (type) => {
    const docType = DOCUMENT_TYPES.find(d => d.value === type);
    const Icon = docType?.icon || FileText;
    return <Icon className="w-5 h-5" />;
  };

  const isDocumentExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const verifiedCount = complianceRecords.filter(r => r.verification_status === 'verified').length;
  const pendingCount = complianceRecords.filter(r => r.verification_status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-700">{verifiedCount}</p>
            <p className="text-xs text-green-600">Verified</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            <p className="text-xs text-amber-600">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{complianceRecords.length}</p>
            <p className="text-xs text-blue-600">Total Documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Uploaded Credentials</h4>
        </div>
        
        {loadingRecords ? (
          <p className="text-gray-500 text-center py-4">Loading...</p>
        ) : complianceRecords.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No documents uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {complianceRecords.map((record) => (
              <div 
                key={record.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isDocumentExpired(record.expiry_date) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    record.verification_status === 'verified' ? 'bg-green-100 text-green-600' :
                    record.verification_status === 'rejected' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {getDocIcon(record.record_type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{record.document_name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="capitalize">{record.record_type.replace(/_/g, ' ')}</span>
                      {record.expiry_date && (
                        <span className={isDocumentExpired(record.expiry_date) ? 'text-red-600 font-medium' : ''}>
                          • {isDocumentExpired(record.expiry_date) ? 'Expired' : 'Expires'}: {format(new Date(record.expiry_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(record.verification_status)}
                  {record.document_url && (
                    <a href={record.document_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Your Document Requests</h4>
          <Button size="sm" onClick={() => setShowRequestDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Request Document
          </Button>
        </div>
        
        {loadingRequests ? (
          <p className="text-gray-500 text-center py-4">Loading...</p>
        ) : documentRequests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-6">
              <p className="text-gray-500 text-sm">No document requests sent to this staff member</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {documentRequests.map((request) => (
              <div 
                key={request.id} 
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    {getDocIcon(request.document_type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.document_name}</p>
                    <p className="text-xs text-gray-600">
                      Requested {format(new Date(request.created_date), 'MMM d, yyyy')}
                      {request.due_date && ` • Due: ${format(new Date(request.due_date), 'MMM d')}`}
                    </p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Document Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Document from Staff</DialogTitle>
            <DialogDescription>
              Send a request to this staff member to upload a specific document for verification.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Document Type *</Label>
              <Select 
                value={requestData.document_type} 
                onValueChange={(v) => setRequestData({...requestData, document_type: v})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Document Name *</Label>
              <div className="mt-1 space-y-2">
                <Input
                  value={requestData.document_name}
                  onChange={(e) => setRequestData({...requestData, document_name: e.target.value})}
                  placeholder="e.g., CPR Certification, RN License"
                />
                <div className="flex flex-wrap gap-1">
                  {COMMON_DOCUMENTS.slice(0, 6).map((doc) => (
                    <Badge 
                      key={doc} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => setRequestData({...requestData, document_name: doc})}
                    >
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Reason for Request</Label>
              <Textarea
                value={requestData.reason}
                onChange={(e) => setRequestData({...requestData, reason: e.target.value})}
                placeholder="Why do you need this document?"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date (Optional)</Label>
                <Input
                  type="date"
                  value={requestData.due_date}
                  onChange={(e) => setRequestData({...requestData, due_date: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={requestData.notes}
                onChange={(e) => setRequestData({...requestData, notes: e.target.value})}
                placeholder="Any specific requirements or instructions..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => requestMutation.mutate(requestData)}
              disabled={!requestData.document_name || requestMutation.isPending}
            >
              {requestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}