// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const technicianController = require("../../modules/technician/controller/technician.controller");

// import others
const { uploadProfileImage } = require("../../middleware/multer");
const {
  technicianCreationValidator,
  technicianUpdateValidator,
} = require("../../helper/validation");
const { adminAuth } = require("../../middleware/authCheck");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1. Define create technician table page route
namedRouter.get(
  "technician-table-page",
  "/technician-table-page",
  adminAuth,
  technicianController.technicianTablePage
);

// 2.Define Technician-registration Page
namedRouter.get(
  "technician-registration-page",
  "/technician-registration",
  adminAuth,
  technicianController.technicianRegistrationPage
);

// 3.Define create technician route
namedRouter.post(
  "technician.create",
  "/create-technician",
  adminAuth,
  uploadProfileImage,
  technicianCreationValidator,
  technicianController.createTechnician
);

// 4. Define edit technician route
namedRouter.get(
  "technician-edit-page",
  "/edit-technician/:technicinaId",
  adminAuth,
  technicianController.editTechnicinaPage
);

// 5. Defne update technician route
namedRouter.post(
  "technician.update",
  "/update-technician/:technicinaId",
  adminAuth,
  uploadProfileImage,
  technicianUpdateValidator,
  technicianController.updateTechnician
);

// 6. Define delete technicina route
namedRouter.post(
  "technician.delete",
  "/delete-technician/:technicianId",
  adminAuth,
  technicianController.deleteTechnician
);

// 4. Assign technician to booking
namedRouter.post(
  "booking-assing-to-technician",
  "/assign-to-technician/:bookingId/:technicianId",
  adminAuth,
  technicianController.assignTechnician
);

// Active or inactive technician route
namedRouter.post(
  "technician-active-inactive",
  "/active-inactive-technicain/:id",
  adminAuth,
  technicianController.activeInactiveTechnician
);

module.exports = router;
