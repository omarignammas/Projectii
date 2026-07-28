import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Home,
  ListTodo,
  LayoutGrid,
  CalendarDays,
  Timer,
  NotebookText,
  BarChart3,
  AlertTriangle,
  Settings,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/courses', label: 'Courses', icon: LayoutGrid },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/focus-rooms', label: 'Focus Rooms', icon: Timer },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/notes', label: 'Notes', icon: NotebookText },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/overdue', label: 'Overdue', icon: AlertTriangle },
];

const BOTTOM_ITEMS = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User },
];

const SIDEBAR_STORAGE_KEY = 'sidebar-expanded';

const railLinkClass = (expanded) => ({ isActive }) =>
  `group relative flex h-10 items-center rounded-lg transition-colors ${
    expanded ? 'w-full gap-3 px-3' : 'w-10 justify-center'
  } ${
    isActive
      ? 'bg-primary/15 text-primary'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  }`;

const RailLink = ({ item, expanded }) => (
  <NavLink to={item.to} className={railLinkClass(expanded)} title={expanded ? undefined : item.label}>
    <item.icon className="h-5 w-5 shrink-0" />
    {expanded ? (
      <span className="truncate text-sm font-medium">{item.label}</span>
    ) : (
      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:opacity-100 z-50">
        {item.label}
      </span>
    )}
  </NavLink>
);

export const Sidebar = ({ onQuickAdd }) => {
  const [expanded, setExpanded] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(expanded));
  }, [expanded]);

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-border/80 bg-card/40 py-4 transition-[width] duration-200 md:flex ${
        expanded ? 'w-56 items-stretch px-3' : 'w-16 items-center'
      }`}
    >
      <div className={`mb-4 flex items-center ${expanded ? 'justify-between px-1' : 'justify-center'}`}>
        <NavLink
          to="/dashboard"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <FolderKanban className="h-5 w-5" />
        </NavLink>
        {expanded && <span className="ml-2 flex-1 truncate text-sm font-semibold text-foreground">Projectii</span>}
      </div>

      <button
        type="button"
        onClick={onQuickAdd}
        title={expanded ? undefined : 'Quick Add'}
        className={`mb-4 flex h-9 items-center gap-2 rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary ${
          expanded ? 'w-full justify-center px-3' : 'w-9 justify-center'
        }`}
      >
        <Plus className="h-4 w-4 shrink-0" />
        {expanded && <span className="text-sm font-medium">Quick Add</span>}
      </button>

      <nav className="flex flex-1 flex-col justify-between overflow-hidden">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <RailLink item={item} expanded={expanded} />
            </li>
          ))}
        </ul>

        <div>
          <ul className="space-y-1 border-t border-border/80 pt-3">
            {BOTTOM_ITEMS.map((item) => (
              <li key={item.to}>
                <RailLink item={item} expanded={expanded} />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            title={expanded ? 'Collapse' : 'Expand'}
            className={`mt-3 flex h-9 items-center gap-2 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
              expanded ? 'w-full justify-start px-3' : 'w-9 justify-center'
            }`}
          >
            {expanded ? (
              <ChevronLeft className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            {expanded && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
