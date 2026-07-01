import React, { useState, useEffect } from 'react';
import Bio from '../components/Bio';
import ProjectCard from '../components/ProjectCard';
import { API_BASE } from '../config';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/projects`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch projects');
        }
        return res.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setError('Could not load projects. Please make sure the backend is running.');
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="scroll-reveal">
        <Bio />
      </div>
      
      <section id="projects" className="projects-section scroll-reveal">
        <h2 className="section-title">Featured Projects</h2>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading projects...
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ margin: '2rem 0' }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="empty-state">
            <h3>No projects to display</h3>
            <p>Go to the Admin dashboard to add projects!</p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="scroll-reveal">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
