import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <span className="navbar__brand">⚡ CoachApp</span>
        <div className="navbar__links">
          <NavLink to="/todos" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            Todos
          </NavLink>
          <NavLink to="/feed" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            Feed
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            <Avatar name={user?.name} color={user?.avatar_color} size={28} />
          </NavLink>
          <button className="navbar__logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
