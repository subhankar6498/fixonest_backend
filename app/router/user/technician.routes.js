// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const technicianController = require("../../modules/technician/controller/technician.controller");

// import others
const { uploadProfileImage } = require("../../middleware/multer");
const { loginValidator } = require("../../helper/validation");
const { technicianAuth } = require("../../middleware/authCheck");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 3.Define technician login page route
namedRouter.get(
  "technician-login-page",
  "/technician/login",
  technicianController.technicianloginPage
);

// Define technician Login route
namedRouter.post(
  "technician.login",
  "/technician/login",
  loginValidator,
  technicianController.technicianLogin
);

// Define technician Dashboard route
namedRouter.get(
  "technician-dashboard-page",
  "/technician-dashboard",
  technicianAuth,
  technicianController.technicianDashboard
);

// Define logout route
namedRouter.get(
  "technician.logout",
  "/technician/logout",
  technicianController.logout
);

// Define booking status update route
namedRouter.post(
  "technician-update-status",
  "/booking/:bookingId/status",
  technicianAuth,
  technicianController.updateBookingStatus
);

//update password page
namedRouter.get(
  "technician-updatepw-page",
  "/technician-updatepassword",
  technicianAuth,
  technicianController.updateTechnicianPasswordPage
);

namedRouter.post(
  "technician-updatepw",
  "/technician/password/update",
  technicianAuth,
  technicianController.updateTechnicianPassword
);

module.exports = router;
