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
  X,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/courses', label: 'Courses', icon: LayoutGrid },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/focus-rooms', label: 'Focus Rooms', icon: Timer },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/notes', label: 'Notes', icon: NotebookText },
  { to: '/summaries', label: 'Summaries', icon: Sparkles },
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

const RailLink = ({ item, expanded, onNavigate }) => (
  <NavLink to={item.to} className={railLinkClass(expanded)} title={expanded ? undefined : item.label} onClick={onNavigate}>
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

// Shared between the desktop rail and the mobile drawer — `expanded` is always true
// on mobile (there's no icon-only collapsed state there), and `onNavigate`/`onClose`
// close the drawer after a link or the quick-add button is used.
const SidebarNav = ({ expanded, onQuickAdd, onNavigate, showCollapseToggle, onToggleExpanded }) => (
  <>
    <div className={`mb-4 flex items-center ${expanded ? 'justify-between px-1 pr-8' : 'justify-center'}`}>
      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
      >
        <FolderKanban className="h-5 w-5" />
      </NavLink>
      {expanded && <span className="ml-2 flex-1 truncate text-sm font-semibold text-foreground">Projectii</span>}
    </div>

    <button
      type="button"
      onClick={() => {
        onQuickAdd();
        onNavigate?.();
      }}
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
            <RailLink item={item} expanded={expanded} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <div>
        <ul className="space-y-1 border-t border-border/80 pt-3">
          {BOTTOM_ITEMS.map((item) => (
            <li key={item.to}>
              <RailLink item={item} expanded={expanded} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>

        {showCollapseToggle && (
          <button
            type="button"
            onClick={onToggleExpanded}
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
        )}
      </div>
    </nav>
  </>
);

export const Sidebar = ({ onQuickAdd, mobileOpen = false, onMobileClose }) => {
  const [expanded, setExpanded] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(expanded));
  }, [expanded]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onMobileClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop rail — collapsible icon rail, hidden below md */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-border/80 bg-card/40 py-4 transition-[width] duration-200 md:flex ${
          expanded ? 'w-56 items-stretch px-3' : 'w-16 items-center'
        }`}
      >
        <SidebarNav
          expanded={expanded}
          onQuickAdd={onQuickAdd}
          showCollapseToggle
          onToggleExpanded={() => setExpanded((e) => !e)}
        />
      </aside>

      {/* Mobile off-canvas drawer — below md, opened from the AppShell header's menu button */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 max-w-[80vw] animate-in slide-in-from-left flex-col border-r border-border/80 bg-card px-3 py-4 shadow-xl duration-200">
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close menu"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarNav expanded onQuickAdd={onQuickAdd} onNavigate={onMobileClose} showCollapseToggle={false} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
