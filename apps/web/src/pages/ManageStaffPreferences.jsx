import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Heart, 
  Ban, 
  Search,
  Mail,
  Briefcase,
  Award,
  TrendingUp,
  Trash2,
  Plus
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManageStaffPreferences() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPreference, setNewPreference] = useState({
    staff_email: "",
    preference_type: "favorite",
    reason: "",
    notes: ""
  });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: preferences = [] } = useQuery({
    queryKey: ['staff-preferences', user?.email],
    queryFn: () => base44.entities.FacilityStaffPreference.filter({ 
      employer_email: user?.email 
    }),
    enabled: !!user,
  });

  const { data: allStaff = [] } = useQuery({
    queryKey: ['all-staff-profiles'],
    queryFn: () => base44.asServiceRole.entities.StaffProfile.list(),
    enabled: !!user,
  });

  const addPreferenceMutation = useMutation({
    mutationFn: async (prefData) => {
      return await base44.entities.FacilityStaffPreference.create({
        ...prefData,
        created_date: new Date().toISOString(),
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-preferences'] });
      setShowAddDialog(false);
      setNewPreference({
        staff_email: "",
        preference_type: "favorite",
        reason: "",
        notes: ""
      });
    },
  });

  const removePreferenceMutation = useMutation({
    mutationFn: async (prefId) => {
      return await base44.entities.FacilityStaffPreference.delete(prefId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-preferences'] });
    },
  });

  const favorites = preferences.filter(p => p.preference_type === 'favorite');
  const blocked = preferences.filter(p => p.preference_type === 'blocked');

  const getStaffProfile = (email) => {
    return allStaff.find(s => s.user_email === email);
  };

  const filteredFavorites = favorites.filter(pref => {
    const staff = getStaffProfile(pref.staff_email);
    if (!staff) return false;
    return staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pref.staff_email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredBlocked = blocked.filter(pref => {
    const staff = getStaffProfile(pref.staff_email);
    if (!staff) return false;
    return staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pref.staff_email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const StaffPreferenceCard = ({ preference, type }) => {
    const staff = getStaffProfile(preference.staff_email);
    if (!staff) return null;

    return (
      <div className={`p-4 rounded-lg border-2 ${
        type === 'favorite' 
          ? 'bg-gradient-to-r from-green-50 to-teal-50 border-green-200' 
          : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-bold text-gray-900">{staff.full_name}</h4>
              {type === 'favorite' ? (
                <Badge className="bg-green-100 text-green-700">
                  <Heart className="w-3 h-3 mr-1" />
                  Favorite
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">
                  <Ban className="w-3 h-3 mr-1" />
                  Blocked
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Mail className="w-4 h-4" />
              <span>{preference.staff_email}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                <Briefcase className="w-3 h-3 mr-1" />
                {staff.staff_type}
              </Badge>
              {staff.average_rating && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {staff.average_rating.toFixed(1)} ({staff.total_ratings} reviews)
                </Badge>
              )}
              {staff.total_shifts_completed > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  {staff.total_shifts_completed} shifts completed
                </Badge>
              )}
              {staff.reliability_score && (
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {staff.reliability_score}% reliable
                </Badge>
              )}
            </div>

            {preference.reason && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-700">Reason:</p>
                <p className="text-sm text-gray-600">{preference.reason}</p>
              </div>
            )}

            {preference.notes && (
              <div>
                <p className="text-xs font-semibold text-gray-700">Notes:</p>
                <p className="text-sm text-gray-600">{preference.notes}</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm(`Remove this staff member from your ${type} list?`)) {
                removePreferenceMutation.mutate(preference.id);
              }
            }}
            className={`${
              type === 'favorite' ? 'text-green-600 hover:text-green-700 hover:bg-green-100' : 'text-red-600 hover:text-red-700 hover:bg-red-100'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Staff Preferences
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Manage your favorite and blocked healthcare professionals
                </p>
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Preference
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Favorite Staff</p>
                  <p className="text-3xl font-bold text-green-600">{favorites.length}</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                These staff members will be prioritized for your shifts
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Blocked Staff</p>
                  <p className="text-3xl font-bold text-red-600">{blocked.length}</p>
                </div>
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                  <Ban className="w-7 h-7 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                These staff members cannot apply to your shifts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Favorites List */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-6 h-6 text-green-600" />
              Favorite Staff ({filteredFavorites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No favorite staff members yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add staff you've worked with and would like to hire again
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredFavorites.map((pref) => (
                  <StaffPreferenceCard key={pref.id} preference={pref} type="favorite" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blocked List */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Ban className="w-6 h-6 text-red-600" />
              Blocked Staff ({filteredBlocked.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBlocked.length === 0 ? (
              <div className="text-center py-12">
                <Ban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No blocked staff members</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredBlocked.map((pref) => (
                  <StaffPreferenceCard key={pref.id} preference={pref} type="blocked" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Preference Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Staff Preference</DialogTitle>
              <DialogDescription>
                Add a staff member to your favorites or blocked list
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="staff_email">Staff Email *</Label>
                <Input
                  id="staff_email"
                  type="email"
                  placeholder="staff@example.com"
                  value={newPreference.staff_email}
                  onChange={(e) => setNewPreference({...newPreference, staff_email: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="preference_type">Preference Type *</Label>
                <Select
                  value={newPreference.preference_type}
                  onValueChange={(value) => setNewPreference({...newPreference, preference_type: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="favorite">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-green-600" />
                        Favorite
                      </div>
                    </SelectItem>
                    <SelectItem value="blocked">
                      <div className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-red-600" />
                        Blocked
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="Why are you adding this preference?"
                  value={newPreference.reason}
                  onChange={(e) => setNewPreference({...newPreference, reason: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="notes">Private Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={newPreference.notes}
                  onChange={(e) => setNewPreference({...newPreference, notes: e.target.value})}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => addPreferenceMutation.mutate({
                  ...newPreference,
                  employer_email: user.email
                })}
                disabled={!newPreference.staff_email || addPreferenceMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                {addPreferenceMutation.isPending ? 'Adding...' : 'Add Preference'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}