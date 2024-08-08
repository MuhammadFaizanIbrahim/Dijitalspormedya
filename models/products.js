const mongoose = require("mongoose");

const productSchema = mongoose.Schema ({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: ''
      },
    countInStockForSmall: {
        type: Number,
        default: 0
        },
    countInStockForMedium: {
        type: Number,
        default: 0
        },
    countInStockForLarge: {
        type: Number,
        default: 0
    },
    countInStockForExtraLarge: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
        },
    dateCreated: {
        type: Date,
        default: Date.now,
        },
});
       
exports.Product = mongoose.model('Product', productSchema);