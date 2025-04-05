// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// Get all orders
router.get('/', async (req, res) => {
  try {
    // Filter by date range if provided
    const filter = {};
    if (req.query.startDate && req.query.endDate) {
      filter.order_date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .sort({ order_date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by status
router.get('/status/:status', async (req, res) => {
  try {
    const orders = await Order.find({ 'progress.status': req.params.status })
      .populate('customer', 'name phone')
      .sort({ delivery_date: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders for today's delivery
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const orders = await Order.find({
      delivery_date: { $gte: today, $lt: tomorrow }
    })
      .populate('customer', 'name phone address')
      .sort({ delivery_date: 1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific order with all details
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('items.product_id');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new order
router.post('/', async (req, res) => {
    try {
      // Check if customer exists
      const customer = await Customer.findById(req.body.customer);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Create a new order object from the request body
      const orderData = { ...req.body };
      
      // Calculate total price starting from 0
      let calculatedTotalPrice = 0;
      
      // Process each item in the order
      for (let i = 0; i < orderData.items.length; i++) {
        const item = orderData.items[i];
        
        // Get product from database
        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(404).json({ 
            message: `Product not found: ${item.product_id}` 
          });
        }
        
        // Set product data from database instead of trusting frontend
        orderData.items[i].product_name = product.name;
        orderData.items[i].unit_price = product.price;
        
        // Calculate item total with discount
        const discountMultiplier = 1 - (item.discount_percent || 0) / 100;
        const itemTotal = item.quantity * product.price * discountMultiplier;
        
        // Add to order total
        calculatedTotalPrice += itemTotal;
      }
      
      // Set the calculated total price
      orderData.total_price = parseFloat(calculatedTotalPrice.toFixed(2));
      
      // Create and save the order
      const order = new Order(orderData);
      const newOrder = await order.save();
      
      // Return the complete order with populated fields
      const populatedOrder = await Order.findById(newOrder._id)
        .populate('customer')
        .populate('items.product_id');
        
      res.status(201).json(populatedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        'progress.status': status,
        'progress.updated_at': new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add item to order
router.post('/:id/items', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Validate product exists
    const product = await Product.findById(req.body.product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Create new item
    const newItem = {
      product_id: req.body.product_id,
      item_name: product.item_name,
      amount: req.body.amount,
      unit_price: req.body.unit_price || product.default_price_per_unit,
      discount_percent: req.body.discount_percent || 0
    };
    
    // Add item to order
    order.items.push(newItem);
    
    // Recalculate total price
    const newTotal = order.items.reduce((total, item) => {
      const discountMultiplier = 1 - (item.discount_percent / 100) || 1;
      return total + (item.amount * item.unit_price * discountMultiplier);
    }, 0);
    
    order.total_price = newTotal;
    
    await order.save();
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove item from order
router.delete('/:orderId/items/:itemId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Find the item in the order
    const itemIndex = order.items.findIndex(item => 
      item._id.toString() === req.params.itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in order' });
    }
    
    // Remove the item
    order.items.splice(itemIndex, 1);
    
    // Recalculate total price
    const newTotal = order.items.reduce((total, item) => {
      const discountMultiplier = 1 - (item.discount_percent / 100) || 1;
      return total + (item.amount * item.unit_price * discountMultiplier);
    }, 0);
    
    order.total_price = newTotal;
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an order
router.put('/:id', async (req, res) => {
  try {
    // If customer is changed, verify it exists
    if (req.body.customer) {
      const customerExists = await Customer.findById(req.body.customer);
      if (!customerExists) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }
    
    // If items are provided, validate all products
    if (req.body.items) {
      for (let item of req.body.items) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(404).json({ 
            message: `Product not found: ${item.product_id}` 
          });
        }
        // Ensure item_name is set from product
        item.item_name = product.item_name;
      }
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only allow deletion of orders in specific states
    const allowedStates = ['received', 'cancelled'];
    if (!allowedStates.includes(order.progress.status)) {
      return res.status(400).json({ 
        message: `Cannot delete order in ${order.progress.status} state. Order must be in one of these states: ${allowedStates.join(', ')}` 
      });
    }
    
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;