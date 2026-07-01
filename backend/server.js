require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Ensure uploads folder exists
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

// Multer Storage Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'project-' + uniqueSuffix + ext);
  }
});

// Filter images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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

// 3. Create a Project (Admin Protected)
app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, projectUrl } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Project thumbnail image is required' });
    }

    // Save relative image URL (e.g. /uploads/filename.jpg)
    const imageUrl = `/uploads/${req.file.filename}`;

    const result = await db.run(
      'INSERT INTO projects (title, description, imageUrl, projectUrl) VALUES (?, ?, ?, ?)',
      [title, description, imageUrl, projectUrl || '']
    );

    const newProject = {
      id: result.id,
      title,
      description,
      imageUrl,
      projectUrl: projectUrl || ''
    };

    res.status(201).json(newProject);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Database error creating project' });
  }
});

// 4. Delete a Project (Admin Protected)
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find project to delete its image file from disk
    const projects = await db.all('SELECT imageUrl FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const imageUrl = projects[0].imageUrl;
    const filename = path.basename(imageUrl);
    const filepath = path.join(uploadsDir, filename);

    // Delete project from database
    await db.run('DELETE FROM projects WHERE id = ?', [id]);

    // Attempt to delete file
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
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
