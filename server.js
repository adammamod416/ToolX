const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images, PDFs, and videos
        const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|avi|mov|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('نوع الملف غير مدعوم!'));
        }
    }
});

// Import route handlers
const imageRoutes = require('./routes/imageRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const videoRoutes = require('./routes/videoRoutes');
const passwordRoutes = require('./routes/passwordRoutes');

// Routes
app.use('/api/image', imageRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/password', passwordRoutes);

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'ToolX Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'حدث خطأ في الخادم'
    });
});

// Start server (only in local environment, not on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`
    ╔═══════════════════════════════════════╗
    ║   🔧 ToolX Server is Running! 🔧     ║
    ╠═══════════════════════════════════════╣
    ║   Port: ${PORT}                          ║
    ║   URL: http://localhost:${PORT}         ║
    ║   Status: ✅ Active                    ║
    ╚═══════════════════════════════════════╝
        `);
    });
}

module.exports = app;
