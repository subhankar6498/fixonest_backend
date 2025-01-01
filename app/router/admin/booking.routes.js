// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const serviceBookingController = require("../../modules/bookings/controller/booking.controller");

// import others
const { uploadProfileImage } = require("../../middleware/multer");
const { technicianCreationValidator } = require("../../helper/validation");
const { adminAuth } = require("../../middleware/authCheck");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1. Define create booking table page route
namedRouter.get(
  "booking-table-page",
  "/booking-table-page",
  adminAuth,
  serviceBookingController.createServiceBookingTablePage
);

// 2.Define view booking page route
namedRouter.get(
  "booking-view-page",
  "/view-booking/:id",
  adminAuth,
  serviceBookingController.viewBookingPage
);

// 3. Define export booking list to PDF route
namedRouter.get(
  "export-booking-list",
  "/export-booking-list",
  serviceBookingController.exportBookingList
);

// 4. Define export Single booking to PDF route
namedRouter.get(
  "export-booking-details",
  "/export-booking-details/:id",
  serviceBookingController.exportBookingDetails
);

// Print booking details route
namedRouter.get(
  "print-booking-details",
  "/print-booking/:id",
  serviceBookingController.printBookingDetails
);

module.exports = router;
