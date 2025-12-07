import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply, ChevronDown, ChevronUp, CheckCheck } from "lucide-react";
import { format } from "date-fns";

export default function MessageThread({ message, replies, currentUserEmail, onReply }) {
  const [expanded, setExpanded] = React.useState(false);
  const isOwn = message.sender_email === currentUserEmail;

  const getReadReceiptInfo = (msg) => {
    if (!msg.read_receipts) return null;
    const readers = Object.keys(msg.read_receipts).filter(email => email !== currentUserEmail);
    return readers.length > 0 ? readers : null;
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
        {message.sender_name?.charAt(0) || 'U'}
      </div>
      
      <div className={`flex-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col max-w-[70%]`}>
        <Card className={`w-full ${isOwn ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900 text-sm">{message.sender_name}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(message.timestamp || message.created_date), 'HH:mm')}
              </p>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{message.message_text}</p>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {isOwn && getReadReceiptInfo(message) && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <CheckCheck className="w-4 h-4" />
                    <span>Read by {getReadReceiptInfo(message).length}</span>
                  </div>
                )}
                {message.reply_count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(message)}
                className="h-7 text-xs"
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
            </div>
          </CardContent>
        </Card>

        {replies.length > 0 && (
          <div className="mt-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 text-xs text-gray-600"
            >
              {expanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              {expanded ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </Button>
            
            {expanded && (
              <div className="ml-8 mt-2 space-y-2">
                {replies.map((reply) => {
                  const isOwnReply = reply.sender_email === currentUserEmail;
                  return (
                    <Card key={reply.id} className={`${isOwnReply ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{reply.sender_name}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(reply.timestamp || reply.created_date), 'HH:mm')}
                          </p>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.message_text}</p>
                        {isOwnReply && getReadReceiptInfo(reply) && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 mt-2">
                            <CheckCheck className="w-3 h-3" />
                            <span>Read</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}