// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');

// Get all products
router.get('/', async (req, res) => {
  try {
    // Allow filtering by category
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product inventory
router.get('/:id/inventory', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const inventory = await Inventory.find({ product: product._id })
      .sort({ expiry_date: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ item_name: req.body.item_name });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }
    
    const product = new Product(req.body);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    // Check if there's any inventory for this product
    const inventoryExists = await Inventory.findOne({ product: req.params.id });
    if (inventoryExists) {
      return res.status(400).json({ 
        message: 'Cannot delete product with existing inventory. Remove inventory first.' 
      });
    }
    
    // Check if product is used in any orders
    const orderExists = await Order.findOne({ "items.product_id": req.params.id });
    if (orderExists) {
      return res.status(400).json({ 
        message: 'Cannot delete product that is used in orders.' 
      });
    }
    
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
