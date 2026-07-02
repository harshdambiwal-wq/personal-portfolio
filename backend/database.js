const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create projects table with status, galleryImages, researchPaperUrl
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        projectUrl TEXT,
        techStack TEXT,
        featured INTEGER DEFAULT 0,
        galleryImages TEXT,
        researchPaperUrl TEXT,
        status TEXT DEFAULT 'Completed',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Projects table initialized.');
        seedDefaultProjects();
      }
    });
  });
}

function seedDefaultProjects() {
  db.get('SELECT COUNT(*) as count FROM projects', (err, row) => {
    if (err) {
      console.error('Error checking project count:', err.message);
      return;
    }
    if (!row || row.count === 0) {
      console.log('Database empty. Seeding default projects...');
      const defaultProjects = [
        {
          title: 'Bi-Directional Digital Twin of SCARA Robot',
          description: 'Built a real-time digital twin using ROS and NVIDIA Isaac Sim. Bidirectional communication between physical robot and simulation.',
          imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
          projectUrl: 'https://github.com/harshdambiwal-wq',
          techStack: 'ROS, Isaac Sim, MATLAB, Unity, Fusion360',
          featured: 1,
          status: 'Ongoing',
          researchPaperUrl: 'https://arxiv.org',
          galleryImages: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1581092229883-7b3c1c8a2475?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'VTOL UAV Design – SAE DDC',
          description: 'Designed a two-motor VTOL UAV with aerodynamic analysis using XFLR5. Tools: CAD, XFLR5, Fusion360. Achieved AIR 1 at national level competition.',
          imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
          projectUrl: 'https://github.com/harshdambiwal-wq',
          techStack: 'CAD, XFLR5, Fusion360, Aerodynamics',
          featured: 1,
          status: 'Completed',
          researchPaperUrl: '',
          galleryImages: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Improved Cold Storage System for Onion',
          description: 'Designed ventilation crate and validated using ANSYS Workbench simulation to optimize airflow and temperature regulation.',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          projectUrl: 'https://github.com/harshdambiwal-wq',
          techStack: 'ANSYS Workbench, CAD, CFD, Thermal Analysis',
          featured: 0,
          status: 'Completed',
          researchPaperUrl: '',
          galleryImages: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Dye Sensitized Solar Cell Holder Design',
          description: 'Adjustable DSSC holder for optimal light alignment and maximum energy absorption.',
          imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80',
          projectUrl: 'https://github.com/harshdambiwal-wq',
          techStack: 'CAD, Renewable Energy, Solar Cell',
          featured: 0,
          status: 'Completed',
          researchPaperUrl: '',
          galleryImages: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80'
        }
      ];

      const stmt = db.prepare('INSERT INTO projects (title, description, imageUrl, projectUrl, techStack, featured, status, researchPaperUrl, galleryImages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      defaultProjects.forEach((p) => {
        stmt.run(p.title, p.description, p.imageUrl, p.projectUrl, p.techStack, p.featured, p.status, p.researchPaperUrl, p.galleryImages);
      });
      stmt.finalize();
      console.log('Seeded 4 default projects.');
    }
  });
}

// Helper query functions wrapped in Promises
function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  db,
  all,
  run
};
