const { check } = require("express-validator");

// For Registration Valdation
exports.registrationValidator = [
  check("firstName", "First name is required").not().isEmpty(),
  check("lastName", "Last name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_lowercase: true,
    gmail_remove_dots: true,
  }),
  check("mobileNo", "Mobile no. must be 10 digits").isLength({
    min: 10,
    max: 10,
  }),
  check("country", "Country is required").not().isEmpty(),
  check("state", "State is required").not().isEmpty(),
  check("city", "City is required").not().isEmpty(),
  check(
    "password",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  check("pincode", "Pincode must be 6 digits")
    .isLength({
      min: 1,
      max: 6,
    })
    .not()
    .isEmpty(),
  check("profileImage")
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
];

// For verify email validation
exports.verifyEmailAndTokenValidator = [
  check("role").not().isEmpty().withMessage("Invalid role"),
  check("id").not().isEmpty().withMessage("Invalid id"),
  check("email").isEmail().withMessage("Invalid email format"),
  check("token")
    .isLength({ min: 32, max: 32 })
    .withMessage("Invalid token format."),
];

// For resend e-mail validation
exports.emailValidator = [
  check("email")
    .isEmail()
    .withMessage("Please provide a valid email.")
    .normalizeEmail(),
];

// For login validation
exports.loginValidator = [
  check("email")
    .isEmail()
    .withMessage("Please provide a valid email.")
    .normalizeEmail(),
  check("password")
    .not()
    .isEmpty()
    .isStrongPassword({
      minLength: 6,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  ,
];

// For Customer Registration Valdation
exports.CustomerRegistrationValidator = [
  check("firstName", "First name is required").not().isEmpty(),
  check("lastName", "Last name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_lowercase: true,
    gmail_remove_dots: true,
  }),
  check("mobileNo", "Mobile no. must be 10 digits").isLength({
    min: 10,
    max: 10,
  }),
  check("country", "Country is required").not().isEmpty(), // if needed, then use
  check("state", "State is required").not().isEmpty(),
  check("city", "City is required").not().isEmpty(),
  check("street", "street is required").not().isEmpty(),
  check("landmark", "landmark is required").not().isEmpty(),
  check(
    "password",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  check("pincode", "Pincode must be 6 digits")
    .isLength({
      min: 1,
      max: 6,
    })
    .not()
    .isEmpty(),
  check("profileImage")
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
];

// For verify email validation
exports.verifyEmailAndTokenValidatorCustomer = [
  check("id").not().isEmpty().withMessage("Invalid id"),
  check("email").isEmail().withMessage("Invalid email format"),
  check("token")
    .isLength({ min: 32, max: 32 })
    .withMessage("Invalid token format."),
];

// For update profile validator
exports.updateProfileValidator = [
  check("firstName", "First name is required")
    .optional()
    .not()
    .isEmpty()
    .trim(),
  check("lastName", "Last name is required").optional().not().isEmpty().trim(),
  check("email", "Please include a valid email")
    .optional()
    .isEmail()
    .normalizeEmail({
      gmail_lowercase: true,
      gmail_remove_dots: true,
    }),
  check("mobileNo", "Mobile no. must be 10 digits").optional().isLength({
    min: 10,
    max: 10,
  }),
  check("country", "Country is required").optional().not().isEmpty(),
  check("state", "State is required").optional().not().isEmpty(),
  check("city", "City is required").optional().not().isEmpty(),
  check("street", "Street is required").optional().not().isEmpty(),
  check("landmark", "landmark is required").optional().not().isEmpty(),
  check("pincode", "Pincode must be 6 digits")
    .isLength({
      min: 1,
      max: 6,
    })
    .optional()
    .not()
    .isEmpty(),
  check(
    "password",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  )
    .optional()
    .isStrongPassword({
      minLength: 6,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
  check("profileImage")
    .optional()
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
];

// For update passwrod validator
exports.passwordValidator = [
  check(
    "currentPassword",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  check(
    "newPassword",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

// For create technician Valdation
exports.technicianCreationValidator = [
  check("firstName", "First name is required").not().isEmpty(),
  check("lastName", "Last name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_lowercase: true,
    gmail_remove_dots: true,
  }),
  check("mobileNo", "Mobile no. must be 10 digits").isLength({
    min: 10,
    max: 10,
  }),
  check("country", "Country is required").not().isEmpty(),
  check("state", "State is required").not().isEmpty(),
  check("city", "City is required").not().isEmpty(),
  check("pincode", "Pincode must be 6 digits")
    .isLength({
      min: 1,
      max: 6,
    })
    .not()
    .isEmpty(),
  check("profileImage")
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
  check("specialization", "specialization is required").not().isEmpty(),
  check("experience", "experience is required").not().isEmpty(),
];

// For service category creation vallidator
exports.serviceCategoryCreationValidator = [
  check("categoryName", "category name is required").not().isEmpty(),
  check("categoryImage")
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
];

// For service category updateion vallidator
exports.serviceCategoryUpdationValidator = [
  check("categoryName", "category name is required").optional().not().isEmpty(),
  check("categoryImage")
    .optional()
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
];

// For service creation vallidator
exports.serviceCreationValidator = [
  check("title", "title is required").not().isEmpty(),
  check("serviceImage")
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
  check("description", "description is required").not().isEmpty(),
];

// For service creation vallidator
exports.serviceBookingValidator = [
  // Basic field validations
  check("serviceCategory")
    .trim()
    .notEmpty()
    .withMessage("Service category is required"),

  check("subCategory")
    .trim()
    .notEmpty()
    .withMessage("Sub category is required"),

  check("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  check("preferredDate")
    .notEmpty()
    .withMessage("Preferred date is required")
    .isISO8601()
    .withMessage("Invalid date format. Please use YYYY-MM-DD format")
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        throw new Error("Preferred date cannot be in the past");
      }
      return true;
    }),

  check("damagePhotos").custom((value, { req }) => {
    // Check if files exist in the request
    if (!req.files || !Array.isArray(req.files)) {
      throw new Error("Damage photos are required");
    }
    return true;
  }),
];

// For reset passwrod validator
exports.resetPasswordValidator = [
  check(
    "newPassword",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

// For create technician update Valdation
exports.technicianUpdateValidator = [
  check("firstName", "First name is required").optional().not().isEmpty(),
  check("lastName", "Last name is required").optional().not().isEmpty(),
  check("email", "Please include a valid email")
    .optional()
    .isEmail()
    .normalizeEmail({
      gmail_lowercase: true,
      gmail_remove_dots: true,
    }),
  check("mobileNo", "Mobile no. must be 10 digits").optional().isLength({
    min: 10,
    max: 10,
  }),
  check("country", "Country is required").optional().not().isEmpty(),
  check("state", "State is required").optional().not().isEmpty(),
  check("city", "City is required").optional().not().isEmpty(),
  check("pincode", "Pincode must be 6 digits")
    .optional()
    .isLength({
      min: 1,
      max: 6,
    })
    .not()
    .isEmpty(),
  check("profileImage")
    .optional()
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
  check("specialization", "specialization is required").not().isEmpty(),
  check("experience", "experience is required").not().isEmpty(),
];

// For create testimonial Valdation
exports.testimonialCreationValidator = [
  check("clientName", "Client name is required").not().isEmpty(),
  check("talk", "Client Talk is required").not().isEmpty(),
  check("testimonialImage")
    .custom((value, { req }) => {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is one of the allowed image formats
      if (allowedTypes.includes(req.file.mimetype)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please uploads image only png, jpg, and jpeg formats"),
];
