// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const authController = require("../../modules/auth/controller/auth.controller");

// import others
const { uploadProfileImage } = require("../../middleware/multer");
const {
  registrationValidator,
  verifyEmailAndTokenValidator,
  loginValidator,
} = require("../../helper/validation");
const { adminAuth } = require("../../middleware/authCheck");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// Define Admin-registration Page
namedRouter.get(
  "admin-registration-page",
  "/registration",
  authController.registrationPage
);

// 1.Define Admin Registration route
namedRouter.post(
  "admin.registration",
  "/registration",
  uploadProfileImage,
  registrationValidator,
  authController.registration
);

// 2. Define Login page route
namedRouter.get("admin-login-page", "/login", authController.loginPage);

// 2b.Define route to verify email with validation
namedRouter.get(
  "admin.registration-email-verification",
  "/:role/confirmation/:id/:email/:token",
  verifyEmailAndTokenValidator,
  authController.verifyEmail
);

// Define admin login route
namedRouter.post("admin.login", "/login", loginValidator, authController.login);

// Define admin Dashboard Route
namedRouter.get(
  "admin-dashboard-page",
  "/",
  adminAuth,
  authController.dashboard
);

// Define admin Update Password page
namedRouter.get(
  "admin-updatepw-page",
  "/admin-updatepassword",
  adminAuth,
  authController.updatePasswordPage
);

namedRouter.post(
  "admin-updatepw",
  "/password/update",
  adminAuth,
  authController.updateAdminPassword
);

// Define logout route
namedRouter.get("admin.logout", "/logout", authController.logout);

module.exports = router;
