import React, { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

export default function Admin({ setCurrentTab }) {
  const [projects, setProjects] = useState([]);
  
  // Form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [featured, setFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  // Edit mode tracking
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const token = localStorage.getItem('adminToken');

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      setCurrentTab('login');
    } else {
      fetchProjects();
    }
  }, [token]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setCurrentTab('home');
  };

  const handleEditClick = (project) => {
    setEditMode(true);
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setProjectUrl(project.projectUrl || '');
    setTechStack(project.techStack || '');
    setFeatured(project.featured === 1);
    setImageUrl(project.imageUrl || '');
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const resetForm = () => {
    setEditMode(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setProjectUrl('');
    setTechStack('');
    setFeatured(false);
    setImageUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !imageUrl) {
      setSubmitError('Title, description, and thumbnail image URL are required.');
      return;
    }

    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const payload = {
      title,
      description,
      projectUrl,
      techStack,
      featured,
      imageUrl
    };

    try {
      const url = editMode 
        ? `${API_BASE}/api/projects/${editingId}`
        : `${API_BASE}/api/projects`;
      
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setSubmitSuccess(true);
      resetForm();
      fetchProjects();
    } catch (err) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      if (editingId === id) {
        resetForm();
      }

      fetchProjects();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!token) return null;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      <div className="admin-grid">
        {/* Form Panel */}
        <div className="admin-panel">
          <h2 className="admin-panel-title">
            {editMode ? 'Edit Project Details' : 'Add New Project'}
          </h2>
          
          {submitSuccess && (
            <div className="alert alert-success">
              🎉 Project {editMode ? 'updated' : 'added'} successfully!
            </div>
          )}

          {submitError && (
            <div className="alert alert-danger">
              ⚠️ {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Project Title *</label>
              <input 
                type="text" 
                id="title" 
                className="form-input" 
                placeholder="E.g. Fixed-Wing UAV Platform"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Short Description *</label>
              <textarea 
                id="description" 
                className="form-input" 
                placeholder="Provide a brief summary of the project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="techStack">Tech Stack / Tools (Comma-separated)</label>
              <input 
                type="text" 
                id="techStack" 
                className="form-input" 
                placeholder="E.g. ROS, Isaac Sim, Unity, CAD"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="projectUrl">Project URL (Demo/GitHub Link)</label>
              <input 
                type="url" 
                id="projectUrl" 
                className="form-input" 
                placeholder="https://github.com/username/project"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
              <input 
                type="checkbox" 
                id="featured" 
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label className="form-label" htmlFor="featured" style={{ margin: 0, cursor: 'pointer' }}>
                Mark as Featured Project
              </label>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="imageUrl">Thumbnail Image URL *</label>
              <input 
                type="url" 
                id="imageUrl" 
                className="form-input" 
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? 'Processing...' : editMode ? 'Save Changes' : 'Publish Project'}
              </button>
              {editMode && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div className="admin-panel">
          <h2 className="admin-panel-title">Manage Projects</h2>
          
          {listLoading && <p style={{ color: 'var(--text-secondary)' }}>Loading projects...</p>}
          
          {!listLoading && projects.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
              No projects uploaded yet.
            </p>
          )}

          {!listLoading && projects.length > 0 && (
            <div className="admin-project-list">
              {projects.map((project) => (
                <div key={project.id} className="admin-project-item">
                  <div className="admin-project-meta">
                    <img 
                      src={project.imageUrl.startsWith('http') ? project.imageUrl : `${API_BASE}${project.imageUrl}`} 
                      alt={project.title} 
                      className="admin-project-img"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="admin-project-name">{project.title}</span>
                      {project.featured === 1 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: '600' }}>
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEditClick(project)} 
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)} 
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
