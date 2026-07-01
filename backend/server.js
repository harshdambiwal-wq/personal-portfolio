require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Ensure uploads folder exists (legacy support if needed, but not used for new projects)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// JWT Verification Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// --- ROUTES ---

// 1. Admin Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ error: 'Incorrect password' });
  }
});

// 2. Get All Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.all('SELECT * FROM projects ORDER BY createdAt DESC');
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Database error fetching projects' });
  }
});

// 3. Create a Project (Admin Protected - URL based thumbnail)
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { title, description, imageUrl, projectUrl, techStack, featured } = req.body;
    
    if (!title || !description || !imageUrl) {
      return res.status(400).json({ error: 'Title, description, and image URL are required' });
    }

    const featuredFlag = featured === true || featured === 'true' || featured === 1 || featured === '1' ? 1 : 0;

    const result = await db.run(
      'INSERT INTO projects (title, description, imageUrl, projectUrl, techStack, featured) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, imageUrl, projectUrl || '', techStack || '', featuredFlag]
    );

    const newProject = {
      id: result.id,
      title,
      description,
      imageUrl,
      projectUrl: projectUrl || '',
      techStack: techStack || '',
      featured: featuredFlag
    };

    res.status(201).json(newProject);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Database error creating project' });
  }
});

// 4. Update a Project (Admin Protected - URL based thumbnail)
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, projectUrl, techStack, featured } = req.body;

    if (!title || !description || !imageUrl) {
      return res.status(400).json({ error: 'Title, description, and image URL are required' });
    }

    // Check if project exists
    const projects = await db.all('SELECT id, imageUrl FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const featuredFlag = featured === true || featured === 'true' || featured === 1 || featured === '1' ? 1 : 0;

    // Delete old local image if it was local and we are replacing it
    const oldImageUrl = projects[0].imageUrl;
    if (oldImageUrl !== imageUrl && !oldImageUrl.startsWith('http')) {
      const oldFilename = path.basename(oldImageUrl);
      const oldFilepath = path.join(uploadsDir, oldFilename);
      if (fs.existsSync(oldFilepath)) {
        fs.unlinkSync(oldFilepath);
      }
    }

    await db.run(
      'UPDATE projects SET title = ?, description = ?, imageUrl = ?, projectUrl = ?, techStack = ?, featured = ? WHERE id = ?',
      [title, description, imageUrl, projectUrl || '', techStack || '', featuredFlag, id]
    );

    return res.json({ id, title, description, imageUrl, projectUrl, techStack, featured: featuredFlag });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Database error updating project' });
  }
});

// 5. Delete a Project (Admin Protected)
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find project to delete its image file from disk if it was local
    const projects = await db.all('SELECT imageUrl FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const imageUrl = projects[0].imageUrl;

    // Delete project from database
    await db.run('DELETE FROM projects WHERE id = ?', [id]);

    // Attempt to delete local file if it's local
    if (!imageUrl.startsWith('http')) {
      const filename = path.basename(imageUrl);
      const filepath = path.join(uploadsDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Database error deleting project' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
