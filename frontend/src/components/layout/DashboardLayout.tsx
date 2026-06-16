import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Bell, Search, User, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-[#0F1923] font-sans text-[#EEE8DC] selection:bg-[#C4622D]/30">
        <AppSidebar />
        <SidebarInset className="flex-1 bg-transparent overflow-y-auto">
          {/* Top Header - Mission Control Command Bar */}
          <header className="sticky top-0 z-40 flex h-20 items-center gap-6 border-b border-white/5 bg-[#141C25]/60 backdrop-blur-xl px-8 shadow-lg">
            <SidebarTrigger className="text-[#8A9BAD] hover:text-[#C4622D] transition-all hover:scale-110" />

            <div className="flex items-center gap-4 text-[#8A9BAD] font-mono text-[10px] uppercase tracking-[0.2em] hidden lg:flex">
              <span className="opacity-40">System Node:</span>
              <span className="text-[#D4A847] font-bold">MINEDUC_KIGALI_HQ</span>
            </div>

            {/* Search Bar - Precision Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9BAD]/40 group-focus-within:text-[#C4622D] transition-colors" />
                <Input
                  type="search"
                  placeholder="Query National Database (Schools, Indices, Coordinates)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-[#C4622D]/50 rounded-lg font-mono text-xs text-[#EEE8DC] placeholder:text-[#8A9BAD]/30"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-5">
              {/* Notifications - Alert Center */}
              <Button variant="ghost" size="icon" className="relative hover:bg-white/5 rounded-xl group">
                <Bell className="h-5 w-5 text-[#8A9BAD] group-hover:text-[#D4A847] transition-colors" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#C4622D] shadow-[0_0_8px_rgba(196,98,45,0.8)] animate-pulse" />
              </Button>

              {/* User Menu - Command Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-3 h-12 px-2 hover:bg-white/5 rounded-xl border border-white/0 hover:border-white/5 transition-all">
                    <div className="flex flex-col items-end hidden sm:flex">
                      <span className="text-xs font-bold leading-none text-white tracking-wide">{(user?.name || 'Administrator').toUpperCase()}</span>
                      <span className="text-[9px] font-mono text-[#D4A847] uppercase tracking-widest mt-1">{(user?.email || 'System Root').split('@')[0]}</span>
                    </div>
                    <Avatar className="h-10 w-10 rounded-lg border border-[#C4622D]/20 ring-4 ring-black/40">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback className="bg-[#141C25] text-[#C4622D] font-bold rounded-lg border border-white/5">
                        {(user?.name || 'AD').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-[#141C25] border-white/10 text-[#EEE8DC] shadow-2xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-xs font-mono text-[#D4A847] uppercase tracking-widest">Active Personnel</p>
                      <p className="text-sm font-display font-bold text-white tracking-wide">
                        {user ? user.name : 'System Guest'}
                      </p>
                      <p className="text-[10px] font-mono text-[#8A9BAD] uppercase">
                        {user ? user.email : 'LOG_ANONYMOUS'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer rounded-lg m-1">
                    <Link to="/settings" className="text-xs font-label uppercase tracking-widest w-full text-center py-1 text-[#EEE8DC] hover:text-[#D4A847] transition-colors block">
                      System Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer rounded-lg m-1" onClick={logout}>
                    <p className="text-xs font-label uppercase tracking-widest w-full text-center py-1">Terminate Session</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="relative flex-1 p-8 lg:p-10 animate-fade-in overflow-x-hidden">
            {/* Background Watermark Decoration */}
            <div className="absolute top-20 right-20 pointer-events-none opacity-[0.02] select-none">
              <Globe className="h-[600px] w-[600px] text-white" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
