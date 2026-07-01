import React, { useState, useEffect, useRef } from 'react';

export default function CursorEffects() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef(null);

  // Smooth position references (inertia)
  const glowPosRef = useRef({ x: 0, y: 0 });
  const catPosRef = useRef({ x: 0, y: 0 });
  const glowElRef = useRef(null);
  const catElRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Determine if cursor is hovering over an interactive element
      const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
      if (hoveredEl) {
        const isInteractive = hoveredEl.closest('a, button, .project-card, .skill-tag, .nav-link, .logo');
        setIsHovered(!!isInteractive);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop for tracking (cat & glow inertia)
  useEffect(() => {
    let animationFrameId;

    const updateInertia = () => {
      // Interpolate glow position (faster response)
      glowPosRef.current.x += (mousePos.x - glowPosRef.current.x) * 0.15;
      glowPosRef.current.y += (mousePos.y - glowPosRef.current.y) * 0.15;

      // Interpolate cat paw position (slower delay response for trail effect)
      catPosRef.current.x += (mousePos.x - catPosRef.current.x) * 0.08;
      catPosRef.current.y += (mousePos.y - catPosRef.current.y) * 0.08;

      if (glowElRef.current) {
        glowElRef.current.style.transform = `translate3d(${glowPosRef.current.x - 150}px, ${glowPosRef.current.y - 150}px, 0)`;
      }

      if (catElRef.current) {
        const hoverScale = isHovered ? 1.4 : 1.0;
        catElRef.current.style.transform = `translate3d(${catPosRef.current.x + 15}px, ${catPosRef.current.y + 15}px, 0) scale(${hoverScale})`;
      }

      animationFrameId = requestAnimationFrame(updateInertia);
    };

    animationFrameId = requestAnimationFrame(updateInertia);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos, isHovered]);

  // Canvas Particle system (slowly drifting towards mouse)
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

    // Initialize particles
    const particleCount = 45;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.3 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const isLightMode = document.body.classList.contains('light-mode');
      const particleColor = isLightMode ? '9, 105, 218' : '88, 166, 255'; // GitHub theme blue colors

      particles.forEach((p) => {
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Drift force towards mouse if within range
        if (dist < 400) {
          const force = (400 - dist) / 40000;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        // Apply friction to cap speed
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Minor base drift
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;

        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Screen boundary wraps
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
        ctx.fill();
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
          zIndex: 9998,
          willChange: 'transform'
        }}
      />
      <div
        ref={catElRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          fontSize: '1.2rem',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
          transition: 'transform 0.05s linear',
          userSelect: 'none'
        }}
      >
        🐾
      </div>
    </>
  );
}
