const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const PDFKit = require('pdfkit');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Convert Images to PDF
router.post('/images-to-pdf', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع أي صور'
            });
        }

        const pdfDoc = await PDFDocument.create();

        for (const file of req.files) {
            // Read image
            const imageBuffer = fs.readFileSync(file.path);

            // Determine image type and embed
            let image;
            const ext = path.extname(file.originalname).toLowerCase();

            if (ext === '.png') {
                image = await pdfDoc.embedPng(imageBuffer);
            } else {
                // Convert to JPEG if needed
                const jpegBuffer = await sharp(imageBuffer).jpeg().toBuffer();
                image = await pdfDoc.embedJpg(jpegBuffer);
            }

            // Add page with image dimensions
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });

            // Clean up uploaded file
            fs.unlinkSync(file.path);
        }

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const outputPath = path.join('uploads', `images-to-pdf-${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, pdfBytes);

        res.json({
            success: true,
            message: 'تم تحويل الصور إلى PDF بنجاح',
            data: {
                downloadUrl: `/uploads/${path.basename(outputPath)}`,
                pageCount: req.files.length
            }
        });

    } catch (error) {
        console.error('Images to PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحويل الصور إلى PDF'
        });
    }
});

// Merge PDF Files
router.post('/merge', upload.array('pdfs', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'يجب رفع ملفين PDF على الأقل'
            });
        }

        const mergedPdf = await PDFDocument.create();

        for (const file of req.files) {
            const pdfBytes = fs.readFileSync(file.path);
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));

            // Clean up
            fs.unlinkSync(file.path);
        }

        const mergedPdfBytes = await mergedPdf.save();
        const outputPath = path.join('uploads', `merged-${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, mergedPdfBytes);

        res.json({
            success: true,
            message: 'تم دمج ملفات PDF بنجاح',
            data: {
                downloadUrl: `/uploads/${path.basename(outputPath)}`,
                totalPages: mergedPdf.getPageCount()
            }
        });

    } catch (error) {
        console.error('PDF merge error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء دمج ملفات PDF'
        });
    }
});

// Split PDF
router.post('/split', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع ملف PDF'
            });
        }

        const pdfBytes = fs.readFileSync(req.file.path);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pageCount = pdfDoc.getPageCount();

        const outputFiles = [];

        // Split each page into separate PDF
        for (let i = 0; i < pageCount; i++) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(copiedPage);

            const newPdfBytes = await newPdf.save();
            const outputPath = path.join('uploads', `split-page-${i + 1}-${Date.now()}.pdf`);
            fs.writeFileSync(outputPath, newPdfBytes);

            outputFiles.push({
                page: i + 1,
                url: `/uploads/${path.basename(outputPath)}`
            });
        }

        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: 'تم تقسيم ملف PDF بنجاح',
            data: {
                totalPages: pageCount,
                files: outputFiles
            }
        });

    } catch (error) {
        console.error('PDF split error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تقسيم ملف PDF'
        });
    }
});

// Compress PDF
router.post('/compress', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع ملف PDF'
            });
        }

        const pdfBytes = fs.readFileSync(req.file.path);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Save with compression
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50,
        });

        const outputPath = path.join('uploads', `compressed-${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, compressedBytes);

        const originalSize = req.file.size;
        const compressedSize = compressedBytes.length;
        const savings = ((1 - compressedSize / originalSize) * 100).toFixed(2);

        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: 'تم ضغط ملف PDF بنجاح',
            data: {
                originalSize: (originalSize / 1024).toFixed(2) + ' KB',
                compressedSize: (compressedSize / 1024).toFixed(2) + ' KB',
                savings: savings + '%',
                downloadUrl: `/uploads/${path.basename(outputPath)}`
            }
        });

    } catch (error) {
        console.error('PDF compression error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء ضغط ملف PDF'
        });
    }
});

module.exports = router;
