const { Sale } = require('../models/sales');
const express = require('express');
const router = express.Router();

// Get count of sales
router.get('/count', async (req, res) => {
    try {
        const count = await Sale.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales count' });
    }
});

// Get all sales
// router.get('/', async (req, res) => {
//     try {
//         const salesList = await Sale.find().populate('products.product').populate('user');
//         if (!salesList) {
//             return res.status(500).json({ success: false });
//         }
//         res.send(salesList);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// Example route with enhanced error handling
router.get('/', async (req, res) => {
    try {
        const salesList = await Sale.find().populate('orderItems.product').populate('user');
        res.json(salesList);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ message: 'Failed to fetch sales', error: error.message });
    }
});



// Get a specific sale by ID
router.get('/:id', async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id).populate('products.product').populate('user');
        if (!sale) {
            return res.status(404).json({ message: 'The sale with the given ID was not found.' });
        }
        res.status(200).send(sale);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new sale
router.post('/create', async (req, res) => {
    try {
        const { orderId, orderItems, totalAmount, user } = req.body;

        const sale = new Sale({
            orderId,
            orderItems,
            totalAmount,
            user
        });

        const savedSale = await sale.save();
        if (!savedSale) {
            return res.status(500).json({ error: 'Failed to create the sale', success: false });
        }

        res.status(201).json(savedSale);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a sale by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedSale = await Sale.findByIdAndDelete(req.params.id);
        if (!deletedSale) {
            return res.status(404).json({ message: 'Sale not found!', status: false });
        }
        res.status(200).json({ message: 'The sale is deleted!', status: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update a sale by ID
router.put('/:id', async (req, res) => {
    try {
        const { orderId, orderItems, totalAmount, user } = req.body;

        const updatedSale = await Sale.findByIdAndUpdate(
            req.params.id,
            {
                orderId,
                orderItems,
                totalAmount,
                user
            },
            { new: true }
        );

        if (!updatedSale) {
            return res.status(500).json({ message: 'Sale cannot be updated!', success: false });
        }

        res.send(updatedSale);
    } catch (error) {
        console.error('Error updating sale:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;
