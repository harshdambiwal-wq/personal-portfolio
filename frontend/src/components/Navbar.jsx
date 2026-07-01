import React from 'react';

export default function Navbar({ currentTab, setCurrentTab, isDarkMode, toggleTheme }) {
  return (
    <header className="navbar">
      <div className="logo" onClick={() => setCurrentTab('home')}>
        DevPortfolio
      </div>
      <div className="nav-controls">
        <nav className="nav-links">
          <span 
            className={`nav-link ${currentTab === 'home' ? 'active' : ''}`} 
            onClick={() => setCurrentTab('home')}
          >
            Home
          </span>
          <span 
            className={`nav-link ${currentTab === 'admin' || currentTab === 'login' ? 'active' : ''}`} 
            onClick={() => {
              const token = localStorage.getItem('adminToken');
              setCurrentTab(token ? 'admin' : 'login');
            }}
          >
            Admin
          </span>
        </nav>
        <button 
          className="theme-btn" 
          onClick={toggleTheme} 
          aria-label="Toggle Theme"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
