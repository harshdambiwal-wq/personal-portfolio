import React from 'react';

export default function Navbar({ currentTab, setCurrentTab, isDarkMode, toggleTheme }) {
  const handleHomeClick = () => {
    setCurrentTab('home');
  };

  return (
    <header className="navbar">
      <div className="logo" onClick={handleHomeClick}>
        Welcome to My Portfolio
      </div>
      <div className="nav-controls">
        <nav className="nav-links">
          {currentTab !== 'home' && (
            <span 
              className="nav-link" 
              onClick={handleHomeClick}
            >
              Home
            </span>
          )}
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
