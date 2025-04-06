// routes/inventory.js
const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// Get all inventory
router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.find({})
      .populate('product')
      .sort({ expiry_date: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory items expiring soon (within 7 days)
router.get('/expiring-soon', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 1);
    
    const expiringItems = await Inventory.find({
      expiry_date: { $gte: now, $lte: sevenDaysFromNow }
    })
      .populate('product')
      .sort({ expiry_date: 1 });
    
    res.json(expiringItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory by product ID
router.get('/product/:id', async (req, res) => {
  try {
    const inventory = await Inventory.find({ product: req.params.id })
      .sort({ expiry_date: 1 })
      .populate('product');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get total inventory amounts for each product
router.get('/summary', async (req, res) => {
  try {
    const summary = await Inventory.aggregate([
      {
        $group: {
          _id: "$product",
          totalAmount: { $sum: "$amount" },
          inventoryItems: { $count: {} },
          earliestExpiry: { $min: "$expiry_date" },
          latestExpiry: { $max: "$expiry_date" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          inventoryItems: 1,
          earliestExpiry: 1,
          latestExpiry: 1,
          productName: "$product.product_name",
          category: "$product.category",
          unit: "$product.unit"
        }
      },
      {
        $sort: { productName: 1 }
      }
    ]);
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new inventory
router.post('/', async (req, res) => {
  try {
    // Check if product exists
    const product = await Product.findById(req.body.product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const inventoryItem = new Inventory(req.body);
    const newInventory = await inventoryItem.save();
    
    // Return with populated product info
    const populatedInventory = await Inventory.findById(newInventory._id)
      .populate('product');
    
    res.status(201).json(populatedInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    // If product ID is being changed, verify it exists
    if (req.body.product) {
      const productExists = await Product.findById(req.body.product);
      if (!productExists) {
        return res.status(404).json({ message: 'Product not found' });
      }
    }
    
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('product');
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
