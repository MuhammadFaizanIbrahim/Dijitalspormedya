const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        itemPrice: {
            type: Number,
            required: true,
          },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalItemsPrice: {
      type: Number,
      default: 0,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

exports.Cart = mongoose.model("Cart", cartSchema);
