import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import TodoList from '../components/TodoList';
import SocialFeed from '../components/SocialFeed';

function DashboardPage({ token, onLogout }) {
  const [greeting, setGreeting] = useState('Welcome back!');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setGreeting(data.greeting);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      }
    };

    fetchDashboard();
  }, [token]);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>CoachApp</h1>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>{greeting}</h2>
          <p>Here's what's on your plate today</p>
        </div>

        <div className="main-grid">
          <div className="left-column">
            <TodoList token={token} />
          </div>
          <div className="right-column">
            <SocialFeed token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
