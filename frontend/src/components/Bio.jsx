import React from 'react';

export default function Bio() {
  return (
    <section className="bio-section">
      <div className="bio-content">
        <div className="bio-greeting">Hello, I'm</div>
        <h1 className="bio-name">Alex Rivera</h1>
        <p className="bio-text">
          A Full-Stack Developer passionate about crafting highly performant, accessible, and stunning digital experiences. I specialize in React, Node.js, and database design. Currently building modern applications for the web.
        </p>
        <div className="bio-cta">
          <a href="#projects" className="btn btn-primary" onClick={(e) => {
            e.preventDefault();
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Explore Work
          </a>
          <a href="mailto:alex@example.com" className="btn btn-secondary">
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}
