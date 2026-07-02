import React, { useState, useEffect, useRef } from 'react';

export default function Bio() {
  const [typedName, setTypedName] = useState('');
  const fullName = "Harsh Ashish Dambiwal";
  const starsCanvasRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    let isMounted = true;
    let currentText = "";
    let index = 0;
    let timeoutId = null;
    setTypedName('');

    const typeCharacter = () => {
      if (!isMounted) return;
      if (index < fullName.length) {
        currentText += fullName.charAt(index);
        setTypedName(currentText);
        index++;
        timeoutId = setTimeout(typeCharacter, 80);
      }
    };

    timeoutId = setTimeout(typeCharacter, 150);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Faint background star particles effect
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    const stars = [];
    const numStars = 22; // 20-25 particles

    const resizeCanvas = () => {
      // Set to section dimensions
      const section = canvas.closest('.bio-section');
      if (section) {
        canvas.width = section.clientWidth;
        canvas.height = section.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      if (stars.length === 0) {
        for (let i = 0; i < numStars; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.12, // extremely slow drifting speeds
            vy: (Math.random() - 0.5) * 0.12
          });
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // low opacity (0.2)

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        star.x += star.vx;
        star.y += star.vy;

        // Wrap around boundaries
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Draw stars as 1px dots
        ctx.fillRect(star.x, star.y, 1, 1);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const skills = [
    'UAV Design', 'XFLR5', 'Fusion360', 'ANSYS Workbench', 
    'ROS', 'NVIDIA Isaac Sim', 'MATLAB', 'Unity', 
    'Python', 'ArduPilot/PX4', 'CAD'
  ];

  return (
    <section className="bio-section" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Subtle watermark background layers */}
      <div className="hero-watermark-bg" />
      <div className="hero-dark-overlay" />
      <canvas ref={starsCanvasRef} className="hero-star-particles" />

      <div className="bio-content">
        <div className="bio-greeting">Hello, I'm</div>
        <h1 className="bio-name">
          {typedName}
          <span className="typewriter-cursor">|</span>
        </h1>
        <div className="bio-tagline">
          Mechanical Engineering Student '27 | UAV Design · CFD · Digital Twin · ROS | SAEISS DDC 2026 AIR 1
        </div>
        <p className="bio-text">
          Final year Mechanical Engineering student at MIT Academy of Engineering, Pune. Specialized in UAV Design, Aerodynamics, CFD simulation, and Digital Twin development. Vice Captain of Team Blitzkrieg — achieved AIR 1 at SAE DDC 2026 national level competition.
        </p>

        <h3 id="skills-section" className="skills-title">Core Skills</h3>
        <div className="skills-list">
          {skills.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>

        <div className="bio-cta">
          <a href="#projects" className="btn btn-primary" onClick={(e) => {
            e.preventDefault();
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Explore Projects
          </a>
          <a href="mailto:harshdambiwal.work@gmail.com" className="btn btn-secondary">
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}
