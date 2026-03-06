import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Star, 
  Heart,
  Ban,
  MessageSquare,
  Award,
  Clock,
  CheckCircle,
  ThumbsUp,
  ThumbsDown
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

export default function FacilityTeam({ user, applications, ratings }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [ratingData, setRatingData] = useState({
    overall_rating: 5,
    punctuality_rating: 5,
    professionalism_rating: 5,
    clinical_skills_rating: 5,
    teamwork_rating: 5,
    would_hire_again: true,
    comment: ""
  });

  const queryClient = useQueryClient();

  // Get unique hired staff from accepted applications
  const acceptedApps = applications.filter(a => a.status === 'accepted');
  const uniqueStaffEmails = [...new Set(acceptedApps.map(a => a.staff_email))];

  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['team-profiles', uniqueStaffEmails],
    queryFn: async () => {
      if (uniqueStaffEmails.length === 0) return [];
      const profiles = await Promise.all(
        uniqueStaffEmails.map(email => 
          base44.entities.StaffProfile.filter({ user_email: email })
        )
      );
      return profiles.flat();
    },
    enabled: uniqueStaffEmails.length > 0
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ['staff-preferences', user?.email],
    queryFn: () => base44.entities.FacilityStaffPreference.filter({ employer_email: user?.email }),
    enabled: !!user
  });

  const preferenceMutation = useMutation({
    mutationFn: async ({ staffEmail, preferenceType, reason }) => {
      const existing = preferences.find(p => p.staff_email === staffEmail);
      if (existing) {
        await base44.entities.FacilityStaffPreference.update(existing.id, {
          preference_type: preferenceType,
          reason
        });
      } else {
        await base44.entities.FacilityStaffPreference.create({
          employer_email: user.email,
          staff_email: staffEmail,
          preference_type: preferenceType,
          reason
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-preferences']);
    }
  });

  const ratingMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.StaffRating.create({
        ...data,
        employer_email: user.email,
        rating_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['facility-ratings']);
      setShowRatingDialog(false);
      setSelectedStaff(null);
    }
  });

  const getStaffProfile = (email) => staffProfiles.find(p => p.user_email === email);
  const getStaffPreference = (email) => preferences.find(p => p.staff_email === email);
  const getStaffShiftCount = (email) => acceptedApps.filter(a => a.staff_email === email).length;
  const getStaffRatings = (email) => ratings.filter(r => r.staff_email === email);

  const filteredStaff = uniqueStaffEmails.filter(email => {
    const profile = getStaffProfile(email);
    return profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const favorites = filteredStaff.filter(email => getStaffPreference(email)?.preference_type === 'favorite');
  const blocked = filteredStaff.filter(email => getStaffPreference(email)?.preference_type === 'blocked');
  const others = filteredStaff.filter(email => !getStaffPreference(email));

  const handleRate = (staffEmail, shiftId) => {
    setSelectedStaff({ email: staffEmail, shiftId });
    setShowRatingDialog(true);
  };

  const renderStaffCard = (email) => {
    const profile = getStaffProfile(email);
    const preference = getStaffPreference(email);
    const shiftCount = getStaffShiftCount(email);
    const staffRatings = getStaffRatings(email);
    const avgRating = staffRatings.length > 0 
      ? staffRatings.reduce((sum, r) => sum + r.overall_rating, 0) / staffRatings.length 
      : null;

    return (
      <Card key={email} className={`hover:shadow-md transition-shadow ${
        preference?.preference_type === 'favorite' ? 'border-pink-200 bg-pink-50/50' :
        preference?.preference_type === 'blocked' ? 'border-gray-300 bg-gray-50' : ''
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white text-lg">
                  {profile?.full_name?.charAt(0) || email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {profile?.full_name || email}
                  </h3>
                  {preference?.preference_type === 'favorite' && (
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  )}
                  {preference?.preference_type === 'blocked' && (
                    <Ban className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                
                <p className="text-gray-600 text-sm capitalize mb-2">
                  {profile?.staff_type?.replace('_', ' ') || 'Staff'}
                </p>
                
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    {shiftCount} shifts completed
                  </span>
                  {avgRating && (
                    <span className="flex items-center gap-1 text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {avgRating.toFixed(1)} ({staffRatings.length} reviews)
                    </span>
                  )}
                  {profile?.years_experience && (
                    <span className="flex items-center gap-1 text-gray-600">
                      <Award className="w-4 h-4" />
                      {profile.years_experience} yrs exp
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={preference?.preference_type === 'favorite' ? 'bg-pink-100' : ''}
                  onClick={() => preferenceMutation.mutate({
                    staffEmail: email,
                    preferenceType: preference?.preference_type === 'favorite' ? null : 'favorite',
                    reason: 'Added to favorites'
                  })}
                >
                  <Heart className={`w-4 h-4 ${preference?.preference_type === 'favorite' ? 'fill-pink-500 text-pink-500' : ''}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={preference?.preference_type === 'blocked' ? 'bg-gray-200' : ''}
                  onClick={() => preferenceMutation.mutate({
                    staffEmail: email,
                    preferenceType: preference?.preference_type === 'blocked' ? null : 'blocked',
                    reason: 'Blocked from future shifts'
                  })}
                >
                  <Ban className={`w-4 h-4 ${preference?.preference_type === 'blocked' ? 'text-gray-600' : ''}`} />
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleRate(email, acceptedApps.find(a => a.staff_email === email)?.shift_id)}
              >
                <Star className="w-4 h-4 mr-1" />
                Rate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{uniqueStaffEmails.length}</p>
            <p className="text-sm text-gray-600">Total Hired</p>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-pink-600">{favorites.length}</p>
            <p className="text-sm text-gray-600">Favorites</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gray-600">{blocked.length}</p>
            <p className="text-sm text-gray-600">Blocked</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-100">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-yellow-600">{ratings.length}</p>
            <p className="text-sm text-gray-600">Reviews Given</p>
          </CardContent>
        </Card>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Favorite Staff
          </h3>
          <div className="grid gap-4">
            {favorites.map(renderStaffCard)}
          </div>
        </div>
      )}

      {/* All Team Members */}
      {others.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="grid gap-4">
            {others.map(renderStaffCard)}
          </div>
        </div>
      )}

      {/* Blocked Section */}
      {blocked.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-4 flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Blocked Staff
          </h3>
          <div className="grid gap-4 opacity-75">
            {blocked.map(renderStaffCard)}
          </div>
        </div>
      )}

      {uniqueStaffEmails.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No team members yet. Accept applications to build your team!</p>
          </CardContent>
        </Card>
      )}

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Staff Member</DialogTitle>
            <DialogDescription>
              Your feedback helps maintain quality on the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {['overall', 'punctuality', 'professionalism', 'clinical_skills', 'teamwork'].map((category) => (
              <div key={category}>
                <Label className="capitalize">{category.replace('_', ' ')} Rating</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingData(prev => ({ ...prev, [`${category}_rating`]: star }))}
                      className="p-1"
                    >
                      <Star className={`w-6 h-6 ${
                        star <= ratingData[`${category}_rating`] 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-gray-300'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4">
              <Label>Would hire again?</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={ratingData.would_hire_again ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRatingData(prev => ({ ...prev, would_hire_again: true }))}
                  className={ratingData.would_hire_again ? 'bg-green-600' : ''}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant={!ratingData.would_hire_again ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRatingData(prev => ({ ...prev, would_hire_again: false }))}
                  className={!ratingData.would_hire_again ? 'bg-red-600' : ''}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Comments</Label>
              <Textarea
                value={ratingData.comment}
                onChange={(e) => setRatingData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => ratingMutation.mutate({
                ...ratingData,
                staff_email: selectedStaff?.email,
                shift_id: selectedStaff?.shiftId
              })}
              disabled={ratingMutation.isPending}
            >
              {ratingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}