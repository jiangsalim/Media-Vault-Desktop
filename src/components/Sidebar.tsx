import { useUiStore, type Route } from '@/store/useUiStore';
import { useDownloadStore } from '@/store/useDownloadStore';
import { cn } from '@/lib/cn';

interface NavItem {
  route: Route;
  label: string;
}

const NAV: NavItem[] = [
  { route: 'home', label: 'Download' },
  { route: 'search', label: 'Search' },
  { route: 'downloads', label: 'Downloads' },
  { route: 'playlists', label: 'Playlists' },
  { route: 'analytics', label: 'Analyzer' },
  { route: 'audio', label: 'Audio' },
  { route: 'thumbnails', label: 'Thumbnails' },
  { route: 'history', label: 'History' },
  { route: 'theme', label: 'Theme' },
  { route: 'settings', label: 'Settings' },
  { route: 'about', label: 'About' },
];

export function Sidebar() {
  const route = useUiStore((s) => s.route);
  const navigate = useUiStore((s) => s.navigate);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  // Active download count badge
  const activeCount = useDownloadStore(
    (s) =>
      s.items.filter((i) =>
        ['downloading', 'queued', 'processing', 'paused'].includes(i.status),
      ).length,
  );

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-border bg-surface',
        collapsed ? 'w-12' : '',
      )}
      style={collapsed ? undefined : { width: 'var(--sidebar-width, 160px)' }}
    >
      {/* Top spacer for titlebar alignment */}
      <div className="h-1" />

      <nav className="flex flex-1 flex-col gap-px overflow-y-auto px-2 py-2" role="navigation" aria-label="Main navigation">
        {NAV.map((item) => {
          const active = route === item.route;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={cn(
                'relative flex items-center px-3 py-1.5 font-semibold uppercase tracking-widest transition-colors',
                active
                  ? 'border-l-2 border-text-primary bg-selection text-text-primary'
                  : 'border-l-2 border-transparent text-muted hover:bg-hover hover:text-text-secondary',
              )}
              style={{ fontSize: 'var(--font-size-nav, 11px)' }}
              aria-current={active ? 'page' : undefined}
            >
              <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
              {item.route === 'downloads' && activeCount > 0 && (
                <span
                  className={cn(
                    'ml-auto border border-border bg-surface-2 px-1.5 text-[10px] font-bold text-text-secondary',
                    collapsed && 'absolute right-1 top-1/2 -translate-y-1/2 ml-0',
                  )}
                >
                  {activeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center border-t border-border py-2 text-muted transition-colors duration-150 hover:bg-hover hover:text-text-secondary"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="text-xs">{collapsed ? '▶' : '◀'}</span>
      </button>
    </aside>
  );
}