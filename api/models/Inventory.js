// models/Inventory.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
  product: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'Product'
  },
  quantity: { type: Number, required: true },
  expiry_date: { type: Date, required: true }
}, { timestamps: true });

// Create indexes for performance
inventorySchema.index({ product: 1, expiry_date: 1 });
inventorySchema.index({ expiry_date: 1 }); // For expiring soon queries

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
