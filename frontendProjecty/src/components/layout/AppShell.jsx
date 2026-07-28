import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, Settings } from 'lucide-react';
import Sidebar from './Sidebar';
import { ModeToggle } from '../ui/mode-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth';
import CreateTaskDialog from '../tasks/CreateTaskDialog';
import { useToast } from '../../hooks/use-toast';
import Avatar from '../shared/Avatar';
import NotificationBell from '../notifications/NotificationBell';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';

export const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationSocket(!!user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickAddCreated = (task) => {
    setIsQuickAddOpen(false);
    toast({
      title: '✅ Task created',
      description: `"${task.title}" was added.`,
      variant: 'default',
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onQuickAdd={() => setIsQuickAddOpen(true)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-40 flex shrink-0 items-center justify-end gap-3 border-b border-border/80 bg-background/80 px-6 py-3 backdrop-blur-md">
          <ModeToggle />

          {user && (
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              markRead={markRead}
              markAllRead={markAllRead}
            />
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-full border border-border/80 bg-card pl-1 pr-3 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  <Avatar name={`${user.firstName} ${user.lastName}`} avatarUrl={user.avatarUrl} size="sm" />
                  <span className="hidden sm:inline">{user.firstName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                  <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserCircle className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <CreateTaskDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onTaskCreated={handleQuickAddCreated}
      />
    </div>
  );
};

export default AppShell;
