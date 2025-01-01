const mongoose = require("mongoose");
const { Schema } = mongoose;

// Custom validation for email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
  return emailRegex.test(email);
};

// Custom validation for mobile number
const validatePhoneNumber = (number) => {
  const phoneRegex = /^[0-9]{10}$/; // Example regex for 10-digit phone number
  return phoneRegex.test(number);
};

const ContactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name must not exceed 50 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validateEmail, "Please enter a valid email address"],
    },
    phone: {
      type: Number,
      required: [true, "Mobile number is required"],
      unique: true,
      validate: [
        validatePhoneNumber,
        "Please enter a valid 10-digit phone number",
      ],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minLength: [6, "Message must be at least 6 characters long"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: 0,
  }
);

const ContactModel = mongoose.model("contact", ContactSchema);
module.exports = ContactModel;
