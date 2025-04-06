// models/Order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  unit_price: { type: Number, required: true },
  discount_percent: { type: Number, default: 0 }
});

const progressSchema = new Schema({
  status: { 
    type: String, 
    required: true,
    enum: ['received', 'processing', 'shipping', 'delivered', 'cancelled'],
    default: 'received'
  },
  updated_at: { type: Date, default: Date.now }
});

const orderSchema = new Schema({
  customer: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true
  },
  order_date: { type: Date, required: true, default: Date.now },
  delivery_date: { type: Date, required: true },
  items: [orderItemSchema],
  total_price: { type: Number, required: true },
  progress: { type: progressSchema, default: () => ({}) },
  delivery_window: { type: String }
}, { timestamps: true });

// Create indexes to optimize queries
orderSchema.index({ customer: 1, order_date: -1 });
orderSchema.index({ "progress.status": 1 });
orderSchema.index({ delivery_date: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
