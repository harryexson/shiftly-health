import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  X, 
  Smile,
  MoreVertical,
  ArrowLeft,
  Users,
  Info
} from "lucide-react";
import MessageBubble from "./MessageBubble";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatWindow({ 
  conversation, 
  currentUser,
  onBack,
  onShowInfo
}) {
  const [messageText, setMessageText] = useState("");
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch messages for this conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => base44.entities.Message.filter({ 
      conversation_id: conversation.id 
    }, 'created_date'),
    enabled: !!conversation,
    refetchInterval: 3000, // Poll every 3 seconds for real-time feel
  });

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversation && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [conversation?.id, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(
      msg => msg.sender_email !== currentUser.email && 
            !msg.read_by?.includes(currentUser.email)
    );

    for (const message of unreadMessages) {
      await base44.entities.Message.update(message.id, {
        read_by: [...(message.read_by || []), currentUser.email]
      });
    }

    // Update conversation unread count
    const currentUnread = conversation.unread_count || {};
    await base44.entities.Conversation.update(conversation.id, {
      unread_count: {
        ...currentUnread,
        [currentUser.email]: 0
      }
    });

    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      // Create message
      const message = await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email,
        sender_role: currentUser.role || 'staff',
        message_text: messageData.text,
        message_type: 'text',
        attachments: messageData.attachments || [],
        read_by: [currentUser.email],
        reply_to_message_id: messageData.replyToId || null
      });

      // Update conversation with last message
      await base44.entities.Conversation.update(conversation.id, {
        last_message: messageData.text.substring(0, 100),
        last_message_at: new Date().toISOString(),
        last_message_by: currentUser.email,
        unread_count: conversation.participants.reduce((acc, email) => {
          if (email !== currentUser.email) {
            acc[email] = (conversation.unread_count?.[email] || 0) + 1;
          } else {
            acc[email] = 0;
          }
          return acc;
        }, {})
      });

      // Send notifications to other participants
      const otherParticipants = conversation.participants.filter(
        email => email !== currentUser.email
      );

      for (const recipientEmail of otherParticipants) {
        // Check notification preferences
        const prefs = await base44.entities.NotificationPreferences.filter({
          user_email: recipientEmail
        });

        const shouldNotify = prefs.length === 0 || 
          prefs[0].push_notifications?.enabled !== false;

        if (shouldNotify) {
          await base44.entities.Notification.create({
            user_email: recipientEmail,
            type: 'system_alert',
            title: `New message from ${currentUser.full_name || currentUser.email}`,
            message: messageData.text.substring(0, 100) + (messageData.text.length > 100 ? '...' : ''),
            priority: 'medium',
            action_url: '/messages',
            related_id: conversation.id,
            status: 'unread'
          });
        }
      }

      return message;
    },
    onSuccess: () => {
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText("");
      setReplyToMessage(null);
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendMessageMutation.mutate({
      text: messageText,
      replyToId: replyToMessage?.id
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      sendMessageMutation.mutate({
        text: messageText || `Sent ${file.name}`,
        attachments: [{
          file_name: file.name,
          file_url: file_url,
          file_type: file.type
        }]
      });
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div>
              <h2 className="font-bold text-gray-900">{conversation.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {conversation.participants?.length} participants
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onShowInfo}>
                <Info className="w-4 h-4 mr-2" />
                Conversation Info
              </DropdownMenuItem>
              <DropdownMenuItem>
                <X className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-br from-gray-50 to-blue-50/30">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserEmail={currentUser.email}
            onReply={setReplyToMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-600">Replying to </span>
              <span className="font-semibold text-gray-900">
                {replyToMessage.sender_name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyToMessage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <label>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isUploading}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <Paperclip className={`w-5 h-5 ${isUploading ? 'animate-spin' : ''}`} />
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            <Button
              type="submit"
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}