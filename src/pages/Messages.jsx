import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Users,
  Briefcase,
  Building2,
  Send
} from "lucide-react";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [conversationType, setConversationType] = useState("all");
  const [showMobileChat, setShowMobileChat] = useState(false);

  // New conversation form
  const [newConvType, setNewConvType] = useState("direct");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [conversationTitle, setConversationTitle] = useState("");

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch conversations
  const { data: allConversations = [] } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const convs = await base44.entities.Conversation.filter({}, '-last_message_at');
      // Filter to only show conversations where user is a participant
      return convs.filter(conv => conv.participants?.includes(user.email));
    },
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Fetch potential recipients
  const { data: potentialRecipients = [] } = useQuery({
    queryKey: ['potential-recipients', user?.email],
    queryFn: async () => {
      if (user.role === 'staff') {
        // Staff can message employers they've applied to
        const applications = await base44.entities.ShiftApplication.filter({
          staff_email: user.email
        });
        const employerEmails = [...new Set(applications.map(app => app.employer_email))];
        const profiles = await base44.entities.EmployerProfile.list();
        return profiles.filter(p => employerEmails.includes(p.user_email));
      } else if (user.role === 'employer') {
        // Employers can message staff who applied to their shifts
        const applications = await base44.entities.ShiftApplication.filter({
          employer_email: user.email
        });
        const staffEmails = [...new Set(applications.map(app => app.staff_email))];
        const profiles = await base44.entities.StaffProfile.list();
        return profiles.filter(p => staffEmails.includes(p.user_email));
      }
      return [];
    },
    enabled: !!user && showNewConversation,
  });

  // Fetch shifts for shift conversations
  const { data: userShifts = [] } = useQuery({
    queryKey: ['user-shifts', user?.email],
    queryFn: async () => {
      if (user.role === 'staff') {
        const applications = await base44.entities.ShiftApplication.filter({
          staff_email: user.email,
          status: 'accepted'
        });
        const shiftIds = applications.map(app => app.shift_id);
        const shifts = await base44.entities.Shift.list();
        return shifts.filter(s => shiftIds.includes(s.id));
      } else if (user.role === 'employer') {
        return await base44.entities.Shift.filter({
          employer_email: user.email
        });
      }
      return [];
    },
    enabled: !!user && showNewConversation && newConvType === 'shift',
  });

  const createConversationMutation = useMutation({
    mutationFn: async (conversationData) => {
      // Check if conversation already exists
      const existingConv = allConversations.find(conv => 
        conv.conversation_type === conversationData.conversation_type &&
        (conversationData.shift_id ? conv.shift_id === conversationData.shift_id : true) &&
        conv.participants?.every(p => conversationData.participants.includes(p)) &&
        conversationData.participants.every(p => conv.participants?.includes(p))
      );

      if (existingConv) {
        return existingConv;
      }

      // Create new conversation
      const conversation = await base44.entities.Conversation.create({
        ...conversationData,
        unread_count: conversationData.participants.reduce((acc, email) => {
          acc[email] = 0;
          return acc;
        }, {})
      });

      // Send system message for shift conversations
      if (conversationData.conversation_type === 'shift') {
        await base44.entities.Message.create({
          conversation_id: conversation.id,
          sender_email: 'system@healthstaffconnect.com',
          sender_name: 'System',
          sender_role: 'admin',
          message_text: `Conversation started for shift: ${conversationData.title}`,
          message_type: 'system',
          read_by: conversationData.participants
        });
      }

      return conversation;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(conversation);
      setShowNewConversation(false);
      setShowMobileChat(true);
      resetNewConvForm();
    },
  });

  const resetNewConvForm = () => {
    setNewConvType("direct");
    setSelectedRecipient("");
    setSelectedShift("");
    setConversationTitle("");
  };

  const handleCreateConversation = () => {
    if (newConvType === 'direct' && selectedRecipient) {
      const recipient = potentialRecipients.find(p => p.user_email === selectedRecipient);
      createConversationMutation.mutate({
        conversation_type: 'direct',
        participants: [user.email, selectedRecipient],
        title: recipient?.full_name || recipient?.facility_name || selectedRecipient
      });
    } else if (newConvType === 'shift' && selectedShift) {
      const shift = userShifts.find(s => s.id === selectedShift);
      // Get all participants for this shift
      const participants = [user.email];
      if (user.role === 'staff') {
        participants.push(shift.employer_email);
      } else if (user.role === 'employer') {
        // Get staff who are assigned to this shift
        base44.entities.ShiftApplication.filter({
          shift_id: selectedShift,
          status: 'accepted'
        }).then(apps => {
          const staffEmails = apps.map(app => app.staff_email);
          createConversationMutation.mutate({
            conversation_type: 'shift',
            shift_id: selectedShift,
            participants: [...new Set([...participants, ...staffEmails])],
            title: `Shift: ${shift.title}`
          });
        });
        return;
      }
      createConversationMutation.mutate({
        conversation_type: 'shift',
        shift_id: selectedShift,
        participants,
        title: `Shift: ${shift.title}`
      });
    } else if (newConvType === 'facility_announcement' && conversationTitle) {
      // Get all staff who have worked with this facility
      base44.entities.ShiftApplication.filter({
        employer_email: user.email,
        status: 'accepted'
      }).then(apps => {
        const staffEmails = [...new Set(apps.map(app => app.staff_email))];
        createConversationMutation.mutate({
          conversation_type: 'facility_announcement',
          facility_email: user.email,
          participants: [user.email, ...staffEmails],
          title: conversationTitle
        });
      });
    }
  };

  // Filter conversations
  const filteredConversations = allConversations.filter(conv => {
    // Filter by type
    if (conversationType !== 'all' && conv.conversation_type !== conversationType) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        conv.title?.toLowerCase().includes(search) ||
        conv.last_message?.toLowerCase().includes(search) ||
        conv.participants?.some(p => p.toLowerCase().includes(search))
      );
    }

    return true;
  });

  // Calculate total unread count
  const totalUnreadCount = allConversations.reduce((sum, conv) => {
    return sum + (conv.unread_count?.[user?.email] || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="border-purple-100/50 h-[calc(100vh-8rem)]">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <div>
                  <CardTitle className="text-2xl">Messages</CardTitle>
                  {totalUnreadCount > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowNewConversation(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Message
              </Button>
            </div>
          </CardHeader>

          <div className="grid md:grid-cols-3 h-[calc(100%-5rem)]">
            {/* Conversations List */}
            <div className={`border-r border-gray-200 flex flex-col ${
              showMobileChat ? 'hidden md:block' : ''
            }`}>
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs value={conversationType} onValueChange={setConversationType}>
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="direct" className="text-xs">Direct</TabsTrigger>
                    <TabsTrigger value="shift" className="text-xs">Shifts</TabsTrigger>
                    <TabsTrigger value="facility_announcement" className="text-xs">
                      Announcements
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                <ConversationList
                  conversations={filteredConversations}
                  selectedConversationId={selectedConversation?.id}
                  onSelectConversation={(conv) => {
                    setSelectedConversation(conv);
                    setShowMobileChat(true);
                  }}
                  currentUserEmail={user?.email}
                />
              </div>
            </div>

            {/* Chat Window */}
            <div className={`md:col-span-2 ${
              !showMobileChat ? 'hidden md:block' : ''
            }`}>
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  currentUser={user}
                  onBack={() => setShowMobileChat(false)}
                  onShowInfo={() => {}}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Select a conversation
                  </p>
                  <p className="text-sm">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Create a new direct message, shift discussion, or facility announcement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Conversation Type</Label>
              <Select value={newConvType} onValueChange={setNewConvType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Direct Message
                    </div>
                  </SelectItem>
                  <SelectItem value="shift">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Shift Discussion
                    </div>
                  </SelectItem>
                  {user?.role === 'employer' && (
                    <SelectItem value="facility_announcement">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Facility Announcement
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {newConvType === 'direct' && (
              <div>
                <Label>Select Recipient</Label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a person..." />
                  </SelectTrigger>
                  <SelectContent>
                    {potentialRecipients.map((recipient) => (
                      <SelectItem key={recipient.user_email} value={recipient.user_email}>
                        {recipient.full_name || recipient.facility_name || recipient.user_email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newConvType === 'shift' && (
              <div>
                <Label>Select Shift</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a shift..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userShifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.title} - {new Date(shift.shift_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newConvType === 'facility_announcement' && (
              <div>
                <Label>Announcement Title</Label>
                <Input
                  value={conversationTitle}
                  onChange={(e) => setConversationTitle(e.target.value)}
                  placeholder="e.g., Important Facility Updates"
                  className="mt-2"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewConversation(false);
                resetNewConvForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={
                (newConvType === 'direct' && !selectedRecipient) ||
                (newConvType === 'shift' && !selectedShift) ||
                (newConvType === 'facility_announcement' && !conversationTitle) ||
                createConversationMutation.isPending
              }
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Start Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}