import React, { useState, useEffect, useRef } from 'react';

export default function CursorEffects() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [catVisible, setCatVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef(null);

  // Smooth position references (inertia)
  const glowPosRef = useRef({ x: 0, y: 0 });
  const catPosRef = useRef({ x: 0, y: 0 });
  const cursorDotPosRef = useRef({ x: 0, y: 0 });
  
  const glowElRef = useRef(null);
  const catElRef = useRef(null);
  const cursorDotElRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Make cat visible and reset idle timer
      setCatVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setCatVisible(false);
      }, 3000); // hide after 3 seconds of inactivity

      // Check if cursor is hovering over an interactive element
      const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
      if (hoveredEl) {
        const isInteractive = hoveredEl.closest('a, button, .project-card, .skill-tag, .nav-link, .logo, .hamburger-btn, .nav-dropdown-item');
        setIsHovered(!!isInteractive);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Animation loop for tracking cursor dot, cat, and glow
  useEffect(() => {
    let animationFrameId;

    const updateInertia = () => {
      const time = Date.now();

      // Custom dot custom cursor (extremely fast, responsive)
      cursorDotPosRef.current.x += (mousePos.x - cursorDotPosRef.current.x) * 0.45;
      cursorDotPosRef.current.y += (mousePos.y - cursorDotPosRef.current.y) * 0.45;

      // Glow halo (moderate response)
      glowPosRef.current.x += (mousePos.x - glowPosRef.current.x) * 0.15;
      glowPosRef.current.y += (mousePos.y - glowPosRef.current.y) * 0.15;

      // Cute cat trailing face (slow response for ~200ms delay + bobbing)
      catPosRef.current.x += (mousePos.x - catPosRef.current.x) * 0.05;
      catPosRef.current.y += (mousePos.y - catPosRef.current.y) * 0.05;

      const bobY = Math.sin(time * 0.004) * 5; // slow bobbing motion

      if (cursorDotElRef.current) {
        const scaleVal = isHovered ? 1.8 : 1.0;
        cursorDotElRef.current.style.transform = `translate3d(${cursorDotPosRef.current.x - 6}px, ${cursorDotPosRef.current.y - 6}px, 0) scale(${scaleVal})`;
      }

      if (glowElRef.current) {
        glowElRef.current.style.transform = `translate3d(${glowPosRef.current.x - 150}px, ${glowPosRef.current.y - 150}px, 0)`;
      }

      if (catElRef.current) {
        catElRef.current.style.transform = `translate3d(${catPosRef.current.x + 20}px, ${catPosRef.current.y + 10 + bobY}px, 0)`;
        catElRef.current.style.opacity = catVisible ? '1' : '0';
      }

      animationFrameId = requestAnimationFrame(updateInertia);
    };

    animationFrameId = requestAnimationFrame(updateInertia);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos, isHovered, catVisible]);

  // Particle network rendering loop (Bruno Simon style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const particleCount = 85;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1.5,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        baseVx: (Math.random() - 0.5) * 0.8,
        baseVy: (Math.random() - 0.5) * 0.8
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isLightMode = document.body.classList.contains('light-mode');
      const baseColor = isLightMode ? '9, 105, 218' : '88, 166, 255'; // GH theme blue
      const glowColor = isLightMode ? '3, 102, 214' : '0, 210, 255'; // Cyan-blue highlights

      // Draw lines between particles first
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (110 - dist) / 110 * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${baseColor}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw lines from mouse to nearby particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          const lineAlpha = (180 - dist) / 180 * 0.35;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.strokeStyle = `rgba(${glowColor}, ${lineAlpha})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Strong attractive force towards mouse if nearby
        if (dist < 280) {
          const force = (280 - dist) / 280;
          p.vx += (dx / dist) * force * 0.25;
          p.vy += (dy / dist) * force * 0.25;
        }

        // Return to standard velocity limits
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Apply standard drift velocity
        p.x += p.vx + p.baseVx;
        p.y += p.vy + p.baseVy;

        // Wrap around boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Glow draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${glowColor}, 0.8)`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = `rgba(${glowColor}, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow config
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [mousePos]);

  return (
    <>
      {/* Background Interactive Particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: -1,
          width: '100vw',
          height: '100vh'
        }}
      />
      
      {/* Soft Blue Glow circle */}
      <div
        ref={glowElRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(88, 166, 255, 0.08) 0%, rgba(88, 166, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform'
        }}
      />

      {/* Trailing Cat Face emoji */}
      <div
        ref={catElRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          fontSize: '1.4rem',
          pointerEvents: 'none',
          zIndex: 100001,
          willChange: 'transform',
          transition: 'opacity 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
          userSelect: 'none',
          opacity: 0
        }}
      >
        😺
      </div>

      {/* Custom Glowing Cursor Dot */}
      <div
        ref={cursorDotElRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '12px',
          height: '12px',
          backgroundColor: '#58a6ff',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 100000,
          boxShadow: '0 0 10px rgba(88, 166, 255, 0.8), 0 0 2px #ffffff',
          willChange: 'transform',
          transform: 'translate3d(-20px, -20px, 0)'
        }}
      />
    </>
  );
}
