const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv/config'); // Ensure environment variables are loaded

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save the uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Rename the file to avoid name conflicts
    }
});

const upload = multer({ storage: storage });

router.get('/count', async (req, res) => {
    try {
        const count = await Category.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category count' });
    }
});

router.get('/', async (req, res) => {
    try {
        const categoryList = await Category.find();
        if (!categoryList) {
            return res.status(500).json({ success: false });
        }
        res.send(categoryList);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(500).json({ message: 'The category with the given ID was not found.' });
        }
        res.status(200).send(category);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({
                message: 'Category not found!',
                success: false
            });
        }
        res.status(200).json({
            success: true,
            message: 'Category Deleted!'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// router.post('/create', async (req, res) => {
//     try {
//         const { default: pLimit } = await import('p-limit');
//         const limit = pLimit(2);
//         const imagesToUpload = req.body.images.map((image) => {
//             return limit(async () => {
//                 const result = await cloudinary.uploader.upload(image);
//                 return result;
//             });
//         });

//         const uploadStatus = await Promise.all(imagesToUpload);
//         const imgurl = uploadStatus.map((item) => item.secure_url);

//         if (!uploadStatus) {
//             return res.status(500).json({
//                 error: "images cannot upload!",
//                 status: false
//             });
//         }

//         let category = new Category({
//             name: req.body.name,
//             images: imgurl,
//             color: req.body.color
//         });

//         if (!category) {
//             return res.status(500).json({
//                 error: "Category creation failed!",
//                 success: false
//             });
//         }

//         category = await category.save();
//         res.status(201).json(category);
//     } catch (error) {
//         console.error('Error creating category:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
//     }
// });

router.post('/create', upload.array('images', 10), async (req, res) => {
    try {
        const files = req.files || [];

        if (files.length === 0) {
            return res.status(400).send("No images provided!");
        }

        const { default: pLimit } = await import('p-limit');
        const limit = pLimit(2);
        const imagesToUpload = files.map((file) => {
            return limit(async () => {
                const result = await cloudinary.uploader.upload(file.path);
                return result;
            });
        });

        const uploadStatus = await Promise.all(imagesToUpload);
        const imgurl = uploadStatus.map((item) => item.secure_url);

        let category = new Category({
            name: req.body.name,
            images: imgurl,
            color: req.body.color
        });

        category = await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});

// router.put('/:id', async (req, res) => {
//     try {
//         const { default: pLimit } = await import('p-limit');
//         const limit = pLimit(2);
//         const imagesToUpload = req.body.images.map((image) => {
//             return limit(async () => {
//                 const result = await cloudinary.uploader.upload(image);
//                 return result;
//             });
//         });

//         const uploadStatus = await Promise.all(imagesToUpload);
//         const imgurl = uploadStatus.map((item) => item.secure_url);

//         if (!uploadStatus) {
//             return res.status(500).json({
//                 error: "images cannot upload!",
//                 status: false
//             });
//         }

//         const category = await Category.findByIdAndUpdate(
//             req.params.id,
//             {
//                 name: req.body.name,
//                 images: imgurl,
//                 color: req.body.color
//             },
//             { new: true }
//         );

//         if (!category) {
//             return res.status(500).json({
//                 message: 'Category cannot be updated!',
//                 success: false
//             });
//         }

//         res.send(category);
//     } catch (error) {
//         console.error('Error updating category:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
//     }
// });

router.put('/:id', upload.array('images', 10), async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files || [];

        if (files.length === 0 && !req.body.images) {
            return res.status(400).send("No images provided!");
        }

        const { default: pLimit } = await import('p-limit');
        const limit = pLimit(2);
        const imagesToUpload = files.map((file) => {
            return limit(async () => {
                const result = await cloudinary.uploader.upload(file.path);
                return result;
            });
        });

        const uploadStatus = await Promise.all(imagesToUpload);
        const imgurl = uploadStatus.map((item) => item.secure_url);

        const updatedCategory = await Category.findByIdAndUpdate(id, {
            $set: {
                name: req.body.name,
                images: imgurl.length > 0 ? imgurl : req.body.images,
                color: req.body.color
            }
        }, { new: true });

        if (!updatedCategory) {
            return res.status(500).json({
                message: 'Category cannot be updated!',
                success: false
            });
        }

        res.send(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});


module.exports = router;
