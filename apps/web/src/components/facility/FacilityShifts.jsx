import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign,
  Users,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FacilityShifts({ user, shifts, applications }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShift, setSelectedShift] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (shiftId) => {
      await base44.entities.Shift.update(shiftId, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['facility-shifts']);
      setShowDeleteDialog(false);
      setSelectedShift(null);
    }
  });

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shift.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getApplicationCount = (shiftId) => {
    return applications.filter(a => a.shift_id === shiftId).length;
  };

  const getPendingCount = (shiftId) => {
    return applications.filter(a => a.shift_id === shiftId && a.status === 'pending').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-3 flex-1 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search shifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link to={createPageUrl("PostShift")}>
          <Button className="bg-gradient-to-r from-blue-600 to-teal-600">
            <Plus className="w-4 h-4 mr-2" />
            Post New Shift
          </Button>
        </Link>
      </div>

      {/* Shifts Grid */}
      {filteredShifts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No shifts found</p>
            <Link to={createPageUrl("PostShift")}>
              <Button>Post Your First Shift</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredShifts.map((shift) => {
            const appCount = getApplicationCount(shift.id);
            const pendingCount = getPendingCount(shift.id);
            
            return (
              <Card key={shift.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900">{shift.title}</h3>
                            {shift.urgent && (
                              <Badge className="bg-red-100 text-red-700">Urgent</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-1">{shift.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(shift.shift_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {shift.start_time} - {shift.end_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${shift.hourly_rate}/hr
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {shift.positions_filled}/{shift.number_of_positions} filled
                        </span>
                        {shift.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {shift.city}, {shift.state}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{appCount}</p>
                        <p className="text-xs text-gray-500">Applications</p>
                      </div>
                      {pendingCount > 0 && (
                        <Badge className="bg-amber-100 text-amber-700">
                          {pendingCount} pending
                        </Badge>
                      )}
                      <Badge className={
                        shift.status === 'open' ? 'bg-green-100 text-green-700' :
                        shift.status === 'filled' ? 'bg-blue-100 text-blue-700' :
                        shift.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {shift.status}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Shift
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedShift(shift);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancel Shift
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel "{selectedShift?.title}"? This will notify all applicants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Keep Shift
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(selectedShift?.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Cancelling...' : 'Cancel Shift'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}