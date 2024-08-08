const { Category } = require('../models/category');
const { Product } = require('../models/products');
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
});

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
        const count = await Product.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product count' });
    }
});


router.get('/', async (req, res) => {
    try {
        const productList = await Product.find().populate("category");
        if (!productList) {
            return res.status(500).json({ success: false });
        }
        res.send(productList);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/featured', async (req, res) => {
    const productList = await Product.find({isFeatured:true});
    if (!productList) { res.status(500).json({ success: false })
    }
    return res.status(200).json(productList);
    });

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(500).json({ message: 'The product with the given ID was not found.' });
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// router.post('/create', async (req, res) =>{

//     const category = await Category.findById(req.body.category);

//     if(!category) {
//     return res.status(404).send("invalid Category!");
//     }

//     const { default: pLimit } = await import('p-limit');
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

//         let product = new Product({
//             name:req.body.name,
//             description:req.body.description,
//             images: imgurl,
//             brand:req.body.brand,
//             price:req.body.price,
//             category:req.body.category,
//             countInStock:req.body.countInStock,
//             rating:req.body.rating,
//             numReviews: req.body.numReviews,
//             isFeatured: req.body.isFeatured,
//             });

//     product = await product.save();
//     if(!product){
//         res.status(500).json({
//             error: err,
//             success: false
//     })
//     }
//     res.status(201).json(product)
// });


router.post('/create', upload.array('images', 10), async (req, res) => {
  try {
      // Check if files are provided
      const files = req.files || [];

      // Validate images array
      if (files.length === 0) {
          return res.status(400).send("No images provided!");
      }

      // Process image uploads
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

      if (uploadStatus.length === 0) {
          return res.status(500).json({
              error: "Images cannot be uploaded!",
              status: false
          });
      }

      let product = new Product({
          name: req.body.name,
          description: req.body.description,
          images: imgurl,
          brand: req.body.brand,
          price: req.body.price,
          category: req.body.category,
          countInStockForSmall: req.body.countInStockForSmall,
          countInStockForMedium: req.body.countInStockForMedium,
          countInStockForLarge: req.body.countInStockForLarge,
          countInStockForExtraLarge: req.body.countInStockForExtraLarge,
          rating: req.body.rating,
          numReviews: req.body.numReviews,
          isFeatured: req.body.isFeatured,
      });

      product = await product.save();
      if (!product) {
          return res.status(500).json({
              error: "Product could not be saved!",
              success: false
          });
      }

      res.status(201).json(product);
  } catch (err) {
      console.error('Error uploading images:', err);
      res.status(500).json({
          error: "Internal Server Error",
          success: false
      });
  }
});
router.delete('/:id', async(req, res)=>{
    const deletProduct = await Product.findByIdAndDelete(req.params.id);
    if(!deletProduct) {
    return res.status(404).json({
    message: "product not found!",
    status:false
    })
    }
    res.status(200).send({
    message: "the product is deleted!",
    status:true
    })
    })


router.put('/:id', upload.array('images', 10), async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files || [];
  
        let imgurl = [];
        if (files.length > 0) {
            // Process image uploads
            const { default: pLimit } = await import('p-limit');
            const limit = pLimit(2);
            const imagesToUpload = files.map((file) => {
                return limit(async () => {
                    const result = await cloudinary.uploader.upload(file.path);
                    return result;
                });
            });
  
            const uploadStatus = await Promise.all(imagesToUpload);
            imgurl = uploadStatus.map((item) => item.secure_url);
        } else {
            // No new images were uploaded, use existing images if provided
            imgurl = req.body.images ? JSON.parse(req.body.images) : [];
        }
  
        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(id, {
            $set: {
                name: req.body.name,
                description: req.body.description,
                images: imgurl.length > 0 ? imgurl : req.body.images,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStockForSmall: req.body.countInStockForSmall,
                countInStockForMedium: req.body.countInStockForMedium,
                countInStockForLarge: req.body.countInStockForLarge,
                countInStockForExtraLarge: req.body.countInStockForExtraLarge,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured,
            }
        }, { new: true });
  
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
  
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
  });
  

  const uploadDir = path.join(__dirname, 'uploads');

router.delete('/api/images/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    fs.stat(filePath, (err) => {
        if (err) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete the file
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to delete file' });
            }
            res.status(200).json({ message: 'File deleted successfully' });
        });
    });
});
   

router.put('/count/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { size, countInStock } = req.body;

        // Validate the countInStock field
        if (countInStock === undefined || countInStock < 0) {
            return res.status(400).json({ message: 'Invalid countInStock value' });
        }

        // Create an update object based on the size
        let updateField;
        switch (size) {
            case 'S':
                updateField = { $inc: { countInStockForSmall: -countInStock } };
                break;
            case 'M':
                updateField = { $inc: { countInStockForMedium: -countInStock } };
                break;
            case 'L':
                updateField = { $inc: { countInStockForLarge: -countInStock } };
                break;
            case 'XL':
                updateField = { $inc: { countInStockForExtraLarge: -countInStock } };
                break;
            default:
                return res.status(400).json({ message: 'Invalid size value' });
        }

        // Find and update the product
        const product = await Product.findByIdAndUpdate(
            productId,
            updateField,
            { new: true } // Return the updated document
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error updating product stock:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




module.exports = router;
