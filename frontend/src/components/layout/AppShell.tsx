import React, { useEffect, useState } from 'react';
import type { Route } from '../../lib/types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';

interface AppShellProps {
  route: Route;
  onNavigate: (route: Route) => void;
  onStudyChapter: (chapter: number) => void;
  backendStatus: 'checking' | 'online' | 'offline';
  totalChunks: number | null;
  children: React.ReactNode;
}

const SIDEBAR_KEY = 'ensia-sidebar-collapsed';

export const AppShell: React.FC<AppShellProps> = ({ route, onNavigate, onStudyChapter, backendStatus, totalChunks, children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_KEY) === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [route]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl) return;

      const key = event.key ? event.key.toLowerCase() : '';
      const code = event.code;

      if (key === 'k' || code === 'KeyK') {
        event.preventDefault();
        setCommandOpen((open) => !open);
      } else if (key === 'b' || code === 'KeyB' || key === '[') {
        event.preventDefault();
        if (window.matchMedia('(min-width: 1024px)').matches) {
          setCollapsed((val) => !val);
        } else {
          setMobileOpen((open) => !open);
        }
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[120] focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-xs focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <Sidebar
        route={route}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        backendStatus={backendStatus}
        totalChunks={totalChunks}
      />

      <div className={collapsed ? 'transition-[padding] duration-200 ease-out lg:pl-[68px]' : 'transition-[padding] duration-200 ease-out lg:pl-[248px]'}>
        <Topbar
          route={route}
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed((value) => !value)}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
          backendStatus={backendStatus}
          totalChunks={totalChunks}
        />
        <main id="main" className="min-h-[calc(100vh-52px)]">
          {children}
        </main>
      </div>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={onNavigate}
        onStudyChapter={onStudyChapter}
      />
    </div>
  );
};
