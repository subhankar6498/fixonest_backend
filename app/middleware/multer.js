// Core module
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

// 3rd-party module
const multer = require("multer");

// Base path for uploads (relative to project root)
const UPLOAD_BASE_PATH = "public/uploads";

// Set-up Storage Engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    // Set different destination paths based on file type
    switch (file.fieldname) {
      case "profileImage":
        uploadPath = path.join(UPLOAD_BASE_PATH, "profile");
        break;
      case "productImage":
        uploadPath = path.join(UPLOAD_BASE_PATH, "products");
        break;
      case "blogImage":
        uploadPath = path.join(UPLOAD_BASE_PATH, "blogs");
        break;
      case "categoryImage":
        uploadPath = path.join(UPLOAD_BASE_PATH, "service_category");
        break;
      case "serviceImage":
        uploadPath = path.join(UPLOAD_BASE_PATH, "service");
        break;
      case "damagePhotos":
        uploadPath = path.join(UPLOAD_BASE_PATH, "serviceBookings");
        break;
      case "testimonialImage":
        uploadPath = path.join(UPLOAD_BASE_PATH, "testimonials");
        break;
      default:
        uploadPath = path.join(UPLOAD_BASE_PATH, "others");
        break;
    }

    cb(null, uploadPath); // Set the destination directory dynamically
  },
  filename: (req, file, cb) => {
    // Generate 3 random digits using crypto
    const randomDigits = crypto
      .randomBytes(2)
      .readUInt16LE(0)
      .toString()
      .padStart(3, "0")
      .slice(-3);

    // Generate a unique filename
    const uniqueName = `${
      file.fieldname
    }-${Date.now()}${randomDigits}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter to allow only specific image formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

  // Check if the file type is one of the allowed image formats
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only png, jpg, and jpeg formats are allowed!"), false); // Reject the file
  }
};

// Initialize Multer with custom storage, file filter, and size limit
const uploadProfileImage = multer({
  storage, // Use the custom storage configuration
  fileFilter, // Apply the file filter for image formats
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
  },
}).single("profileImage"); // Single file upload for profile picture

// For uploading service category image
const uploadServiceCategoryImage = multer({
  storage, // Use the custom storage configuration
  fileFilter, // Apply the file filter for image formats
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
  },
}).single("categoryImage"); // Single file upload for service category

// upload service image
const uploadServiceImage = multer({
  storage, // Use the custom storage configuration
  fileFilter, // Apply the file filter for image formats
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
  },
}).single("serviceImage"); // Single file upload for service

// upload testimonial image
const uploadTestimonialsImage = multer({
  storage, // Use the custom storage configuration
  fileFilter, // Apply the file filter for image formats
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
  },
}).single("testimonialImage"); // Single file upload for testimonials

// For handling multiple file uploads for service bookings, use this function
const uploadMultipleDamagePhotos = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit each file to 10MB
  },
}).array(
  "damagePhotos",
  4 // Allow up to 4 profile images
);

// Helper method to remove uploaded file(s)
const removeUploadedFile = async (filePaths) => {
  // Step 1: Validate that the filePaths parameter is provided.
  if (!filePaths) {
    throw new Error("No file path(s) provided for removal.");
  }

  // Step 2: A helper function to normalize various input formats into an array of file paths.
  const normalizePaths = (input) => {
    if (Array.isArray(input)) {
      // If input is an array, handle each item in the array.
      return input.map((item) => {
        if (typeof item === "string") {
          // If the item is a string, it's already a valid file path.
          return item;
        }
        if (item && typeof item === "object" && "path" in item) {
          // If the item is an object with a 'path' property, extract the path.
          return item.path;
        }
        // If the array contains invalid items, throw an error.
        throw new Error(
          "Invalid file path(s): Array must contain strings or objects with a 'path' property."
        );
      });
    }

    if (typeof input === "string") {
      // If the input is a single string, convert it to an array with one element.
      return [input];
    }

    if (input && typeof input === "object" && "path" in input) {
      // If the input is a single object with a 'path' property, extract the path into an array.
      return [input.path];
    }

    // If the input format is not recognized, throw an error.
    throw new Error(
      "Invalid file path(s): Must be a string, array of strings, or objects with a 'path' property."
    );
  };

  // Normalize the input into an array of file paths for consistent handling.
  const paths = normalizePaths(filePaths);

  try {
    // Step 3: Attempt to remove all files concurrently.
    await Promise.all(
      paths.map(async (filePath) => {
        try {
          // Try to remove the file at the given path.
          await fs.unlink(filePath);
          // console.log(`Successfully removed: ${filePath}`); // Log success for each file.
        } catch (error) {
          // If a file fails to remove, log a warning and continue.
          console.warn(`Failed to remove file '${filePath}': ${error.message}`);
        }
      })
    );
  } catch (error) {
    // If any unexpected error occurs during the process, throw it as a critical failure.
    throw new Error(`File removal operation failed: ${error.message}`);
  }
};

// Helper function to get relative path starting with "/uploads"
const getRelativePath = (absolutePath) => {
  const relativePath = path.relative(process.cwd(), absolutePath);

  return `/uploads/${relativePath.split(path.sep).slice(2).join("/")}`;
};

// Export the configured Multer middlewares
module.exports = {
  uploadProfileImage, // For single profile image upload
  uploadServiceCategoryImage, // For uploading single service category image
  uploadServiceImage, // For uploaing single service image
  uploadTestimonialsImage, // For uploaing single testimonials image
  uploadMultipleDamagePhotos, // For multiple images (e.g., products, blogs)
  removeUploadedFile, // For removing uploaded files
  getRelativePath, // For removing public
};
