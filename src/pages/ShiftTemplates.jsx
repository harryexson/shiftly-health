import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Clock,
  DollarSign,
  Repeat
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const QUALIFICATIONS = [
  "CPR", "First Aid", "Mental Health Training", "ISP Training",
  "Behavior Support", "Therap", "Drivers License", "Feeding Assistance",
  "Bathing", "Grooming", "Medical Transport"
];

export default function ShiftTemplates() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    template_name: "",
    title: "",
    description: "",
    staff_type_required: "licensed",
    required_qualifications: [],
    minimum_experience_years: 0,
    start_time: "",
    end_time: "",
    hourly_rate: "",
    number_of_positions: 1,
    special_requirements: ""
  });
  const [recurringData, setRecurringData] = useState({
    pattern_type: "weekly",
    days_of_week: [],
    start_date: "",
    end_date: ""
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: templates = [] } = useQuery({
    queryKey: ['shift-templates', user?.email],
    queryFn: () => base44.entities.ShiftTemplate.filter({ 
      employer_email: user.email,
      is_active: true 
    }, '-created_date'),
    enabled: !!user,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData) => {
      return await base44.entities.ShiftTemplate.create({
        ...templateData,
        employer_email: user.email,
        is_active: true,
        times_used: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      setShowCreateDialog(false);
      resetForm();
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId) => {
      return await base44.entities.ShiftTemplate.update(templateId, {
        is_active: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
    },
  });

  const createRecurringShiftMutation = useMutation({
    mutationFn: async ({ template, recurring }) => {
      // Create recurring shift pattern
      const recurringShift = await base44.entities.RecurringShift.create({
        employer_email: user.email,
        template_id: template.id,
        ...recurring,
        title: template.title,
        description: template.description,
        staff_type_required: template.staff_type_required,
        required_qualifications: template.required_qualifications,
        minimum_experience_years: template.minimum_experience_years,
        start_time: template.start_time,
        end_time: template.end_time,
        hourly_rate: template.hourly_rate,
        number_of_positions: template.number_of_positions,
        special_requirements: template.special_requirements,
        is_active: true
      });

      // Increment template usage
      await base44.entities.ShiftTemplate.update(template.id, {
        times_used: template.times_used + 1
      });

      return recurringShift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      setShowRecurringDialog(false);
      setSelectedTemplate(null);
      setRecurringData({
        pattern_type: "weekly",
        days_of_week: [],
        start_date: "",
        end_date: ""
      });
    },
  });

  const useTemplateMutation = useMutation({
    mutationFn: async (template) => {
      // Increment usage count
      await base44.entities.ShiftTemplate.update(template.id, {
        times_used: template.times_used + 1
      });
      
      // Navigate to post shift with pre-filled data
      navigate(createPageUrl("PostShift"), { 
        state: { templateData: template }
      });
    },
  });

  const handleCreateTemplate = (e) => {
    e.preventDefault();
    createTemplateMutation.mutate(formData);
  };

  const handleCreateRecurring = (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    createRecurringShiftMutation.mutate({
      template: selectedTemplate,
      recurring: recurringData
    });
  };

  const toggleQualification = (qual) => {
    setFormData(prev => ({
      ...prev,
      required_qualifications: prev.required_qualifications.includes(qual)
        ? prev.required_qualifications.filter(q => q !== qual)
        : [...prev.required_qualifications, qual]
    }));
  };

  const toggleDay = (day) => {
    setRecurringData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const resetForm = () => {
    setFormData({
      template_name: "",
      title: "",
      description: "",
      staff_type_required: "licensed",
      required_qualifications: [],
      minimum_experience_years: 0,
      start_time: "",
      end_time: "",
      hourly_rate: "",
      number_of_positions: 1,
      special_requirements: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <FileText className="w-7 h-7 text-blue-600" />
                  Shift Templates
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Create reusable templates for faster shift posting
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Templates Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create templates to quickly post recurring shifts
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="border-blue-100/50 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{template.template_name}</h3>
                      <p className="text-sm text-gray-600">{template.title}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Used {template.times_used}x
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span>{template.start_time} - {template.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold">${template.hourly_rate}/hr</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      {template.staff_type_required === 'licensed' ? 'Licensed' :
                       template.staff_type_required === 'unlicensed_dsp' ? 'DSP' : 'Caregiver'}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Button
                      onClick={() => useTemplateMutation.mutate(template)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowRecurringDialog(true);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Repeat className="w-4 h-4 mr-2" />
                      Create Recurring
                    </Button>
                    <Button
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                      variant="outline"
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Shift Template</DialogTitle>
            <DialogDescription>
              Save time by creating a reusable template for common shifts
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div>
              <Label htmlFor="template_name">Template Name *</Label>
              <Input
                id="template_name"
                value={formData.template_name}
                onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                placeholder="e.g., Weekend Night Shift RN"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="title">Shift Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Night Shift Nurse - ICU"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the shift..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Staff Type *</Label>
                <Select
                  value={formData.staff_type_required}
                  onValueChange={(value) => setFormData({...formData, staff_type_required: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="licensed">Licensed Professional</SelectItem>
                    <SelectItem value="unlicensed_dsp">DSP</SelectItem>
                    <SelectItem value="unlicensed_caregiver">Caregiver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="positions">Positions</Label>
                <Input
                  id="positions"
                  type="number"
                  min="1"
                  value={formData.number_of_positions}
                  onChange={(e) => setFormData({...formData, number_of_positions: parseInt(e.target.value)})}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Required Qualifications</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {QUALIFICATIONS.map((qual) => (
                  <Badge
                    key={qual}
                    variant={formData.required_qualifications.includes(qual) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleQualification(qual)}
                  >
                    {qual}
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTemplateMutation.isPending}>
                {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Recurring Shift Dialog */}
      <Dialog open={showRecurringDialog} onOpenChange={setShowRecurringDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Recurring Shifts</DialogTitle>
            <DialogDescription>
              Schedule shifts to automatically post based on a pattern
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRecurring} className="space-y-4">
            <div>
              <Label>Pattern Type *</Label>
              <Select
                value={recurringData.pattern_type}
                onValueChange={(value) => setRecurringData({...recurringData, pattern_type: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(recurringData.pattern_type === 'weekly' || recurringData.pattern_type === 'biweekly') && (
              <div>
                <Label>Days of Week *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <Badge
                      key={day}
                      variant={recurringData.days_of_week.includes(day) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleDay(day)}
                    >
                      {day.substring(0, 3)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={recurringData.start_date}
                  onChange={(e) => setRecurringData({...recurringData, start_date: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={recurringData.end_date}
                  onChange={(e) => setRecurringData({...recurringData, end_date: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Shifts will be automatically created based on this pattern. 
                You can manage individual shifts from the calendar view.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowRecurringDialog(false);
                setSelectedTemplate(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRecurringShiftMutation.isPending}>
                {createRecurringShiftMutation.isPending ? 'Creating...' : 'Create Recurring Shifts'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}