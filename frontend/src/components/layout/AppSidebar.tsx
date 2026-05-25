import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Map,
  School,
  ClipboardCheck,
  BarChart3,
  Users,
  FileText,
  Settings,
  Globe,
  MapPin,
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const mainNavItems = [
  {
    title: 'Command Center',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Geo-Intelligence',
    href: '/map',
    icon: Map,
  },
  {
    title: 'National Registry',
    href: '/schools',
    icon: School,
  },
  {
    title: 'Verification Queue',
    href: '/verification',
    icon: ClipboardCheck,
    badge: 5,
  },
];

const analyticsNavItems = [
  {
    title: 'Dynamic Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Strategic Reports',
    href: '/reports',
    icon: FileText,
  },
];

const adminNavItems = [
  {
    title: 'User Authority',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Audit Trail',
    href: '/audit',
    icon: History,
  },
  {
    title: 'System Config',
    href: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isAdmin = user?.role === 'admin';

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-white/5 bg-[#0A0F14] shadow-2xl">
      <SidebarHeader className="p-8 border-b border-white/5">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C4622D] shadow-[0_0_15px_rgba(196,98,45,0.3)] group-hover:scale-110 transition-transform">
            <Globe className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-black text-white tracking-tighter">
                SSEVMS
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-[#3D7A5C] animate-pulse" />
            </div>
            <span className="text-[9px] font-mono text-[#D4A847] uppercase font-black tracking-[0.2em] mt-1">
              National Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 scrollbar-none">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-[#8A9BAD]/40 uppercase tracking-[0.3em] font-black px-4 mb-4">
            Mission Control
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'h-12 px-4 rounded-xl transition-all duration-300 relative group',
                      isActive(item.href)
                        ? 'bg-[#C4622D]/10 text-white font-bold'
                        : 'text-[#8A9BAD] hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-4">
                      {isActive(item.href) && (
                        <div className="absolute left-0 w-1 h-6 bg-[#C4622D] rounded-r-full shadow-[0_0_10px_rgba(196,98,45,0.8)]" />
                      )}
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive(item.href) ? "text-[#C4622D]" : "group-hover:text-[#D4A847]"
                      )} />
                      <span className="flex-1 font-label text-sm tracking-wide lowercase italic group-hover:not-italic group-hover:uppercase group-hover:text-[10px] group-hover:font-black group-hover:tracking-widest transition-all">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-lg bg-[#C4622D] text-[9px] font-black text-white px-1.5 shadow-lg shadow-[#C4622D]/20">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-[10px] text-[#8A9BAD]/40 uppercase tracking-[0.3em] font-black px-4 mb-4">
            Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {analyticsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'h-12 px-4 rounded-xl transition-all duration-300 relative group',
                      isActive(item.href)
                        ? 'bg-[#C4622D]/10 text-white font-bold'
                        : 'text-[#8A9BAD] hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-4">
                      {isActive(item.href) && (
                        <div className="absolute left-0 w-1 h-6 bg-[#D4A847] rounded-r-full shadow-[0_0_10px_rgba(212,168,71,0.8)]" />
                      )}
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive(item.href) ? "text-[#D4A847]" : "group-hover:text-[#C4622D]"
                      )} />
                      <span className="font-label text-sm tracking-wide transition-all uppercase group-hover:tracking-widest text-[10px] font-black">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration — admin only */}
        {isAdmin && (
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-[10px] text-[#8A9BAD]/40 uppercase tracking-[0.3em] font-black px-4 mb-4">
            Governance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'h-12 px-4 rounded-xl transition-all duration-300 relative group',
                      isActive(item.href)
                        ? 'bg-[#C4622D]/10 text-white font-bold'
                        : 'text-[#8A9BAD] hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-4">
                      {isActive(item.href) && (
                        <div className="absolute left-0 w-1 h-6 bg-[#C4622D] rounded-r-full shadow-[0_0_10px_rgba(196,98,45,0.8)]" />
                      )}
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive(item.href) ? "text-[#C4622D]" : "group-hover:text-[#D4A847]"
                      )} />
                      <span className="font-label text-sm tracking-wide uppercase group-hover:tracking-widest text-[10px] font-black">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 p-6 bg-black/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-crosshair group">
            <Zap className="h-5 w-5 text-[#D4A847] group-hover:animate-bounce" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Network Live</span>
              <span className="text-[8px] font-mono text-[#3D7A5C] font-bold">SYMETRIC_AES_256</span>
            </div>
          </div>
          <p className="text-[8px] font-mono text-[#8A9BAD]/40 text-center uppercase tracking-[0.4em]">
            Precision v4.1 • Kigali
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
