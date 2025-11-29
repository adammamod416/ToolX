const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configure multer
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Image Compression Endpoint
router.post('/compress', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع أي صورة'
            });
        }

        const quality = parseInt(req.body.quality) || 80;
        const outputPath = path.join('uploads', `compressed-${Date.now()}.jpg`);

        // Get original file size
        const originalSize = req.file.size;

        // Compress image using Sharp
        await sharp(req.file.path)
            .jpeg({ quality: quality })
            .toFile(outputPath);

        // Get compressed file size
        const compressedStats = fs.statSync(outputPath);
        const compressedSize = compressedStats.size;

        // Calculate savings
        const savings = ((1 - compressedSize / originalSize) * 100).toFixed(2);

        // Clean up original file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: 'تم ضغط الصورة بنجاح',
            data: {
                originalSize: (originalSize / 1024).toFixed(2) + ' KB',
                compressedSize: (compressedSize / 1024).toFixed(2) + ' KB',
                savings: savings + '%',
                downloadUrl: `/uploads/${path.basename(outputPath)}`
            }
        });

    } catch (error) {
        console.error('Image compression error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء ضغط الصورة'
        });
    }
});

// Image Resize Endpoint
router.post('/resize', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع أي صورة'
            });
        }

        const width = parseInt(req.body.width) || 800;
        const height = parseInt(req.body.height) || 600;
        const outputPath = path.join('uploads', `resized-${Date.now()}.jpg`);

        await sharp(req.file.path)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFile(outputPath);

        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: 'تم تغيير حجم الصورة بنجاح',
            data: {
                downloadUrl: `/uploads/${path.basename(outputPath)}`,
                dimensions: `${width}x${height}`
            }
        });

    } catch (error) {
        console.error('Image resize error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تغيير حجم الصورة'
        });
    }
});

// Convert Image Format
router.post('/convert', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع أي صورة'
            });
        }

        const format = req.body.format || 'png';
        const outputPath = path.join('uploads', `converted-${Date.now()}.${format}`);

        await sharp(req.file.path)
            .toFormat(format)
            .toFile(outputPath);

        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: `تم تحويل الصورة إلى ${format.toUpperCase()} بنجاح`,
            data: {
                downloadUrl: `/uploads/${path.basename(outputPath)}`,
                format: format.toUpperCase()
            }
        });

    } catch (error) {
        console.error('Image conversion error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحويل الصورة'
        });
    }
});

module.exports = router;
