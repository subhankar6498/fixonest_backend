const express = require("express");
const routeLabel = require("route-label");
const testimonialsApiController = require("../../webservices/testimonials.apiController");
const { uploadTestimonialsImage } = require("../../middleware/multer");
const { testimonialCreationValidator } = require("../../helper/validation");
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

namedRouter.post(
  "testimonial.create",
  "/testimonial/create",
  uploadTestimonialsImage,
  testimonialCreationValidator,
  testimonialsApiController.createTestimonials
);


namedRouter.get(
  "testimonial.all",
  "/testimonials",
  testimonialsApiController.getAllTestimonialsData
);

module.exports = router;
