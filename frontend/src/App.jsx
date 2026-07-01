import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.add('light-mode');
    } else {
      setIsDarkMode(true);
      document.body.classList.remove('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      setIsDarkMode(true);
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Simple state router
  const renderPage = () => {
    switch (currentTab) {
      case 'home':
        return <Home />;
      case 'login':
        return <Login setCurrentTab={setCurrentTab} />;
      case 'admin':
        return <Admin setCurrentTab={setCurrentTab} />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
      />
      <main>
        {renderPage()}
      </main>
    </div>
  );
}
