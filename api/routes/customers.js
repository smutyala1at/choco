// routes/customers.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// Get all customers with optional phone filter
router.get('/', async (req, res) => {
  try {
    // Check if phone query parameter exists
    if (req.query.phone) {
      const customer = await Customer.findOne({ phone: req.query.phone });
      console.log(customer);
      if (!customer) {
        return res.status(404).json({ message: 'No customer found with this phone number' });
      }
      return res.json(customer);
    }
    
    // If no phone query parameter, return all customers
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer orders
router.get('/:id/orders', async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.id })
      .sort({ order_date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  try {
    // Check if a customer with this phone already exists
    const existingCustomer = await Customer.findOne({ phone: req.body.phone });
    if (existingCustomer) {
      return res.status(400).json({ 
        message: 'A customer with this phone number already exists' 
      });
    }
    
    const customer = new Customer(req.body);
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    // If phone is being updated, check it's not already used by another customer
    if (req.body.phone) {
      const existingCustomer = await Customer.findOne({ 
        phone: req.body.phone,
        _id: { $ne: req.params.id } // exclude current customer
      });
      
      if (existingCustomer) {
        return res.status(400).json({ 
          message: 'Another customer with this phone number already exists' 
        });
      }
    }
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    // Check if customer has any orders
    const orderExists = await Order.findOne({ customer: req.params.id });
    if (orderExists) {
      return res.status(400).json({ 
        message: 'Cannot delete customer with existing orders' 
      });
    }

    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;