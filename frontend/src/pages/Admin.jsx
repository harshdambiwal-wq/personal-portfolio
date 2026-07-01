import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function Admin({ setCurrentTab }) {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [image, setImage] = useState(null);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !image) {
      setSubmitError('Title, description, and thumbnail image are required.');
      return;
    }

    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('projectUrl', projectUrl);
    formData.append('image', image);

    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      setProjectUrl('');
      setImage(null);
      
      // Reset file input element
      const fileInput = document.getElementById('image-input');
      if (fileInput) fileInput.value = '';
      
      // Refresh list
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

      // Refresh list
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
        {/* Upload Panel */}
        <div className="admin-panel">
          <h2 className="admin-panel-title">Add New Project</h2>
          
          {submitSuccess && (
            <div className="alert alert-success">
              🎉 Project added successfully!
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
                placeholder="E.g. E-Commerce Platform"
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

            <div className="form-group">
              <label className="form-label" htmlFor="image-input">Thumbnail Image *</label>
              <input 
                type="file" 
                id="image-input" 
                className="form-input" 
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Publish Project'}
            </button>
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
                    <span className="admin-project-name">{project.title}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(project.id)} 
                    className="btn btn-danger"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
