// 3rd-party Model
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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

// Define user schema
const customerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is required"],
      trim: true,
      minLength: [2, "First name must be at least 2 characters long"],
      maxlength: [50, "First name must not exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name must not exceed 50 characters"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [5, "Full name must be at least 5 characters long"],
      maxlength: [100, "Full name must not exceed 100 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validateEmail, "Please enter a valid email address"],
    },
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      validate: [
        validatePhoneNumber,
        "Please enter a valid 10-digit phone number",
      ],
    },
    address: {
      country: {
        type: [String],
        trim: true,
        default: ["India"],
      },
      state: {
        type: String,
        trim: true,
        required: [true, "state is required"],
        default: "N/A",
      },
      city: {
        type: String,
        trim: true,
        required: [true, "city is required"],
        default: "N/A",
      },
      street: {
        type: String,
        trim: true,
        required: [true, "street is required"],
        default: "N/A",
      },
      landmark: {
        type: String,
        trim: true,
        required: [true, "landmark is required"],
        default: "N/A",
      },
      pincode: {
        type: Number,
        required: [true, "pincode is required"],
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    profileImage: {
      type: String,
      default: "uploads/profile/default-image.png",
    },
    isVerified: {
      type: Boolean,
      default: false, // Default value, change if needed
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// static Method to hash the password using bcrypt before saving the user
// This method will generate a salt and hash the provided plain-text password
customerSchema.statics.generateHashPassword = async function (password) {
  try {
    // Generate a salt with a cost factor of 10
    const salt = await bcrypt.genSalt(10);

    // Hash the provided password using the generated salt
    const hashPassword = await bcrypt.hash(password, salt);

    // Return the hashed password to be saved
    return hashPassword;
  } catch (error) {
    // If an error occurs during the hashing process, throw a custom error message
    throw new Error("Error generating hash");
  }
};

// static Method to compare the provided password with the stored hashed password during login. This method will return a boolean indicating whether the passwords match
customerSchema.statics.validPassword = async function (
  password,
  hashedPassword
) {
  try {
    // Compare the provided password with the stored hashed password
    const comparePassword = await bcrypt.compare(password, hashedPassword);

    // Return true if the password matches, otherwise return false
    return comparePassword;
  } catch (error) {
    // If an error occurs during the comparison process, throw a custom error message
    throw new Error("Error comparing passwords");
  }
};

const CustomerModel = mongoose.model("customer", customerSchema);
module.exports = CustomerModel;
