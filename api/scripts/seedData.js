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
      phone: "+351 912 345 678"
    },
    {
      "name": "Café Aurora",
      "address": {
        "street": "78 Sunlight Avenue",
        "city": "Porto",
        "postal_code": "4050-456",
        "country": "Portugal"
      },
      "phone": "+49 152 36315235"
    }    
  ],
  products: [
    {
      item_name: "Roma Tomatoes",
      category: "Vegetables",
      unit: "kg",
      default_price_per_unit: 5.5
    },
    {
      item_name: "Baby Spinach",
      category: "Leafy Greens",
      unit: "kg",
      default_price_per_unit: 12.0
    },
    {
      item_name: "Fresh Basil",
      category: "Herbs",
      unit: "bunch",
      default_price_per_unit: 3.0
    },
    {
      item_name: "Thai Basil",
      category: "Herbs",
      unit: "bunch",
      default_price_per_unit: 3.5
    },
    {
      item_name: "Yukon Gold Potatoes",
      category: "Vegetables",
      unit: "kg",
      default_price_per_unit: 4.5
    },
    {
      item_name: "Zucchini",
      category: "Vegetables",
      unit: "kg",
      default_price_per_unit: 5.5
    },
    {
      item_name: "Red Bell Peppers",
      category: "Vegetables",
      unit: "kg",
      default_price_per_unit: 16.5
    },
    {
      item_name: "Avocados",
      category: "Fruits",
      unit: "kg",
      default_price_per_unit: 15.5
    },
    {
      item_name: "Roma Tomatoes",
      category: "Vegetables",
      unit: "kg",
      default_price_per_unit: 5.5
    },
    {
      item_name: "Baby Spinach",
      category: "Leafy Greens",
      unit: "kg",
      default_price_per_unit: 12.0
    },
    {
      item_name: "Thai Basil",
      category: "Herbs",
      unit: "bunch",
      default_price_per_unit: 3.5
    },
    {
      item_name: "Yukon Gold Potatoes",
      category: "Vegetables",
      unit: "kg",
      default_price_per_unit: 4.5
    },
    {
      item_name: "Zucchini",
      category: "Vegetables",
      unit: "kg",
      default_price_per_unit: 5.5
    },
    {
      item_name: "Red Bell Peppers",
      category: "Vegetables",
      unit: "kg",
      default_price_per_unit: 16.5
    },
    {
      item_name: "Avocados",
      category: "Fruits",
      unit: "kg",
      default_price_per_unit: 15.5
    }
  ],
  inventory: [
    {
      item_name: "Fresh Basil",
      amount: 5,
      expiry_date: "2025-04-10T09:00:00Z"
    },
    {
      item_name: "Thai Basil",
      amount: 15,
      expiry_date: "2025-04-11T09:00:00Z"
    },
    {
      item_name: "Avocados",
      amount: 8,
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
      const product = await Product.findOne({ item_name: item.item_name });
      if (product) {
        inventoryItems.push({
          product: product._id,
          amount: item.amount,
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
      productMap[product.item_name] = product._id;
    });

    const orderItems = [
      {
        product_id: productMap["Roma Tomatoes"],
        item_name: "Roma Tomatoes",
        amount: 5,
        unit_price: 5.5
      },
      {
        product_id: productMap["Baby Spinach"],
        item_name: "Baby Spinach",
        amount: 3,
        unit_price: 12.0
      },
      {
        product_id: productMap["Fresh Basil"],
        item_name: "Fresh Basil",
        amount: 5,
        unit_price: 3.0
      }
    ];

    const newOrder = new Order({
      customer: sampleCustomer._id,
      order_date: new Date(),
      delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
      items: orderItems,
      total_price: orderItems.reduce((total, item) => total + (item.amount * item.unit_price), 0),
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
