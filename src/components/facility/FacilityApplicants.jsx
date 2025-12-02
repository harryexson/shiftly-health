import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Award,
  Phone,
  Mail,
  Shield
} from "lucide-react";
import StaffCredentialsViewer from "./StaffCredentialsViewer";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPageUrl } from "@/utils";

export default function FacilityApplicants({ user, applications, shifts }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [responseNotes, setResponseNotes] = useState("");
  
  const queryClient = useQueryClient();

  // Fetch staff profiles for applicants
  const applicantEmails = [...new Set(applications.map(a => a.staff_email))];
  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['staff-profiles', applicantEmails],
    queryFn: async () => {
      if (applicantEmails.length === 0) return [];
      const profiles = await Promise.all(
        applicantEmails.map(email => 
          base44.entities.StaffProfile.filter({ user_email: email })
        )
      );
      return profiles.flat();
    },
    enabled: applicantEmails.length > 0
  });

  const actionMutation = useMutation({
    mutationFn: async ({ applicationId, status, notes }) => {
      await base44.entities.ShiftApplication.update(applicationId, {
        status,
        response_date: new Date().toISOString(),
        response_notes: notes
      });

      const app = applications.find(a => a.id === applicationId);
      const shift = shifts.find(s => s.id === app?.shift_id);

      if (status === 'accepted' && shift) {
        await base44.entities.Shift.update(shift.id, {
          positions_filled: (shift.positions_filled || 0) + 1,
          status: (shift.positions_filled || 0) + 1 >= shift.number_of_positions ? 'filled' : 'open'
        });

        await base44.entities.Notification.create({
          user_email: app.staff_email,
          type: 'application_update',
          title: 'Application Accepted! 🎉',
          message: `Your application for "${shift.title}" has been accepted!`,
          priority: 'high',
          action_url: createPageUrl("MyApplications"),
          status: 'unread'
        });
      } else if (status === 'rejected') {
        await base44.entities.Notification.create({
          user_email: app.staff_email,
          type: 'application_update',
          title: 'Application Update',
          message: `Your application for "${shift?.title}" was not selected.`,
          priority: 'medium',
          action_url: createPageUrl("BrowseShifts"),
          status: 'unread'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['facility-applications']);
      queryClient.invalidateQueries(['facility-shifts']);
      setShowActionDialog(false);
      setSelectedApplication(null);
      setResponseNotes("");
    }
  });

  const getStaffProfile = (email) => {
    return staffProfiles.find(p => p.user_email === email);
  };

  const filteredApplications = applications.filter(app => {
    const profile = getStaffProfile(app.staff_email);
    const matchesSearch = profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.staff_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesShift = shiftFilter === 'all' || app.shift_id === shiftFilter;
    return matchesSearch && matchesStatus && matchesShift;
  });

  const handleAction = (application, type) => {
    setSelectedApplication(application);
    setActionType(type);
    setShowActionDialog(true);
  };

  const handleViewProfile = (application) => {
    setSelectedApplication(application);
    setShowProfileDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={shiftFilter} onValueChange={setShiftFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shifts</SelectItem>
            {shifts.map(shift => (
              <SelectItem key={shift.id} value={shift.id}>
                {shift.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No applications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((app) => {
            const profile = getStaffProfile(app.staff_email);
            const shift = shifts.find(s => s.id === app.shift_id);
            
            return (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white text-lg">
                          {profile?.full_name?.charAt(0) || app.staff_email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {profile?.full_name || app.staff_email}
                          </h3>
                          {profile?.verification_status === 'verified' && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">
                          Applied for: <span className="font-medium">{shift?.title}</span>
                        </p>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          {profile?.staff_type && (
                            <Badge variant="outline" className="capitalize">
                              {profile.staff_type.replace('_', ' ')}
                            </Badge>
                          )}
                          {profile?.years_experience && (
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {profile.years_experience} yrs exp
                            </span>
                          )}
                          {app.distance_miles && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {app.distance_miles.toFixed(1)} mi away
                            </span>
                          )}
                          {profile?.average_rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {profile.average_rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {profile?.qualifications?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {profile.qualifications.slice(0, 4).map((qual, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {qual}
                              </Badge>
                            ))}
                            {profile.qualifications.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{profile.qualifications.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{app.match_score || 0}%</p>
                          <p className="text-xs text-gray-500">Match Score</p>
                        </div>
                        <Badge className={
                          app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {app.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProfile(app)}
                        >
                          View Profile
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAction(app, 'accept')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleAction(app, 'reject')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {app.cover_letter && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 italic">"{app.cover_letter}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicant Profile & Credentials</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
                <TabsTrigger value="credentials" className="flex-1">
                  <Shield className="w-4 h-4 mr-1" />
                  Credentials
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4 mt-4">
                {(() => {
                  const profile = getStaffProfile(selectedApplication.staff_email);
                  return (
                    <>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white text-2xl">
                            {profile?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{profile?.full_name || 'Unknown'}</h3>
                            {profile?.verification_status === 'verified' && (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 capitalize">{profile?.staff_type?.replace('_', ' ')}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {selectedApplication.staff_email}
                            </span>
                            {profile?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {profile.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {profile?.bio && (
                        <div>
                          <h4 className="font-semibold mb-2">About</h4>
                          <p className="text-gray-600">{profile.bio}</p>
                        </div>
                      )}

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-sm text-gray-600">Experience</h4>
                          <p className="text-lg font-bold text-gray-900">{profile?.years_experience || 0} years</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-sm text-gray-600">Desired Rate</h4>
                          <p className="text-lg font-bold text-gray-900">${profile?.hourly_rate || '--'}/hr</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-sm text-gray-600">Match Score</h4>
                          <p className="text-lg font-bold text-blue-600">{selectedApplication.match_score || 0}%</p>
                        </div>
                      </div>

                      {profile?.qualifications?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Qualifications</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.qualifications.map((qual, idx) => (
                              <Badge key={idx} variant="secondary">{qual}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile?.license_number && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-1">License Information</h4>
                          <div className="grid md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-blue-700">Number:</span> {profile.license_number}
                            </div>
                            <div>
                              <span className="text-blue-700">State:</span> {profile.license_state || 'N/A'}
                            </div>
                            <div>
                              <span className="text-blue-700">Expires:</span> {profile.license_expiry ? new Date(profile.license_expiry).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="credentials" className="mt-4">
                <StaffCredentialsViewer 
                  staffEmail={selectedApplication.staff_email}
                  employerEmail={user?.email}
                />
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Close
            </Button>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' ? 'Accept Application' : 'Reject Application'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept' 
                ? 'This will notify the applicant and add them to your shift.'
                : 'This will notify the applicant that they were not selected.'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Add a note (optional)</label>
            <Textarea
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              placeholder={actionType === 'accept' 
                ? "Welcome aboard! Please arrive 10 minutes early..."
                : "Thank you for your interest..."
              }
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button 
              className={actionType === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={() => actionMutation.mutate({
                applicationId: selectedApplication?.id,
                status: actionType === 'accept' ? 'accepted' : 'rejected',
                notes: responseNotes
              })}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? 'Processing...' : (actionType === 'accept' ? 'Accept' : 'Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}