import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  UserPlus,
  UserCheck,
  MapPin,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const API_BASE = 'http://localhost:5000';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'INVITE' | 'ACTIVATION' | 'SUBMISSION' | 'APPROVAL' | 'REJECTION' | 'VERIFICATION' | 'SYSTEM';
  reference_id: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const elapsed = now.getTime() - past.getTime();

  if (elapsed < msPerMinute) {
    return 'just now';
  } else if (elapsed < msPerHour) {
    const mins = Math.round(elapsed / msPerMinute);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.round(elapsed / msPerDay);
    if (days === 1) {
      return 'yesterday';
    }
    return `${days} days ago`;
  }
}

function canAccessUrl(role: string, url: string): boolean {
  if (url.startsWith('/users') || url.startsWith('/audit') || url.startsWith('/admin')) {
    return role === 'admin';
  }
  if (url.startsWith('/verification') || url.startsWith('/validation') || url.startsWith('/validator')) {
    return role === 'validator';
  }
  if (url.startsWith('/mapper')) {
    return role === 'mapper';
  }
  if (url.startsWith('/submit-school')) {
    return role === 'admin' || role === 'mapper';
  }
  return true; // public or general protected routes
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'INVITE':
      return <UserPlus className="h-4 w-4 text-[#D4A847]" />;
    case 'ACTIVATION':
      return <UserCheck className="h-4 w-4 text-[#3D7A5C]" />;
    case 'SUBMISSION':
      return <MapPin className="h-4 w-4 text-blue-400" />;
    case 'APPROVAL':
      return <CheckCircle className="h-4 w-4 text-[#3D7A5C]" />;
    case 'REJECTION':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'VERIFICATION':
      return <ClipboardCheck className="h-4 w-4 text-[#D4A847]" />;
    default:
      return <AlertCircle className="h-4 w-4 text-[#8A9BAD]" />;
  }
}

export function NotificationBell() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  // Load notifications and start 60s polling
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 60000); // 60-second polling

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notif: Notification) => {
    // Navigate if action_url is provided and user has permission
    const performNavigation = () => {
      if (notif.action_url) {
        if (user && canAccessUrl(user.role, notif.action_url)) {
          navigate(notif.action_url);
          setIsOpen(false);
        } else {
          toast.error('Your role does not have permission to access this page.');
        }
      }
    };

    if (notif.is_read) {
      performNavigation();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/notifications/${notif.id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        performNavigation();
      } else {
        toast.error('Failed to mark notification as read.');
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
      toast.error('Network error. Failed to update notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read.');
      } else {
        toast.error('Failed to mark all as read.');
      }
    } catch (err) {
      console.error('Error marking all notifications read:', err);
      toast.error('Network error.');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-white/5 rounded-xl group">
          <Bell className="h-5 w-5 text-[#8A9BAD] group-hover:text-[#D4A847] transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#C4622D] text-white font-mono text-[9px] font-black flex items-center justify-center border-2 border-[#141C25] shadow-[0_0_8px_rgba(196,98,45,0.8)] animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 bg-[#141C25] border-white/5 text-[#EEE8DC] shadow-2xl p-0 overflow-hidden rounded-xl"
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0F1923]">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
            Notifications
          </span>
          {unreadCount > 0 && (
            <Button
              variant="link"
              onClick={handleMarkAllAsRead}
              className="text-[#D4A847] hover:text-[#C4622D] p-0 h-auto font-mono text-[9px] uppercase tracking-widest"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#8A9BAD]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-mono text-[9px] uppercase tracking-wider">Syncing node...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-[#8A9BAD]">
              <p className="font-mono text-[9px] uppercase tracking-wider">Zero Alerts Logged</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif)}
                className={cn(
                  'flex gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors items-start',
                  !notif.is_read && 'bg-[#C4622D]/5'
                )}
              >
                {/* Icon wrapper */}
                <div className="mt-0.5 flex-shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      'text-xs truncate font-display font-medium text-white',
                      !notif.is_read && 'font-bold'
                    )}>
                      {notif.title}
                    </p>
                    {/* Read indicator dot */}
                    {!notif.is_read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C4622D] flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#8A9BAD] mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[8px] font-mono text-[#8A9BAD]/50 uppercase tracking-wider mt-1">
                    {formatRelativeTime(notif.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
