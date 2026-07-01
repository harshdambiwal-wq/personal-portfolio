import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import CursorEffects from './components/CursorEffects';

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

  // URL-based routing handler
  const handleRouting = () => {
    const path = window.location.pathname;
    const token = localStorage.getItem('adminToken');

    if (path === '/admin') {
      setCurrentTab(token ? 'admin' : 'login');
    } else if (path === '/login') {
      setCurrentTab('login');
    } else {
      setCurrentTab('home');
    }
  };

  // Watch URL path on load and popstate
  useEffect(() => {
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  // Custom navigation wrapper that pushes browser history
  const navigateTo = (tab) => {
    setCurrentTab(tab);
    const path = tab === 'home' ? '/' : `/${tab}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  // Scroll Reveal Animation Observer
  useEffect(() => {
    // Small timeout to guarantee DOM components have completed rendering
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-active');
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
      );

      const elements = document.querySelectorAll('.scroll-reveal');
      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [currentTab]);

  return (
    <div className="app-container">
      <CursorEffects />
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={navigateTo} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
      />
      <main>
        {currentTab === 'home' && <Home />}
        {currentTab === 'login' && <Login setCurrentTab={navigateTo} />}
        {currentTab === 'admin' && <Admin setCurrentTab={navigateTo} />}
      </main>
    </div>
  );
}
