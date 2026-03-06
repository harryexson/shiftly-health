import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Send, Loader2 } from "lucide-react";

export default function GroupMessageModal({ user, open, onClose }) {
  const [messageText, setMessageText] = useState("");
  const [targetType, setTargetType] = useState("shift"); // shift or facility
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const queryClient = useQueryClient();

  const { data: shifts = [] } = useQuery({
    queryKey: ['employer-shifts', user?.email],
    queryFn: () => base44.entities.Shift.filter({ employer_email: user?.email }),
    enabled: !!user && open
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['shift-applications', selectedShiftId],
    queryFn: () => base44.entities.ShiftApplication.filter({ 
      shift_id: selectedShiftId,
      status: 'accepted'
    }),
    enabled: !!selectedShiftId && targetType === 'shift'
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ['facility-applications', user?.email],
    queryFn: async () => {
      const facilityShifts = await base44.entities.Shift.filter({ employer_email: user?.email });
      const shiftIds = facilityShifts.map(s => s.id);
      const apps = await Promise.all(
        shiftIds.map(id => base44.entities.ShiftApplication.filter({ shift_id: id, status: 'accepted' }))
      );
      return apps.flat();
    },
    enabled: !!user && targetType === 'facility' && open
  });

  const sendGroupMessageMutation = useMutation({
    mutationFn: async () => {
      const recipients = targetType === 'shift' 
        ? applications.map(a => a.staff_email)
        : [...new Set(allApplications.map(a => a.staff_email))];

      if (recipients.length === 0) {
        throw new Error("No recipients found");
      }

      // Create or get conversation
      const existingConversations = await base44.entities.Conversation.filter({
        facility_email: user.email,
        conversation_type: targetType === 'shift' ? 'shift' : 'facility_wide',
        ...(targetType === 'shift' && { shift_id: selectedShiftId })
      });

      let conversationId;
      if (existingConversations.length > 0) {
        conversationId = existingConversations[0].id;
        await base44.entities.Conversation.update(conversationId, {
          participants: [...new Set([user.email, ...recipients])],
          last_message: messageText,
          last_message_time: new Date().toISOString()
        });
      } else {
        const shift = shifts.find(s => s.id === selectedShiftId);
        const conversation = await base44.entities.Conversation.create({
          conversation_type: targetType === 'shift' ? 'shift' : 'facility_wide',
          participants: [user.email, ...recipients],
          facility_email: user.email,
          shift_id: targetType === 'shift' ? selectedShiftId : null,
          title: targetType === 'shift' 
            ? `Shift: ${shift?.title}` 
            : 'Facility-Wide Announcement',
          last_message: messageText,
          last_message_time: new Date().toISOString(),
          is_active: true
        });
        conversationId = conversation.id;
      }

      // Send message
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        message_text: messageText,
        message_type: 'announcement',
        timestamp: new Date().toISOString(),
        read_by: [user.email],
        read_receipts: { [user.email]: new Date().toISOString() }
      });

      // Notify all recipients
      await Promise.all(recipients.map(async (recipientEmail) => {
        await base44.entities.Notification.create({
          user_email: recipientEmail,
          type: 'system_alert',
          title: 'Group Message from Facility',
          message: `${user.full_name || user.email}: ${messageText.substring(0, 50)}...`,
          priority: 'high',
          action_url: '/Messages',
          status: 'unread'
        });

        await base44.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: `Group message from ${user.full_name || user.email}`,
          body: `
            <h3>Group Message</h3>
            <p><strong>From:</strong> ${user.full_name || user.email}</p>
            <p><strong>Message:</strong> ${messageText}</p>
            <p><a href="${window.location.origin}/Messages">View in app</a></p>
          `
        });
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      setMessageText("");
      setSelectedShiftId("");
      onClose();
    }
  });

  const recipientCount = targetType === 'shift' 
    ? applications.length 
    : new Set(allApplications.map(a => a.staff_email)).size;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Send Group Message
          </DialogTitle>
          <DialogDescription>
            Send a message to multiple staff members at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Recipients</Label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shift">Staff assigned to a specific shift</SelectItem>
                <SelectItem value="facility">All staff who've worked at my facility</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType === 'shift' && (
            <div>
              <Label>Select Shift</Label>
              <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a shift..." />
                </SelectTrigger>
                <SelectContent>
                  {shifts.filter(s => s.status === 'open' || s.status === 'filled').map(shift => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.title} - {new Date(shift.shift_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {recipientCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Recipients:</strong> {recipientCount} staff {recipientCount === 1 ? 'member' : 'members'}
              </p>
            </div>
          )}

          <div>
            <Label>Message</Label>
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message to the group..."
              rows={6}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => sendGroupMessageMutation.mutate()}
            disabled={!messageText.trim() || (targetType === 'shift' && !selectedShiftId) || sendGroupMessageMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-teal-600"
          >
            {sendGroupMessageMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {recipientCount} {recipientCount === 1 ? 'person' : 'people'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}