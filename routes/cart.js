const { Cart } = require('../models/cart');
const express = require('express');
const router = express.Router();

// Get all carts
router.get('/', async (req, res) => {
  try {
    const cartList = await Cart.find().populate('cartItems.product').populate('user');
    if (!cartList) {
      return res.status(500).json({ success: false });
    }
    res.send(cartList);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a specific cart by ID
router.get('/:id', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate('cartItems.product').populate('user');
    if (!cart) {
      return res.status(404).json({ message: 'The cart with the given ID was not found.' });
    }
    res.status(200).send(cart);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Express.js example route for fetching cart by user ID
router.get('/user/:userId', async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.params.userId }).populate('cartItems.product');
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found.' });
      }
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  

// Create a new cart
router.post('/create', async (req, res) => {
  try {
    const { cartItems, user, totalItemsPrice } = req.body;

    const cart = new Cart({
      cartItems,
      user,
      totalItemsPrice,
    });

    const createdCart = await cart.save();
    res.status(201).json(createdCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a cart by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCart = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedCart) {
      return res.status(404).json({ message: 'Cart not found!', status: false });
    }
    res.status(200).json({ message: 'The cart is deleted!', status: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a cart by ID
router.put('/:id', async (req, res) => {
  try {
    const { cartItems, user, totalItemsPrice } = req.body;

    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        cartItems,
        user,
        totalItemsPrice,
      },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(500).json({ message: 'Cart cannot be updated!', success: false });
    }

    res.send(updatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

router.put('/:userId', async (req, res) => {
    try {
      const { productId, quantity, itemPrice } = req.body;
      const userId = req.params.userId;
  
      let cart = await Cart.findOne({ user: userId });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found for this user.' });
      }
  
      const productIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);
  
      if (productIndex !== -1) {
        // Product exists, update the quantity and price
        cart.cartItems[productIndex].quantity += quantity;
      } else {
        // Product does not exist, add it to the cart
        cart.cartItems.push({ product: productId, quantity, itemPrice });
      }
  
      // Update the totalItemsPrice
      cart.totalItemsPrice = cart.cartItems.reduce((total, item) => total + item.itemPrice * item.quantity, 0);
  
      const updatedCart = await cart.save();
  
      res.status(200).send(updatedCart);
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  });

  
  

module.exports = router;
