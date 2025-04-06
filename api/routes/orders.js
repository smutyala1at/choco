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

router.post('/', async (req, res) => {
    try {
      console.log('Received order request:', JSON.stringify(req.body));
      
      // Check if customer exists
      const customer = await Customer.findById(req.body.customer);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Create a new array for processed items
      const processedItems = [];
      let calculatedTotalPrice = 0;
      
      // Process each item in the order
      for (const item of req.body.items) {
        // Get product from database
        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(404).json({ 
            message: `Product not found: ${item.product_id}` 
          });
        }
        
        console.log(`Found product:`, JSON.stringify(product));
        
        // Create a new item with all required fields
        const processedItem = {
          product_id: item.product_id,
          // Use product data from database, with fallbacks to ensure we have values
          product_name: item.product_name || 'Unknown Product',
          quantity: item.quantity,
          unit: product.unit,
          unit_price: product.default_price_per_unit
        };
        
        const itemTotal = processedItem.quantity * processedItem.unit_price;
        
        // Add to total price
        calculatedTotalPrice += itemTotal;
        
        console.log(`Processed item: ${processedItem.product_name}, price: ${processedItem.unit_price}, total: ${itemTotal}`);
        
        // Add to processed items array
        processedItems.push(processedItem);
      }
      
      // Create order object with processed items
      const orderData = {
        customer: req.body.customer,
        order_date: new Date(),
        delivery_date: req.body.delivery_date,
        items: processedItems,
        total_price: parseFloat(calculatedTotalPrice.toFixed(2)),
        // Set initial progress status
        progress: {
          status: 'received',
          updated_at: new Date()
        },
        delivery_window: req.body.delivery_window || 'standard'
      };
      
      // Ensure total_price is valid
      if (isNaN(orderData.total_price) || orderData.total_price === 0) {
        console.log('Warning: Total price calculation resulted in invalid value, setting minimum value');
        orderData.total_price = 0.01;
      }
      
      console.log('Final order data:', JSON.stringify(orderData));
      
      // Create and save the order
      const order = new Order(orderData);
      const newOrder = await order.save();
      
      // Return the complete order with populated fields
      const populatedOrder = await Order.findById(newOrder._id)
        .populate('customer')
        .populate('items.product_id');
        
      res.status(201).json(populatedOrder);
    } catch (error) {
      console.error('Order creation error:', error);
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
      product_name: product.product_name,
      quantity: req.body.quantity,
      unit_price: product.default_price_per_unit,
      discount_percent: req.body.discount_percent || 0
    };
    
    // Add item to order
    order.items.push(newItem);
    
    // Recalculate total price
    const newTotal = order.items.reduce((total, item) => {
      const discountMultiplier = 1 - (item.discount_percent / 100) || 1;
      return total + (item.quantity * item.unit_price * discountMultiplier);
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
      return total + (item.quantity * item.unit_price * discountMultiplier);
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
        // Ensure product_name is set from product
        item.product_name = product.product_name;
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