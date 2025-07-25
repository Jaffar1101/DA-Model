import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen,
  Settings,
  User,
  LogOut,
  Home
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserEntity } from "@/entities/User";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
    description: "Performance overview & insights",
    category: "main"
  },
  {
    title: "Student Management",
    url: createPageUrl("Students"),
    icon: Users,
    description: "Manage student profiles",
    category: "management"
  },
  {
    title: "Performance Tracking",
    url: createPageUrl("Performance"),
    icon: TrendingUp,
    description: "Track academic progress",
    category: "analytics"
  },
  {
    title: "Risk Assessment",
    url: createPageUrl("RiskAssessment"),
    icon: AlertTriangle,
    description: "Identify at-risk students",
    category: "analytics"
  },
  {
    title: "Student Portal",
    url: createPageUrl("StudentPortal"),
    icon: BookOpen,
    description: "Student self-tracking",
    category: "portal"
  }
];

// Group navigation items by category
const groupedNavigation = {
  main: navigationItems.filter(item => item.category === "main"),
  management: navigationItems.filter(item => item.category === "management"),
  analytics: navigationItems.filter(item => item.category === "analytics"),
  portal: navigationItems.filter(item => item.category === "portal")
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await UserEntity.logout();
    window.location.reload();
  };

  const isActivePage = (url) => location.pathname === url;

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --academic-primary: #1e293b;
          --academic-blue: #3b82f6;
          --academic-success: #10b981;
          --academic-warning: #f59e0b;
          --academic-danger: #ef4444;
          --academic-light: #f8fafc;
          --academic-muted: #64748b;
        }

        .nav-item-active {
          background: linear-gradient(135deg, var(--academic-primary), var(--academic-blue));
          color: white;
          transform: translateX(4px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
        }

        .nav-item {
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          border-radius: 12px;
          margin-bottom: 4px;
        }

        .nav-item:hover:not(.nav-item-active) {
          background: rgba(59, 130, 246, 0.08);
          transform: translateX(2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .nav-icon {
          transition: all 0.3s ease;
        }

        .nav-item-active .nav-icon {
          transform: scale(1.1);
        }

        .sidebar-group {
          margin-bottom: 24px;
        }

        .sidebar-group:last-child {
          margin-bottom: 0;
        }
      `}</style>
      
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--academic-light)' }}>
        <Sidebar className="border-r border-gray-200 bg-white shadow-lg">
          <SidebarHeader className="border-b border-gray-100 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--academic-primary), var(--academic-blue))' }}
              >
                AI
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{ color: 'var(--academic-primary)' }}>
                  AcademicAI
                </h2>
                <p className="text-xs font-medium" style={{ color: 'var(--academic-muted)' }}>
                  Performance Prediction Platform
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 space-y-6">
            {/* Main Navigation */}
            <SidebarGroup className="sidebar-group">
              <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider px-2 py-3 text-gray-500">
                🏠 Main
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupedNavigation.main.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.url} 
                          className={`nav-item p-4 flex items-center gap-4 ${
                            isActivePage(item.url) ? 'nav-item-active' : ''
                          }`}
                        >
                          <item.icon className={`w-5 h-5 nav-icon ${
                            isActivePage(item.url) ? 'text-white' : 'text-blue-500'
                          }`} />
                          <div className="flex flex-col items-start">
                            <span className={`font-semibold text-sm ${
                              isActivePage(item.url) ? 'text-white' : 'text-gray-800'
                            }`}>
                              {item.title}
                            </span>
                            <span className={`text-xs ${
                              isActivePage(item.url) ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Management */}
            <SidebarGroup className="sidebar-group">
              <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider px-2 py-3 text-gray-500">
                👥 Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupedNavigation.management.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.url} 
                          className={`nav-item p-4 flex items-center gap-4 ${
                            isActivePage(item.url) ? 'nav-item-active' : ''
                          }`}
                        >
                          <item.icon className={`w-5 h-5 nav-icon ${
                            isActivePage(item.url) ? 'text-white' : 'text-green-500'
                          }`} />
                          <div className="flex flex-col items-start">
                            <span className={`font-semibold text-sm ${
                              isActivePage(item.url) ? 'text-white' : 'text-gray-800'
                            }`}>
                              {item.title}
                            </span>
                            <span className={`text-xs ${
                              isActivePage(item.url) ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Analytics */}
            <SidebarGroup className="sidebar-group">
              <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider px-2 py-3 text-gray-500">
                📊 Analytics
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupedNavigation.analytics.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.url} 
                          className={`nav-item p-4 flex items-center gap-4 ${
                            isActivePage(item.url) ? 'nav-item-active' : ''
                          }`}
                        >
                          <item.icon className={`w-5 h-5 nav-icon ${
                            isActivePage(item.url) ? 'text-white' : 
                            item.icon === AlertTriangle ? 'text-red-500' : 'text-purple-500'
                          }`} />
                          <div className="flex flex-col items-start">
                            <span className={`font-semibold text-sm ${
                              isActivePage(item.url) ? 'text-white' : 'text-gray-800'
                            }`}>
                              {item.title}
                            </span>
                            <span className={`text-xs ${
                              isActivePage(item.url) ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Student Portal */}
            <SidebarGroup className="sidebar-group">
              <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider px-2 py-3 text-gray-500">
                🎓 Student Portal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupedNavigation.portal.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.url} 
                          className={`nav-item p-4 flex items-center gap-4 ${
                            isActivePage(item.url) ? 'nav-item-active' : ''
                          }`}
                        >
                          <item.icon className={`w-5 h-5 nav-icon ${
                            isActivePage(item.url) ? 'text-white' : 'text-orange-500'
                          }`} />
                          <div className="flex flex-col items-start">
                            <span className={`font-semibold text-sm ${
                              isActivePage(item.url) ? 'text-white' : 'text-gray-800'
                            }`}>
                              {item.title}
                            </span>
                            <span className={`text-xs ${
                              isActivePage(item.url) ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="ring-2 ring-blue-200">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                      {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--academic-primary)' }}>
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--academic-muted)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={async () => await UserEntity.login()}
                className="w-full shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--academic-primary), var(--academic-blue))' }}
              >
                Sign In
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold" style={{ color: 'var(--academic-primary)' }}>
                AcademicAI
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}