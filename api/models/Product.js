// models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  item_name: { type: String, required: true, unique: true }, // Using unique: true here
  category: { type: String, required: true },
  unit: { type: String, required: true },
  default_price_per_unit: { type: Number, required: true }
}, { timestamps: true });

// Create index for faster category searches only, since item_name already has a unique index from above
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;