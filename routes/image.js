// routes/products.js or similar
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

router.post('/upload-images', upload.array('images'), async (req, res) => {
    try {
        const imageUrls = [];
        const uploadPromises = req.files.map(file => {
            return cloudinary.uploader.upload(file.path)
                .then(result => {
                    imageUrls.push(result.secure_url);
                    fs.unlinkSync(file.path); // Clean up temporary file
                });
        });

        await Promise.all(uploadPromises);

        res.json({ status: 'success', imageUrls });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
