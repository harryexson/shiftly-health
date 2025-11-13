import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Briefcase, Building2 } from "lucide-react";

export default function ConversationList({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation,
  currentUserEmail 
}) {
  const getConversationIcon = (conversation) => {
    switch (conversation.conversation_type) {
      case 'direct':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'shift':
        return <Briefcase className="w-5 h-5 text-teal-500" />;
      case 'facility_announcement':
        return <Building2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getOtherParticipantName = (conversation) => {
    // For direct messages, show the other person's name
    if (conversation.conversation_type === 'direct') {
      const otherEmail = conversation.participants?.find(p => p !== currentUserEmail);
      return otherEmail || 'Unknown';
    }
    return conversation.title || 'Conversation';
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const getUnreadCount = (conversation) => {
    return conversation.unread_count?.[currentUserEmail] || 0;
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedConversationId;
        const unreadCount = getUnreadCount(conversation);
        const hasUnread = unreadCount > 0;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
              isSelected
                ? 'bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200'
                : hasUnread
                  ? 'bg-blue-50/50 hover:bg-blue-50 border border-blue-100'
                  : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                isSelected ? 'bg-white' : 'bg-white/80'
              }`}>
                {getConversationIcon(conversation)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`font-semibold text-sm truncate ${
                    hasUnread ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {getOtherParticipantName(conversation)}
                  </h3>
                  
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {conversation.last_message_at && (
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(conversation.last_message_at)}
                      </span>
                    )}
                    {hasUnread && (
                      <Badge className="bg-blue-600 text-white h-5 min-w-5 flex items-center justify-center px-1.5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {conversation.conversation_type === 'shift' && (
                  <Badge variant="outline" className="text-xs mb-1">
                    Shift Discussion
                  </Badge>
                )}

                {conversation.last_message && (
                  <p className={`text-xs truncate ${
                    hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'
                  }`}>
                    {conversation.last_message_by === currentUserEmail && 'You: '}
                    {conversation.last_message}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}