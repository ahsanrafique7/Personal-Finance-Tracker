import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import { DashboardIcon, AddIcon, ListIcon, ChartIcon, UserIcon, MenuIcon, CloseIcon, SunIcon, MoonIcon } from './SidebarIcons';
import './Sidebar.css';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon size={18} /> },
  { path: '/add-transaction', label: 'Add Transaction', icon: <AddIcon size={18} /> },
  { path: '/transactions', label: 'Transactions', icon: <ListIcon size={18} /> },
  { path: '/reports', label: 'Reports', icon: <ChartIcon size={18} /> },
  { path: '/profile', label: 'Profile', icon: <UserIcon size={18} /> },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileOpen && !e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}>
        {/* Logo Section with Theme Toggle */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Logo size={24} strokeWidth={2} />
          </div>
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-sub">Finance Tracker</div>
          </div>
          <button
            className="sidebar-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              <span className="sidebar-nav-indicator" />
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-email">{user?.email || ''}</div>
            </div>
          </div>
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />}
    </>
  );
}

export default Sidebar;
