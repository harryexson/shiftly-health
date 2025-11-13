import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Bell, 
  UserCircle,
  LogOut,
  Calendar,
  DollarSign,
  Settings,
  Shield,
  Building2,
  ClipboardList,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Globe,
  Zap,
  MessageSquare
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useQuery } from '@tanstack/react-query';

const roleNavigationMap = {
  staff: [
    { title: "Dashboard", url: createPageUrl("StaffDashboard"), icon: LayoutDashboard },
    { title: "Global Marketplace", url: createPageUrl("GlobalMarketplace"), icon: Globe },
    { title: "My Applications", url: createPageUrl("MyApplications"), icon: ClipboardList },
    { title: "Messages", url: createPageUrl("Messages"), icon: MessageSquare, showUnread: true },
    { title: "Instant Pay", url: createPageUrl("InstantPay"), icon: Zap },
    { title: "Earnings History", url: createPageUrl("EarningsHistory"), icon: TrendingUp },
    { title: "My Profile", url: createPageUrl("StaffProfile"), icon: UserCircle },
  ],
  employer: [
    { title: "Dashboard", url: createPageUrl("EmployerDashboard"), icon: LayoutDashboard },
    { title: "Post Shift", url: createPageUrl("PostShift"), icon: Calendar },
    { title: "My Shifts", url: createPageUrl("ManageShifts"), icon: Briefcase },
    { title: "Messages", url: createPageUrl("Messages"), icon: MessageSquare, showUnread: true },
    { title: "Analytics", url: createPageUrl("AnalyticsDashboard"), icon: TrendingUp },
    { title: "Team Management", url: createPageUrl("FacilityAdmin"), icon: Users },
    { title: "My Profile", url: createPageUrl("EmployerProfile"), icon: Building2 },
  ],
  admin: [
    { title: "Dashboard", url: createPageUrl("AdminDashboard"), icon: Shield },
    { title: "User Approvals", url: createPageUrl("UserApprovals"), icon: UserCheck },
    { title: "Credential Verification", url: createPageUrl("CredentialVerification"), icon: Shield },
    { title: "Messages", url: createPageUrl("Messages"), icon: MessageSquare, showUnread: true },
    { title: "Account Management", url: createPageUrl("AccountManagement"), icon: Users },
    { title: "Payment Management", url: createPageUrl("PaymentManagement"), icon: DollarSign },
    { title: "Payroll Management", url: createPageUrl("PayrollManagement"), icon: TrendingUp },
    { title: "Violations", url: createPageUrl("Violations"), icon: AlertTriangle },
    { title: "Billing Center", url: createPageUrl("BillingCenter"), icon: TrendingUp },
    { title: "System Settings", url: createPageUrl("SystemSettings"), icon: Settings },
  ]
};

const PUBLIC_PAGES = ['Home', 'Welcome'];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const isPublicPage = PUBLIC_PAGES.includes(currentPageName);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        if (isPublicPage) {
          try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
          } catch (error) {
            setUser(null);
          }
          setIsLoading(false);
          return;
        }

        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load user:", error);
        setIsLoading(false);
      }
    };
    loadUser();
  }, [currentPageName, isPublicPage]);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications-count', user?.email],
    queryFn: async () => {
      if (!user?.email) return 0;
      const notifications = await base44.entities.Notification.filter({
        user_email: user.email,
        status: "unread"
      });
      return notifications.length;
    },
    enabled: !!user && !isPublicPage,
    refetchInterval: 30000,
  });

  // Fetch unread message count
  const { data: unreadMessageCount = 0 } = useQuery({
    queryKey: ['unread-messages-count', user?.email],
    queryFn: async () => {
      if (!user?.email) return 0;
      const conversations = await base44.entities.Conversation.filter({});
      const userConversations = conversations.filter(conv => 
        conv.participants?.includes(user.email)
      );
      return userConversations.reduce((sum, conv) => {
        return sum + (conv.unread_count?.[user.email] || 0);
      }, 0);
    },
    enabled: !!user && !isPublicPage,
    refetchInterval: 5000, // Poll every 5 seconds for messages
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="animate-pulse text-blue-600 text-xl font-medium">Loading HealthStaff Connect...</div>
      </div>
    );
  }

  if (isPublicPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">Please log in to continue</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const userRole = user.role || 'staff';
  const navigationItems = roleNavigationMap[userRole] || roleNavigationMap.staff;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30">
        <Sidebar className="border-r border-blue-100/50 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-blue-100/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">HealthStaff Connect</h2>
                <p className="text-xs text-gray-500 capitalize">{userRole} Portal</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:text-white shadow-md' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium flex-1">{item.title}</span>
                          {item.showUnread && unreadMessageCount > 0 && (
                            <Badge className="bg-red-500 text-white h-5 min-w-5 flex items-center justify-center px-1.5">
                              {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <div className="px-4 py-3">
                      <NotificationCenter user={user} unreadCount={unreadCount} />
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-blue-100/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-sm">
                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{user.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100/50 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                HealthStaff Connect
              </h1>
              {unreadMessageCount > 0 && (
                <Badge className="bg-red-500 text-white ml-auto">
                  {unreadMessageCount}
                </Badge>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}