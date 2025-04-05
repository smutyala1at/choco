// server.js
const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}`);
  console.log(`To seed data, run: npm run data:import`);
});