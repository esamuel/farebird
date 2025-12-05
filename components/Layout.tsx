import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { PlaneTakeoff, LayoutDashboard, Bookmark, Settings, LogOut, Menu, X, Bird, HelpCircle } from 'lucide-react';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Hide layout for landing page usually, but for this demo we keep a consistent header logic
  const isLanding = location.pathname === '/';

  const navItems = [
    { name: 'Search Flights', path: '/dashboard', icon: <PlaneTakeoff size={20} /> },
    { name: 'Saved Trips', path: '/saved', icon: <Bookmark size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    { name: 'Help', path: '/help', icon: <HelpCircle size={20} /> },
  ];

  if (isLanding) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Simple Landing Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <img src="/farebird-logo-full.jpg" alt="Farebird" className="h-16 w-auto" />
            </div>
            <div className="flex gap-4">
              <NavLink to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">
                Sign In
              </NavLink>
              <NavLink to="/dashboard" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-colors shadow-sm">
                Get Started
              </NavLink>
            </div>
          </div>
        </header>
        {children}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <NavLink to="/" className="flex items-center">
            <img src="/farebird-logo-full.jpg" alt="Farebird" className="h-16 w-auto" />
          </NavLink>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
            <h4 className="font-semibold text-sm mb-1">Go Pro</h4>
            <p className="text-xs opacity-90 mb-3">Get advanced AI predictions.</p>
            <button className="w-full bg-white/20 hover:bg-white/30 text-xs font-semibold py-1.5 rounded transition-colors backdrop-blur-sm">
              Upgrade
            </button>
          </div>
          <button className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 transition-colors w-full">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Content Wrapper */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center">
            <img src="/farebird-logo-full.jpg" alt="Farebird" className="h-12 w-auto" />
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-10 bg-slate-800/50 backdrop-blur-sm pt-16" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-white p-4 space-y-2 border-b border-slate-200 shadow-xl" onClick={e => e.stopPropagation()}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};