import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <TrendingUp size={32} />
        <h1>Business Growth Platform</h1>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/analytics">Analytics</Link></li>
        <li><Link to="/ai-assistant">AI Assistant</Link></li>
        <li><Link to="/setup">Setup</Link></li>
      </ul>
      <div className="navbar-user">
        <button onClick={logout} className="logout-button">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
