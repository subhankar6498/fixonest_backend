// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const serviceBookingController = require("../../webservices/serviceBooking.apiController");

// import others
const { serviceBookingValidator } = require("../../helper/validation");
const { uploadMultipleDamagePhotos } = require("../../middleware/multer");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1.Define all authenticated api which url starts with "/auth"
namedRouter.all("/auth*", authenticateApi);

// 2. Define service booking by customer route
namedRouter.post(
  "service-booking",
  "/auth/service-booking",
  uploadMultipleDamagePhotos,
  serviceBookingValidator,
  serviceBookingController.bookService
);

// 3. Define Customer wise booking route
namedRouter.get(
  "customer-wise-booking",
  "/auth/get-booking-by-customer/:id",
  serviceBookingController.getBookingByCustomer
);

module.exports = router;
