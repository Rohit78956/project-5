const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an audio file!'), false);
        }
    }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); // Serve static files from root
app.use('/uploads', express.static('uploads'));

// Simple authentication - just for demo purposes
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // Demo user
    if (email === 'demo@example.com' && password === 'demo123') {
        const token = jwt.sign({ id: 1, email }, 'demo_secret_key');
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Song routes
app.post('/api/songs', upload.single('file'), (req, res) => {
    try {
        const { title, artist, album } = req.body;
        const filePath = req.file.path;
        
        res.status(201).json({
            id: Date.now(),
            title,
            artist,
            album,
            file_path: filePath
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/songs', (req, res) => {
    try {
        const uploadDir = 'uploads/';
        const files = fs.readdirSync(uploadDir);
        const songs = files.map(file => ({
            id: file.split('-')[0],
            title: file,
            file_path: path.join(uploadDir, file)
        }));
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 