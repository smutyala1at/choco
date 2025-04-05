// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Fresh Produce API',
    endpoints: {
      customers: '/api/customers',
      products: '/api/products',
      inventory: '/api/inventory',
      orders: '/api/orders'
    }
  });
});

module.exports = router;
