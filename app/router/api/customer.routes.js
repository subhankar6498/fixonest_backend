// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const customerContoller = require("../../webservices/customer.contoller");

// import others
const {
  CustomerRegistrationValidator,
  verifyEmailAndTokenValidatorCustomer,
  loginValidator,
  passwordValidator,
  emailValidator,
  resetPasswordValidator,
} = require("../../helper/validation");
const { uploadProfileImage } = require("../../middleware/multer");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1.Define customer registration api route
namedRouter.post(
  "customer.registration",
  "/customer-registration",
  uploadProfileImage,
  CustomerRegistrationValidator,
  customerContoller.customerRegistration
);

// 1b.Define route to verify email with validation
namedRouter.get(
  "customer.registration-email-verification",
  "/confirmation/:id/:email/:token",
  verifyEmailAndTokenValidatorCustomer,
  customerContoller.verifyEmail
);

// 2.Define customer login api route
namedRouter.post(
  "customer.login",
  "/customer-login",
  loginValidator,
  customerContoller.customerLogin
);

// 3.Define all authenticated api which url starts with "/auth"
namedRouter.all("/auth*", authenticateApi);

// 4. Define get user profile route
namedRouter.get(
  "customer.get-profile",
  "/auth/get-customer-profile",
  customerContoller.getCustomerProfile
);

// 6.Define update password route
namedRouter.post(
  "customer.profile-password-update",
  "/auth/profile/update-customer-password",
  passwordValidator,
  customerContoller.updateCustomerPassword
);

// 7.Forgot passoword Email verification
namedRouter.post(
  "customer.forgot-password",
  "/forgot-password",
  emailValidator,
  customerContoller.forgotPassword
);

// 8. Define forgot Password verification route
namedRouter.get(
  "customer.forgot-password-verification",
  "/password-confirmation/:email/:token",
  customerContoller.passwordConfirmation
);

// 9. Define reset password route
namedRouter.post(
  "customer.reset-password",
  "/password-confirmation/:email/:token",
  resetPasswordValidator,
  customerContoller.resetPassword
);

module.exports = router;
