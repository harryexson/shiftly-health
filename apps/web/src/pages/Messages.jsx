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
  X,
  Reply,
  CheckCheck
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageThread from "../components/messages/MessageThread";
import GroupMessageModal from "../components/messages/GroupMessageModal";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showGroupMessageModal, setShowGroupMessageModal] = useState(false);
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
      const threadId = replyingTo?.thread_id || replyingTo?.id;
      
      const message = await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        message_text: text,
        message_type: 'text',
        read_by: [user.email],
        read_receipts: { [user.email]: new Date().toISOString() },
        parent_message_id: replyingTo?.id || null,
        thread_id: threadId || null,
        timestamp: new Date().toISOString()
      });

      // Update reply count on parent message
      if (replyingTo) {
        await base44.entities.Message.update(replyingTo.id, {
          reply_count: (replyingTo.reply_count || 0) + 1
        });
      }

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
          subject: replyingTo ? `Reply from ${user.full_name || user.email}` : `New message from ${user.full_name || user.email}`,
          body: `
            <h2>${replyingTo ? 'Reply to your message' : 'You have a new message'}</h2>
            <p><strong>From:</strong> ${user.full_name || user.email}</p>
            ${replyingTo ? `<p><strong>In reply to:</strong> "${replyingTo.message_text.substring(0, 100)}..."</p>` : ''}
            <p><strong>Message:</strong> ${text}</p>
            <p>Log in to Shiftly Health to reply.</p>
          `
        });

        await base44.entities.Notification.create({
          user_email: participantEmail,
          type: 'system_alert',
          title: replyingTo ? 'Reply to Your Message' : 'New Message',
          message: `${user.full_name || user.email}: ${text.substring(0, 50)}...`,
          priority: 'high',
          status: 'unread'
        });
      }

      return message;
    },
    onSuccess: () => {
      setMessageText("");
      setReplyingTo(null);
      refetchMessages();
      refetchConversations();
      scrollToBottom();
    },
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId) => {
      const timestamp = new Date().toISOString();
      const unreadMessages = messages.filter(m => 
        !m.read_by?.includes(user.email) && m.sender_email !== user.email
      );

      for (const msg of unreadMessages) {
        const readReceipts = msg.read_receipts || {};
        await base44.entities.Message.update(msg.id, {
          read_by: [...(msg.read_by || []), user.email],
          read_receipts: { ...readReceipts, [user.email]: timestamp }
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

  const handleReply = (message) => {
    setReplyingTo(message);
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
      <div className="bg-white border-b border-blue-100/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-sm text-gray-600">Communicate with facilities and staff</p>
          </div>
          {user?.role !== 'staff' && (
            <Button
              onClick={() => setShowGroupMessageModal(true)}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              <Users className="w-4 h-4 mr-2" />
              Group Message
            </Button>
          )}
        </div>
      </div>

      <GroupMessageModal
        user={user}
        open={showGroupMessageModal}
        onClose={() => setShowGroupMessageModal(false)}
      />

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
                      {messages.filter(m => !m.parent_message_id).map((msg) => {
                        const isOwn = msg.sender_email === user.email;
                        const isSystem = msg.message_type === 'system' || msg.message_type === 'announcement';
                        const replies = messages.filter(m => m.parent_message_id === msg.id || m.thread_id === msg.id);
                        const readReceipts = msg.read_receipts ? Object.keys(msg.read_receipts).filter(e => e !== user.email) : [];

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="flex justify-center">
                              <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm max-w-md text-center border border-purple-200">
                                📢 {msg.message_text}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={msg.id}>
                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
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
                                  <div className="flex items-center gap-2 mt-1 px-1">
                                    <p className="text-xs text-gray-500">
                                      {format(new Date(msg.timestamp || msg.created_date), 'h:mm a')}
                                    </p>
                                    {isOwn && readReceipts.length > 0 && (
                                      <div className="flex items-center gap-1 text-xs text-blue-600">
                                        <CheckCheck className="w-3 h-3" />
                                        <span>Read</span>
                                      </div>
                                    )}
                                    {msg.reply_count > 0 && (
                                      <Badge variant="outline" className="text-xs h-5">
                                        {msg.reply_count} {msg.reply_count === 1 ? 'reply' : 'replies'}
                                      </Badge>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReply(msg)}
                                    className="h-6 text-xs mt-1 opacity-60 hover:opacity-100"
                                  >
                                    <Reply className="w-3 h-3 mr-1" />
                                    Reply
                                  </Button>
                                  
                                  {/* Thread Replies */}
                                  {replies.length > 0 && (
                                    <div className="mt-2 space-y-2 ml-4 border-l-2 border-gray-200 pl-3">
                                      {replies.map((reply) => {
                                        const isOwnReply = reply.sender_email === user.email;
                                        const replyReadReceipts = reply.read_receipts ? Object.keys(reply.read_receipts).filter(e => e !== user.email) : [];
                                        
                                        return (
                                          <div key={reply.id} className={`flex gap-2 ${isOwnReply ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <Avatar className="w-6 h-6 flex-shrink-0">
                                              <AvatarFallback className={isOwnReply ? 'bg-blue-100 text-xs' : 'bg-gray-200 text-xs'}>
                                                {reply.sender_name?.charAt(0) || 'U'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className={`flex flex-col ${isOwnReply ? 'items-end' : 'items-start'}`}>
                                              <div
                                                className={`rounded-xl px-3 py-2 text-sm ${
                                                  isOwnReply
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-50 text-gray-900 border border-gray-200'
                                                }`}
                                              >
                                                <p className="text-xs font-semibold mb-1 opacity-70">
                                                  {reply.sender_name}
                                                </p>
                                                <p className="whitespace-pre-wrap break-words">
                                                  {reply.message_text}
                                                </p>
                                              </div>
                                              <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-500">
                                                  {format(new Date(reply.timestamp || reply.created_date), 'h:mm a')}
                                                </p>
                                                {isOwnReply && replyReadReceipts.length > 0 && (
                                                  <CheckCheck className="w-3 h-3 text-blue-600" />
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
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
                {replyingTo && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-semibold mb-1">
                        <Reply className="w-3 h-3 inline mr-1" />
                        Replying to {replyingTo.sender_name}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">{replyingTo.message_text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
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