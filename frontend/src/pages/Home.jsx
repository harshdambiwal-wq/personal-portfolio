import React, { useState, useEffect } from 'react';
import Bio from '../components/Bio';
import ProjectCard from '../components/ProjectCard';
import { API_BASE } from '../config';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

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

  // Scroll Reveal Animation Observer
  useEffect(() => {
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
  }, [projects]);

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
                <ProjectCard 
                  project={project} 
                  onOpenDetails={setSelectedProject} 
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Project Details Modal (Single Project Page / View) */}
      {selectedProject && (() => {
        const gallery = selectedProject.galleryImages
          ? selectedProject.galleryImages.split(',').map((url) => url.trim()).filter((url) => url.length > 0)
          : [];

        return (
          <div 
            className="modal-overlay" 
            onClick={() => setSelectedProject(null)}
          >
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedProject(null)}
                aria-label="Close details"
              >
                &times;
              </button>
              
              <img 
                src={selectedProject.imageUrl.startsWith('http') ? selectedProject.imageUrl : `${API_BASE}${selectedProject.imageUrl}`} 
                alt={selectedProject.title} 
                className="modal-image"
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span className={`status-badge status-${(selectedProject.status || 'Completed').toLowerCase()}`} style={{ position: 'static' }}>
                  {selectedProject.status || 'Completed'}
                </span>
              </div>

              <h2 className="project-card-title" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
                {selectedProject.title}
              </h2>
              
              <p className="project-card-desc" style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {selectedProject.description}
              </p>

              {/* Tools & Skills Used Section */}
              <h3 className="detail-section-title">Tools &amp; Skills Used</h3>
              <div className="detail-tags">
                {selectedProject.techStack ? (
                  selectedProject.techStack.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0).map((tag, index) => (
                    <span key={index} className="detail-tag-chip">
                      <span className="detail-tag-dot" />
                      {tag}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>None specified</span>
                )}
              </div>

              {/* Image Gallery Section */}
              {gallery.length > 0 && (
                <>
                  <h3 className="detail-gallery-title">Project Gallery</h3>
                  <div className="detail-gallery-grid">
                    {gallery.map((imgUrl, index) => (
                      <div 
                        key={index} 
                        className="gallery-thumb-container" 
                        onClick={() => setLightboxImage(imgUrl)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={imgUrl} alt={`Gallery view ${index + 1}`} className="gallery-thumb" />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '2rem' }}>
                {selectedProject.projectUrl && (
                  <a 
                    href={selectedProject.projectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary project-view-btn"
                    style={{ width: '100%', padding: '0.85rem', textAlign: 'center', display: 'block' }}
                  >
                    Visit Project Link
                  </a>
                )}
                
                {selectedProject.researchPaperUrl && (
                  <a 
                    href={selectedProject.researchPaperUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '0.85rem', textAlign: 'center', display: 'block' }}
                  >
                    📄 Read Research Paper
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Fullscreen Lightbox Overlay */}
      {lightboxImage && (
        <div 
          className="lightbox-overlay" 
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="lightbox-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="lightbox-close-btn" 
              onClick={() => setLightboxImage(null)}
              aria-label="Close image"
            >
              &times;
            </button>
            <img src={lightboxImage} alt="Fullscreen Project View" className="lightbox-image" />
          </div>
        </div>
      )}
    </>
  );
}
