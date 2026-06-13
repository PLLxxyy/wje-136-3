import { BarChart3, Boxes, CircleDollarSign, Moon, Route, Sun, Truck } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useMockData } from './hooks/useMockData';
import { useThemeStore } from './stores/themeStore';

const navItems = [
  { to: '/dashboard', label: '总览', icon: BarChart3 },
  { to: '/shipments', label: '运输', icon: Route },
  { to: '/warehouse-analytics', label: '仓库', icon: Boxes },
  { to: '/fleet', label: '车队', icon: Truck },
  { to: '/cost-analytics', label: '成本', icon: CircleDollarSign },
];

export function AppLayout() {
  const { loading } = useMockData();
  const mode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <div className="min-h-screen bg-app text-base text-body">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-sidebar px-4 py-5 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-white">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-strong">陆链指挥台</p>
            <p className="text-xs text-muted">WJE-136</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`} key={item.to} to={item.to}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-topbar backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-8">
            <nav className="flex gap-1 overflow-x-auto lg:hidden">
              {navItems.map((item) => (
                <NavLink className={({ isActive }) => `mobile-nav ${isActive ? 'is-active' : ''}`} key={item.to} to={item.to}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="hidden text-sm text-muted lg:block">供应链物流数据看板 · IndexedDB + ECharts</div>
            <button className="icon-button" onClick={toggleTheme} title="切换主题" type="button">
              {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8">
          {loading ? (
            <div className="panel grid min-h-80 place-items-center">
              <p className="text-sm text-muted">正在加载物流模拟数据...</p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
