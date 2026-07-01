import React from 'react';
import { API_BASE } from '../config';

export default function ProjectCard({ project }) {
  // Check if image path is absolute or relative
  const imageSrc = project.imageUrl.startsWith('http') 
    ? project.imageUrl 
    : `${API_BASE}${project.imageUrl}`;

  // Parse tech stack tags
  const tags = project.techStack 
    ? project.techStack.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
    : [];

  return (
    <article className="project-card">
      <div className="project-thumbnail">
        <img src={imageSrc} alt={project.title} loading="lazy" />
        {project.featured === 1 && (
          <span className="featured-badge">⭐ Featured</span>
        )}
      </div>
      <div className="project-info">
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-desc">{project.description}</p>
        
        {/* Render Tech Stack Tags */}
        {tags.length > 0 && (
          <div className="project-tags">
            {tags.map((tag, index) => (
              <span key={index} className="project-tag-pill">{tag}</span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          {project.projectUrl ? (
            <a 
              href={project.projectUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary project-view-btn"
              style={{ width: '100%' }}
            >
              View Project
            </a>
          ) : (
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', cursor: 'default' }}
              disabled
            >
              Internal Project
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
