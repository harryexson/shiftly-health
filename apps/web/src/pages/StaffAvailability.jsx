import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Calendar,
  Plus,
  Check,
  X,
  Star,
  Clock,
  Trash2
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

export default function StaffAvailability() {
  const [user, setUser] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [formData, setFormData] = useState({
    availability_type: "available",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    recurring: false,
    days_of_week: [],
    reason: "",
    all_day: true
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: availabilities = [] } = useQuery({
    queryKey: ['staff-availability', user?.email],
    queryFn: () => base44.entities.StaffAvailability.filter({ 
      staff_email: user.email 
    }, '-created_date'),
    enabled: !!user,
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.StaffAvailability.create({
        ...data,
        staff_email: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
      setShowAddDialog(false);
      resetForm();
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.StaffAvailability.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAvailabilityMutation.mutate(formData);
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const resetForm = () => {
    setFormData({
      availability_type: "available",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      recurring: false,
      days_of_week: [],
      reason: "",
      all_day: true
    });
  };

  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAvailabilityForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'EEEE').toLowerCase();

    return availabilities.filter(avail => {
      if (avail.recurring && avail.days_of_week?.includes(dayName)) {
        return true;
      }
      
      const startDate = new Date(avail.start_date);
      const endDate = avail.end_date ? new Date(avail.end_date) : startDate;
      const checkDate = new Date(dateStr);
      
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Calendar className="w-7 h-7 text-blue-600" />
                  My Availability
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Manage your availability to get matched with the right shifts
                </p>
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Availability
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Week View */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentWeek(addDays(currentWeek, -7))}>
                ←
              </Button>
              <h3 className="font-bold">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </h3>
              <Button variant="outline" onClick={() => setCurrentWeek(addDays(currentWeek, 7))}>
                →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayAvails = getAvailabilityForDate(day);
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                return (
                  <div
                    key={day.toString()}
                    className={`p-3 rounded-lg border-2 min-h-32 ${
                      isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="text-center mb-2">
                      <div className="text-xs text-gray-600 font-semibold">
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {dayAvails.map((avail) => (
                        <div
                          key={avail.id}
                          className={`text-xs p-1.5 rounded ${
                            avail.availability_type === 'available' 
                              ? 'bg-green-100 text-green-700'
                              : avail.availability_type === 'preferred'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {avail.availability_type === 'available' && <Check className="w-3 h-3" />}
                            {avail.availability_type === 'preferred' && <Star className="w-3 h-3" />}
                            {avail.availability_type === 'unavailable' && <X className="w-3 h-3" />}
                            <span className="font-semibold capitalize">
                              {avail.availability_type}
                            </span>
                          </div>
                          {!avail.all_day && avail.start_time && (
                            <div className="text-xs opacity-75 mt-0.5">
                              {avail.start_time} - {avail.end_time}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* All Availability List */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <CardTitle>All Availability Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {availabilities.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No availability set yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availabilities.map((avail) => (
                  <div
                    key={avail.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={
                          avail.availability_type === 'available' 
                            ? 'bg-green-500'
                            : avail.availability_type === 'preferred'
                              ? 'bg-purple-500'
                              : 'bg-red-500'
                        }>
                          {avail.availability_type}
                        </Badge>
                        {avail.recurring && (
                          <Badge variant="outline">Recurring</Badge>
                        )}
                      </div>

                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Dates:</strong> {format(new Date(avail.start_date), 'MMM d, yyyy')}
                          {avail.end_date && ` - ${format(new Date(avail.end_date), 'MMM d, yyyy')}`}
                        </div>
                        
                        {avail.recurring && avail.days_of_week && (
                          <div>
                            <strong>Days:</strong> {avail.days_of_week.join(', ')}
                          </div>
                        )}
                        
                        {!avail.all_day && (
                          <div>
                            <strong>Time:</strong> {avail.start_time} - {avail.end_time}
                          </div>
                        )}
                        
                        {avail.reason && (
                          <div className="text-gray-600">
                            <strong>Reason:</strong> {avail.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAvailabilityMutation.mutate(avail.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Availability Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
            <DialogDescription>
              Set your availability for shifts
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Availability Type *</Label>
              <Select
                value={formData.availability_type}
                onValueChange={(value) => setFormData({...formData, availability_type: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="preferred">Preferred (Priority)</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>All Day</Label>
                <p className="text-xs text-gray-600">Available the entire day</p>
              </div>
              <Switch
                checked={formData.all_day}
                onCheckedChange={(checked) => setFormData({...formData, all_day: checked})}
              />
            </div>

            {!formData.all_day && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Recurring</Label>
                <p className="text-xs text-gray-600">Repeat weekly</p>
              </div>
              <Switch
                checked={formData.recurring}
                onCheckedChange={(checked) => setFormData({...formData, recurring: checked})}
              />
            </div>

            {formData.recurring && (
              <div>
                <Label>Days of Week</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <Badge
                      key={day}
                      variant={formData.days_of_week.includes(day) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleDay(day)}
                    >
                      {day.substring(0, 3)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.availability_type === 'unavailable' && (
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="e.g., Vacation, Personal appointment..."
                  rows={2}
                  className="mt-2"
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAvailabilityMutation.isPending}>
                {createAvailabilityMutation.isPending ? 'Adding...' : 'Add Availability'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}