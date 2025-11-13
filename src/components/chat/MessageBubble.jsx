import React from "react";
import { format } from "date-fns";
import { Check, CheckCheck, Paperclip, Reply, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MessageBubble({ message, currentUserEmail, onReply }) {
  const isOwnMessage = message.sender_email === currentUserEmail;
  const isRead = message.read_by?.includes(currentUserEmail);
  const isSystem = message.message_type === 'system' || message.message_type === 'shift_update';
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-md">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>{message.message_text}</span>
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">
            {format(new Date(message.created_date), 'MMM d, h:mm a')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-semibold">
                {message.sender_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-700">{message.sender_name}</span>
            <Badge className="text-xs" variant="outline">
              {message.sender_role}
            </Badge>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isOwnMessage
              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          {message.reply_to_message_id && (
            <div className={`text-xs mb-2 pb-2 border-l-2 pl-2 ${
              isOwnMessage ? 'border-white/40' : 'border-gray-300'
            }`}>
              <span className={isOwnMessage ? 'text-white/70' : 'text-gray-500'}>
                Replying to a message
              </span>
            </div>
          )}
          
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.message_text}
          </p>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment, idx) => (
                <a
                  key={idx}
                  href={attachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-xs p-2 rounded ${
                    isOwnMessage
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Paperclip className="w-3 h-3" />
                  <span className="truncate">{attachment.file_name}</span>
                </a>
              ))}
            </div>
          )}
          
          <div className={`flex items-center justify-between mt-2 ${
            isOwnMessage ? 'text-white/70' : 'text-gray-500'
          }`}>
            <span className="text-xs">
              {format(new Date(message.created_date), 'h:mm a')}
              {message.is_edited && ' (edited)'}
            </span>
            
            <div className="flex items-center gap-1">
              {isOwnMessage && (
                <>
                  {message.read_by && message.read_by.length > 1 ? (
                    <CheckCheck className="w-4 h-4 text-teal-300" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </>
              )}
              
              {!isOwnMessage && onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 hover:bg-gray-100"
                  onClick={() => onReply(message)}
                >
                  <Reply className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}