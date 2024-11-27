// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const categoryApiController = require("../../webservices/category.apiController");

// import others

// const serviceApiController = require("../../webservices/category.apiController");
const {
  uploadServiceCategoryImage,
  uploadServiceImage,
} = require("../../middleware/multer");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// Define fetch all category route
namedRouter.get(
  "service_category.all",
  "/service/categories",
  categoryApiController.allCategories
);

// Define get all service route
namedRouter.get(
  "all-services",
  "/all-service",
  categoryApiController.getAllServices
);

// Define Get service details by id route
namedRouter.get(
  "service_details",
  "/service/details/:id",
  categoryApiController.singleservicedata
);

// Define category wise service route
namedRouter.get(
  "category-wise-services",
  "/category-wise-services/:id",
  categoryApiController.getCategoryWiseServices
);

module.exports = router;
