const express = require('express');
const router = express.Router();
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB for videos
});

// Extract Audio from Video
router.post('/extract-audio', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع ملف فيديو'
            });
        }

        const outputPath = path.join('uploads', `audio-${Date.now()}.mp3`);

        ffmpeg(req.file.path)
            .output(outputPath)
            .audioCodec('libmp3lame')
            .audioBitrate('192k')
            .on('end', () => {
                // Clean up video file
                fs.unlinkSync(req.file.path);

                res.json({
                    success: true,
                    message: 'تم استخراج الصوت بنجاح',
                    data: {
                        downloadUrl: `/uploads/${path.basename(outputPath)}`,
                        format: 'MP3',
                        bitrate: '192kbps'
                    }
                });
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                fs.unlinkSync(req.file.path);

                res.status(500).json({
                    success: false,
                    message: 'حدث خطأ أثناء استخراج الصوت'
                });
            })
            .run();

    } catch (error) {
        console.error('Video processing error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء معالجة الفيديو'
        });
    }
});

// Convert Video Format
router.post('/convert', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع ملف فيديو'
            });
        }

        const format = req.body.format || 'mp4';
        const outputPath = path.join('uploads', `converted-${Date.now()}.${format}`);

        ffmpeg(req.file.path)
            .output(outputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .on('end', () => {
                fs.unlinkSync(req.file.path);

                res.json({
                    success: true,
                    message: `تم تحويل الفيديو إلى ${format.toUpperCase()} بنجاح`,
                    data: {
                        downloadUrl: `/uploads/${path.basename(outputPath)}`,
                        format: format.toUpperCase()
                    }
                });
            })
            .on('error', (err) => {
                console.error('FFmpeg conversion error:', err);
                fs.unlinkSync(req.file.path);

                res.status(500).json({
                    success: false,
                    message: 'حدث خطأ أثناء تحويل الفيديو'
                });
            })
            .run();

    } catch (error) {
        console.error('Video conversion error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحويل الفيديو'
        });
    }
});

// Compress Video
router.post('/compress', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع ملف فيديو'
            });
        }

        const outputPath = path.join('uploads', `compressed-${Date.now()}.mp4`);
        const quality = req.body.quality || 'medium';

        let crf = 23; // Default
        if (quality === 'high') crf = 18;
        if (quality === 'low') crf = 28;

        ffmpeg(req.file.path)
            .output(outputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .addOption('-crf', crf)
            .on('end', () => {
                const originalSize = fs.statSync(req.file.path).size;
                const compressedSize = fs.statSync(outputPath).size;
                const savings = ((1 - compressedSize / originalSize) * 100).toFixed(2);

                fs.unlinkSync(req.file.path);

                res.json({
                    success: true,
                    message: 'تم ضغط الفيديو بنجاح',
                    data: {
                        originalSize: (originalSize / (1024 * 1024)).toFixed(2) + ' MB',
                        compressedSize: (compressedSize / (1024 * 1024)).toFixed(2) + ' MB',
                        savings: savings + '%',
                        downloadUrl: `/uploads/${path.basename(outputPath)}`
                    }
                });
            })
            .on('error', (err) => {
                console.error('FFmpeg compression error:', err);
                fs.unlinkSync(req.file.path);

                res.status(500).json({
                    success: false,
                    message: 'حدث خطأ أثناء ضغط الفيديو'
                });
            })
            .run();

    } catch (error) {
        console.error('Video compression error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء ضغط الفيديو'
        });
    }
});

module.exports = router;
