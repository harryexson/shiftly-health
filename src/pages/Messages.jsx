import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Users,
  Briefcase,
  Building2,
  Search,
  Paperclip,
  X
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch conversations
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const allConvos = await base44.entities.Conversation.filter({
        participants: { $contains: user.email }
      }, '-last_message_time');
      return allConvos;
    },
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds for real-time feel
  });

  // Fetch messages for selected conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => base44.entities.Message.filter({
      conversation_id: selectedConversation.id
    }, 'created_date'),
    enabled: !!selectedConversation,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, text }) => {
      const message = await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        message_text: text,
        message_type: 'text',
        read_by: [user.email],
        timestamp: new Date().toISOString()
      });

      // Update conversation
      await base44.entities.Conversation.update(conversationId, {
        last_message: text.substring(0, 100),
        last_message_time: new Date().toISOString()
      });

      // Send notifications to other participants
      const conversation = conversations.find(c => c.id === conversationId);
      const otherParticipants = conversation.participants.filter(p => p !== user.email);

      for (const participantEmail of otherParticipants) {
        await base44.integrations.Core.SendEmail({
          to: participantEmail,
          subject: `New message from ${user.full_name || user.email}`,
          body: `
            <h2>You have a new message</h2>
            <p><strong>From:</strong> ${user.full_name || user.email}</p>
            <p><strong>Message:</strong> ${text}</p>
            <p>Log in to HealthStaff Connect to reply.</p>
          `
        });

        await base44.entities.Notification.create({
          user_email: participantEmail,
          type: 'system_alert',
          title: 'New Message',
          message: `${user.full_name || user.email}: ${text.substring(0, 50)}...`,
          priority: 'medium',
          status: 'unread'
        });
      }

      return message;
    },
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      refetchConversations();
      scrollToBottom();
    },
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId) => {
      const unreadMessages = messages.filter(m => 
        !m.read_by?.includes(user.email) && m.sender_email !== user.email
      );

      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, {
          read_by: [...(msg.read_by || []), user.email]
        });
      }
    },
  });

  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      markAsReadMutation.mutate(selectedConversation.id);
    }
  }, [selectedConversation?.id, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      text: messageText.trim()
    });
  };

  const getConversationTitle = (convo) => {
    if (convo.title) return convo.title;
    
    if (convo.conversation_type === 'facility_wide') {
      return 'Facility Announcements';
    }

    const otherParticipants = convo.participants.filter(p => p !== user?.email);
    return otherParticipants.join(', ') || 'Conversation';
  };

  const getUnreadCount = (convo) => {
    return convo.unread_count?.[user?.email] || 0;
  };

  const filteredConversations = conversations.filter(convo => {
    const title = getConversationTitle(convo).toLowerCase();
    return title.includes(searchTerm.toLowerCase());
  });

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 flex flex-col">
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Conversations List */}
        <Card className="w-80 flex flex-col border-blue-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </CardTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((convo) => {
                    const unreadCount = getUnreadCount(convo);
                    const isSelected = selectedConversation?.id === convo.id;

                    return (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedConversation(convo)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-blue-100 border-blue-300' 
                            : 'hover:bg-gray-50 border-transparent'
                        } border`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {convo.conversation_type === 'facility_wide' ? (
                              <Building2 className="w-5 h-5 text-purple-600" />
                            ) : convo.shift_id ? (
                              <Briefcase className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Users className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm truncate">
                                {getConversationTitle(convo)}
                              </h4>
                              {unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white text-xs">
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {convo.last_message || 'No messages yet'}
                            </p>
                            {convo.last_message_time && (
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(convo.last_message_time), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 flex flex-col border-blue-100/50">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3">
                  {selectedConversation.conversation_type === 'facility_wide' ? (
                    <Building2 className="w-6 h-6 text-purple-600" />
                  ) : selectedConversation.shift_id ? (
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Users className="w-6 h-6 text-gray-600" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">
                      {getConversationTitle(selectedConversation)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.conversation_type === 'facility_wide' 
                        ? 'All facility staff can see these messages'
                        : `${selectedConversation.participants.length} participant(s)`}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-4">
                <ScrollArea className="h-full pr-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.sender_email === user.email;
                        const isSystem = msg.message_type === 'system' || msg.message_type === 'announcement';

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="flex justify-center">
                              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm max-w-md text-center">
                                {msg.message_text}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-2 max-w-lg ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className={isOwn ? 'bg-blue-100' : 'bg-gray-200'}>
                                  {msg.sender_name?.charAt(0) || msg.sender_email.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                <div
                                  className={`rounded-2xl px-4 py-2 ${
                                    isOwn
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  {!isOwn && (
                                    <p className="text-xs font-semibold mb-1 opacity-70">
                                      {msg.sender_name || msg.sender_email}
                                    </p>
                                  )}
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {msg.message_text}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 px-1">
                                  {format(new Date(msg.timestamp || msg.created_date), 'h:mm a')}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    rows={2}
                    className="flex-1 resize-none"
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}