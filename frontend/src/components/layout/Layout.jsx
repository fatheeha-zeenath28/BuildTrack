import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard',  roles: ['admin','engineer','client'] },
  { to: '/projects',  icon: '🏗️',  label: 'Projects',   roles: ['admin','engineer','client'] },
  { to: '/tasks',     icon: '✅',  label: 'Tasks',      roles: ['admin','engineer'] },
  { to: '/reports',   icon: '📋',  label: 'Reports',    roles: ['admin','engineer','client'] },
  { to: '/photos',    icon: '📷',  label: 'Photos',     roles: ['admin','engineer','client'] },
  { to: '/users',     icon: '👥',  label: 'Users',      roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const links = NAV.filter(n => n.roles.includes(user?.role));
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Build<span>Track</span></h1>
          <p style={{color:'rgba(255,255,255,.4)', fontSize:'.75rem', marginTop:4}}>Construction Monitoring</p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Menu</div>
          {links.map(n => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="name">{user?.name}</div>
              <div className="role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
