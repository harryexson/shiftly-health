import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCheck,
  Trash2,
  Briefcase,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const NOTIFICATION_ICONS = {
  shift_offer: Briefcase,
  application_update: CheckCircle,
  shift_reminder: Calendar,
  payment_due: DollarSign,
  verification_update: CheckCircle,
  system_alert: AlertTriangle,
  new_application: Briefcase,
  shift_cancellation: XCircle,
  urgent_shift: AlertTriangle,
};

const NOTIFICATION_COLORS = {
  urgent: "bg-red-100 border-red-300 text-red-900",
  high: "bg-orange-100 border-orange-300 text-orange-900",
  medium: "bg-blue-100 border-blue-300 text-blue-900",
  low: "bg-gray-100 border-gray-300 text-gray-900",
};

export default function NotificationCenter({ user }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Poll for new notifications every 10 seconds when the center is open
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ 
      user_email: user?.email 
    }, '-created_date', 50),
    enabled: !!user,
    refetchInterval: open ? 10000 : 30000, // 10s when open, 30s when closed
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await base44.entities.Notification.update(notificationId, {
        status: 'read'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifs = notifications.filter(n => n.status === 'unread');
      await Promise.all(
        unreadNotifs.map(n => 
          base44.entities.Notification.update(n.id, { status: 'read' })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await base44.entities.Notification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (notification.status === 'unread') {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate if action_url exists
    if (notification.action_url) {
      setOpen(false);
      navigate(notification.action_url);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.status === 'unread');

  const NotificationItem = ({ notification }) => {
    const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
    const colorClass = NOTIFICATION_COLORS[notification.priority] || NOTIFICATION_COLORS.medium;
    const isUnread = notification.status === 'unread';

    return (
      <div
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
          isUnread ? colorClass : 'bg-white border-gray-200'
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUnread ? 'bg-white/50' : 'bg-gray-100'
          }`}>
            <Icon className={`w-5 h-5 ${
              isUnread ? 'text-current' : 'text-gray-600'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={`font-semibold text-sm ${
                isUnread ? 'text-current' : 'text-gray-900'
              }`}>
                {notification.title}
              </h4>
              {isUnread && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
              )}
            </div>

            <p className={`text-sm mb-2 ${
              isUnread ? 'text-current/80' : 'text-gray-600'
            }`}>
              {notification.message}
            </p>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {format(new Date(notification.created_date), 'MMM d, h:mm a')}
                </span>
              </div>

              {notification.priority === 'urgent' && (
                <Badge className="bg-red-500 text-white text-xs">
                  Urgent
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotificationMutation.mutate(notification.id);
            }}
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("NotificationSettings"))}
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
          <SheetDescription>
            Stay updated with your latest activities
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                All
                <Badge variant="outline" className="ml-2">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <Badge variant="outline" className="ml-2 bg-blue-100">
                  {unreadCount}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex gap-2 mt-4">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-xs"
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Mark All Read
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <TabsContent value={activeTab} className="mt-4">
              <ScrollArea className="h-[calc(100vh-280px)]">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-4">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">
                      {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {activeTab === 'unread' 
                        ? "You're all caught up!" 
                        : "We'll notify you when something important happens"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}