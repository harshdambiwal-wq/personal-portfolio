import React from 'react';
import { API_BASE } from '../config';

export default function ProjectCard({ project }) {
  // Check if image path is absolute or relative
  const imageSrc = project.imageUrl.startsWith('http') 
    ? project.imageUrl 
    : `${API_BASE}${project.imageUrl}`;

  return (
    <article className="project-card">
      <div className="project-thumbnail">
        <img src={imageSrc} alt={project.title} loading="lazy" />
      </div>
      <div className="project-info">
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-desc">{project.description}</p>
        {project.projectUrl ? (
          <a 
            href={project.projectUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="project-card-link"
          >
            View Project <span>→</span>
          </a>
        ) : (
          <span className="project-card-link" style={{ cursor: 'default', opacity: 0.6 }}>
            Internal Project
          </span>
        )}
      </div>
    </article>
  );
}
