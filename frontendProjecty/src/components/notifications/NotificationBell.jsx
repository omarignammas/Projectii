import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import focusRoomService from '../../services/focusRoomService';
import { useToast } from '../../hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export const NotificationBell = ({ notifications, unreadCount, markRead, markAllRead, refresh }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resolvingId, setResolvingId] = useState(null);

  const handleClick = (notification) => {
    if (!notification.read) markRead(notification.id);
    if (notification.link) navigate(notification.link);
  };

  const respondToInvite = async (event, notification, action) => {
    event.stopPropagation();
    setResolvingId(notification.id);
    try {
      if (action === 'join') {
        await focusRoomService.joinRoom(notification.actionResourceId);
      } else {
        await focusRoomService.declineInvite(notification.actionResourceId);
      }
      if (!notification.read) await markRead(notification.id);
      await refresh();
      if (action === 'join') navigate(`/focus-rooms/${notification.actionResourceId}`);
    } catch (error) {
      toast({
        title: 'Focus Room',
        description: error.response?.data?.message || `Couldn't ${action === 'join' ? 'join' : 'decline'} that invite`,
        variant: 'destructive',
      });
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className="flex cursor-pointer flex-col items-start gap-1 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-accent"
              >
                <div className="flex w-full items-center gap-1.5">
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  <span className="font-medium text-foreground">{n.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{n.body}</p>

                {n.actionable && (
                  <div className="mt-1 flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs"
                      disabled={resolvingId === n.id}
                      onClick={(e) => respondToInvite(e, n, 'join')}
                    >
                      {resolvingId === n.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Join'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-xs"
                      disabled={resolvingId === n.id}
                      onClick={(e) => respondToInvite(e, n, 'decline')}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
