const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
      default: 0,
    },
    googleId: {
      type: String,
      default: 0,
    },
    avatar: {
      type: String,
      default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fprofile-image&psig=AOvVaw2sXnPjqwWdee0VQPi4l4oX&ust=1709581762616000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCLCco8Lu2IQDFQAAAAAdAAAAABAE"
   },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dateRegistered: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

exports.User = mongoose.model("User", userSchema);
