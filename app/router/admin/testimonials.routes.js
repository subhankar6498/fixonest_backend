// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");
const { adminAuth } = require("../../middleware/authCheck");
const testimonialController = require("../../modules/testimonials/controller/testimonial.controller");
const { uploadTestimonialsImage } = require("../../middleware/multer");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// Define Admin-testimonials Page
namedRouter.get(
  "add-testimonial",
  "/add-testimonial",
  adminAuth,
  testimonialController.addTestimonialPage
);
namedRouter.post(
  "testimonial-create",
  "/testimonial-create",
  adminAuth,
  uploadTestimonialsImage,
  testimonialController.createTestimonials
);
namedRouter.get(
  "all-testimonials",
  "/all-testimonials",
  adminAuth,
  testimonialController.getAllTestimonialsData
);
// namedRouter.get(
//   "testimonials-activate",
//   "/testimonials-activate/:id",
//   adminAuth,
//   testimonialController.activateTestimonials
// );
// namedRouter.get(
//   "testimonials-deactivate",
//   "/testimonials-deactivate/:id",
//   adminAuth,
//   testimonialController.deActivateTestimonials
// );
namedRouter.get(
  "testimonials-edit",
  "/testimonials-edit/:id",
  adminAuth,
  testimonialController.editTestimonialPage
);
namedRouter.post(
  "testimonials-update",
  "/testimonials-update/:id",
  adminAuth,
  uploadTestimonialsImage,
  testimonialController.updateTestimonialsData
);
namedRouter.get(
  "testimonials-remove",
  "/testimonials-remove/:id",
  adminAuth,
  testimonialController.removeTestimonials
);

module.exports = router;
