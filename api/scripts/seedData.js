// scripts/seedData.js
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
require('dotenv').config();

const connectDB = require('../config/db');

// Connect to database
connectDB();

// Sample data
const sampleData = {
  customers: [
    {
      name: "Bistro Verde",
      address: {
        street: "123 Olive Rd",
        city: "Lisbon",
        postal_code: "1100-123",
        country: "Portugal"
      },
      phone: "351912345678"
    },
    {
      "name": "Café Aurora",
      "address": {
        "street": "78 Sunlight Avenue",
        "city": "Porto",
        "postal_code": "4050-456",
        "country": "Portugal"
      },
      "phone": "4915236315235"
    }    
  ],
  products: [
    { "product_name": "Roma Tomatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 5.8 },
    { "product_name": "Roma Canned Tomatoes", "category": "Vegetables", "unit": "can", "default_price_per_unit": 2.8 },
    { "product_name": "Chopped Roma Tomatoes", "category": "Vegetables", "unit": "jar", "default_price_per_unit": 3.0 },
    { "product_name": "Organic Roma Tomatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 6.0 },
    { "product_name": "Roma Tomato Paste", "category": "Vegetables", "unit": "jar", "default_price_per_unit": 3.2 },
  
    { "product_name": "Baby Spinach", "category": "Leafy Greens", "unit": "kg", "default_price_per_unit": 12.0 },
    { "product_name": "Fresh Baby Spinach", "category": "Leafy Greens", "unit": "kg", "default_price_per_unit": 12.5 },
    { "product_name": "Spinach Leaves", "category": "Leafy Greens", "unit": "kg", "default_price_per_unit": 11.5 },
    { "product_name": "Chopped Spinach", "category": "Leafy Greens", "unit": "pack", "default_price_per_unit": 10.0 },
    { "product_name": "Frozen Baby Spinach", "category": "Leafy Greens", "unit": "pack", "default_price_per_unit": 9.5 },
  
    { "product_name": "Fresh Basil", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 3.0 },
    { "product_name": "Basil Leaves", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 3.2 },
    { "product_name": "Sweet Basil", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 3.1 },
    { "product_name": "Organic Fresh Basil", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 3.5 },
    { "product_name": "Basil (Fresh)", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 3.0 },
  
    { "product_name": "Thai Basil", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 3.5 },
    { "product_name": "Chopped Thai Basil", "category": "Herbs", "unit": "pack", "default_price_per_unit": 3.8 },
    { "product_name": "Thai Basil Leaves", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 3.6 },
    { "product_name": "Organic Thai Basil", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 4.0 },
    { "product_name": "Fresh Thai Basil", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 3.5 },
  
    { "product_name": "Yukon Gold Potatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 4.5 },
    { "product_name": "Organic Yukon Gold Potatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 5.0 },
    { "product_name": "Yellow Potatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 4.3 },
    { "product_name": "Yukon Potatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 4.4 },
    { "product_name": "Gold Potatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 4.2 },
  
    { "product_name": "Zucchini", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 5.5 },
    { "product_name": "Yellow Zucchini", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 5.8 },
    { "product_name": "Grilled Zucchini", "category": "Vegetables", "unit": "tray", "default_price_per_unit": 6.2 },
    { "product_name": "Sliced Zucchini", "category": "Vegetables", "unit": "tray", "default_price_per_unit": 6.0 },
    { "product_name": "Courgette", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 5.6 },
  
    { "product_name": "Red Bell Peppers", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 16.5 },
    { "product_name": "Sweet Red Bell Peppers", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 16.8 },
    { "product_name": "Red Pepper Strips", "category": "Vegetables", "unit": "pack", "default_price_per_unit": 17.0 },
    { "product_name": "Roasted Red Peppers", "category": "Vegetables", "unit": "jar", "default_price_per_unit": 6.5 },
    { "product_name": "Organic Red Bell Peppers", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 17.2 },
  
    { "product_name": "Avocados", "category": "Fruits", "unit": "kg", "default_price_per_unit": 15.5 },
    { "product_name": "Large Avocados", "category": "Fruits", "unit": "kg", "default_price_per_unit": 15.8 },
    { "product_name": "Hass Avocados", "category": "Fruits", "unit": "kg", "default_price_per_unit": 16.0 },
    { "product_name": "Ripe Avocados", "category": "Fruits", "unit": "kg", "default_price_per_unit": 15.7 },
    { "product_name": "Organic Avocados", "category": "Fruits", "unit": "kg", "default_price_per_unit": 16.3 },
  
    { "product_name": "Cherry Tomatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 6.2 },
    { "product_name": "Grape Tomatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 6.0 },
    { "product_name": "Mini Roma Tomatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 5.8 },
    { "product_name": "Organic Cherry Tomatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 6.5 },
    { "product_name": "Mixed Baby Tomatoes", "category": "Vegetables", "unit": "kg", "default_price_per_unit": 6.4 },
  
    { "product_name": "Cilantro", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 2.5 },
    { "product_name": "Fresh Cilantro", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 2.6 },
    { "product_name": "Coriander Leaves", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 2.4 },
    { "product_name": "Organic Cilantro", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 2.9 },
    { "product_name": "Cilantro (Coriander)", "category": "Herbs", "unit": "bunch", "default_price_per_unit": 2.5 }
  ],  
  inventory: [
    {
      product_name: "Fresh Basil",
      quantity: 5,
      expiry_date: "2025-04-10T09:00:00Z"
    },
    {
      product_name: "Thai Basil",
      quantity: 15,
      expiry_date: "2025-04-11T09:00:00Z"
    },
    {
      product_name: "Avocados",
      quantity: 8,
      expiry_date: "2025-04-09T09:00:00Z"
    }
  ]
};

// Import data function
const importData = async () => {
  try {
    // Clear previous data
    await Customer.deleteMany();
    await Product.deleteMany();
    await Inventory.deleteMany();
    await Order.deleteMany();

    // Insert customers
    const createdCustomers = await Customer.insertMany(sampleData.customers);
    console.log('Customers imported!');

    // Insert products
    const createdProducts = await Product.insertMany(sampleData.products);
    console.log('Products imported!');

    // Insert inventory with product references
    const inventoryItems = [];
    for (const item of sampleData.inventory) {
      const product = await Product.findOne({ product_name: item.product_name });
      if (product) {
        inventoryItems.push({
          product: product._id,
          quantity: item.quantity,
          expiry_date: item.expiry_date
        });
      }
    }
    await Inventory.insertMany(inventoryItems);
    console.log('Inventory imported!');

    // Create a sample order
    const sampleCustomer = createdCustomers[0];
    const productMap = {};
    createdProducts.forEach(product => {
      productMap[product.product_name] = { id: product._id, unit_price:product.default_price_per_unit };
    });

    const orderItems = [
      {
        product_id: productMap["Roma Tomatoes"].id,
        product_name: "Roma Tomatoes",
        quantity: 5,
        unit_price: productMap["Roma Tomatoes"].unit_price
      },
      {
        product_id: productMap["Baby Spinach"].expiry_date,
        product_name: "Baby Spinach",
        quantity: 3,
        unit_price: productMap["Baby Spinach"].unit_price
      },
      {
        product_id: productMap["Fresh Basil"].id,
        product_name: "Fresh Basil",
        quantity: 5,
        unit_price: productMap["Fresh Basil"].unit_price
      }
    ];

    const newOrder = new Order({
      customer: sampleCustomer._id,
      order_date: new Date(),
      delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
      items: orderItems,
      total_price: orderItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0),
      delivery_window: 'before 10:00 AM'
    });

    await newOrder.save();
    console.log('Sample order created!');

    console.log('Data import complete!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

// Delete data function
const destroyData = async () => {
  try {
    await Customer.deleteMany();
    await Product.deleteMany();
    await Inventory.deleteMany();
    await Order.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

// Run script based on arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
