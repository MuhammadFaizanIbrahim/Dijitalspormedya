const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        }
      }
    ],
    shippingAddress: {
      fullName: {type: String, required: true },
      email: {type: String, required: true },
      phone: {type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    orderNumber: {
      type: String,
      required: true,
    },
    itemsPrice: {
      type: Number,
      required: true,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      default: 'Pending', // Example statuses: 'Pending', 'Completed', 'Cancelled'
    },
    dateOrdered: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

exports.Order = mongoose.model("Order", orderSchema);
