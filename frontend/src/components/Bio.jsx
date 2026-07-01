import React, { useState, useEffect } from 'react';

export default function Bio() {
  const [typedName, setTypedName] = useState('');
  const fullName = "Harsh Ashish Dambiwal";

  useEffect(() => {
    let isMounted = true;
    let currentText = "";
    let index = 0;
    setTypedName('');

    const typeCharacter = () => {
      if (!isMounted) return;
      if (index < fullName.length) {
        currentText += fullName.charAt(index);
        setTypedName(currentText);
        index++;
        setTimeout(typeCharacter, 80);
      }
    };

    const delayTimer = setTimeout(typeCharacter, 150);

    return () => {
      isMounted = false;
      clearTimeout(delayTimer);
    };
  }, []);

  const skills = [
    'UAV Design', 'XFLR5', 'Fusion360', 'ANSYS Workbench', 
    'ROS', 'NVIDIA Isaac Sim', 'MATLAB', 'Unity', 
    'Python', 'ArduPilot/PX4', 'CAD'
  ];

  return (
    <section className="bio-section">
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
