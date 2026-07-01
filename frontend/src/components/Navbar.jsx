import React, { useState, useEffect, useRef } from 'react';

export default function Navbar({ currentTab, setCurrentTab, isDarkMode, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (sectionId) => {
    setCurrentTab('home');
    setMenuOpen(false);
    
    // Smooth scroll to target section
    setTimeout(() => {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSettingsClick = () => {
    setCurrentTab('login');
    setMenuOpen(false);
  };

  return (
    <header className="navbar" ref={dropdownRef}>
      <div className="logo" onClick={() => handleNavClick('top')}>
        Welcome to My Portfolio
      </div>
      
      <div className="nav-controls">
        <button 
          className="theme-btn" 
          onClick={toggleTheme} 
          aria-label="Toggle Theme"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Hamburger Menu Toggle Icon */}
        <button 
          className={`hamburger-btn ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          ☰
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="nav-dropdown animate-dropdown">
            <div 
              className="nav-dropdown-item" 
              onClick={() => handleNavClick('top')}
            >
              Home
            </div>
            <div 
              className="nav-dropdown-item" 
              onClick={() => handleNavClick('projects')}
            >
              Projects
            </div>
            <div 
              className="nav-dropdown-item" 
              onClick={() => handleNavClick('skills-section')}
            >
              Skills
            </div>
            <a 
              href="mailto:harshdambiwal.work@gmail.com" 
              className="nav-dropdown-item"
              style={{ textDecoration: 'none', display: 'block' }}
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </a>
            
            {/* Hidden admin access */}
            <div 
              className="nav-dropdown-item settings-item" 
              onClick={handleSettingsClick}
            >
              ⚙ Settings
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
