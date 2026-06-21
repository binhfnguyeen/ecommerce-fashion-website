import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Dashboard from '@mui/icons-material/Dashboard';
import Category from '@mui/icons-material/Category';
import Inventory from '@mui/icons-material/Inventory';
import People from '@mui/icons-material/People';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import Logout from '@mui/icons-material/Logout';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(authService.getCurrentSession());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }

    const handleLogout = () => {
      setSession(null);
      navigate('/login');
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => {
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, [session, navigate]);

  if (!session) return null;

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/categories', label: 'Categories', icon: <Category /> },
    { path: '/products', label: 'Products', icon: <Inventory /> },
    { path: '/users', label: 'Users', icon: <People /> },
    { path: '/orders', label: 'Orders', icon: <ReceiptLong /> },
  ];

  const handleLogoutClick = () => {
    authService.logout();
  };

  return (
    <div className="admin-app">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">FASHION ADMIN</span>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <li
                key={item.path}
                className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Link to={item.path}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogoutClick}>
            <Logout style={{ fontSize: '18px' }} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="top-header-left">
            <button
              className="menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </button>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
              Fashion Shop Admin System
            </div>
          </div>
          <div className="top-header-right">
            <div className="user-profile-badge">
              <div className="user-avatar-placeholder">
                {session.username ? session.username.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="user-profile-name">{session.username}</span>
                <span className="user-profile-role">{session.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="view-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
