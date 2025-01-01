// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const serviceController = require("../../modules/service/controller/service.controller");

// import others
const {
  uploadServiceImage,
  uploadServiceCategoryImage,
} = require("../../middleware/multer");
const {
  serviceCategoryCreationValidator,
  serviceCreationValidator,
  serviceCategoryUpdationValidator,
} = require("../../helper/validation");
const { adminAuth } = require("../../middleware/authCheck");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1. Define create service table page route
namedRouter.get(
  "service-table-page",
  "/service-table-page",
  adminAuth,
  serviceController.createServiceTablePage
);

// 2.Define create service category Page route
namedRouter.get(
  "service-category-creation-page",
  "/create-service-category-page",
  adminAuth,
  serviceController.createServiceCategoryPage
);

// 3.Define create service category route by admin
namedRouter.post(
  "create.serviceCategory",
  "/create-service-category",
  adminAuth,
  uploadServiceCategoryImage,
  serviceCategoryCreationValidator,
  serviceController.createServiceCategory
);

// Define edit service category page route
namedRouter.get(
  "edit-service-category-page",
  "/edit-service-category-page/:id",
  adminAuth,
  serviceController.editServiceCategoryPage
);

// Define update service category page route
namedRouter.post(
  "update-service-Category",
  "/update-service-category/:id",
  adminAuth,
  uploadServiceCategoryImage,
  serviceCategoryUpdationValidator,
  serviceController.updateServiceCategory
);

// Define delete service category page route
namedRouter.post(
  "delete.serviceCategory",
  "/delete-service-category/:id",
  adminAuth,
  serviceController.deleteServiceCategory
);

// Define delete service category page route
namedRouter.post(
  "delete.serviceCategory",
  "/delete-service-category/:id",
  adminAuth,
  serviceController.deleteServiceCategory
);

// 4.Define create service sub-category page route
namedRouter.get(
  "create-service-page",
  "/create-service-page/:id",
  adminAuth,
  serviceController.createServicePage
);

// 4.Define create service sub-category route by admin
namedRouter.post(
  "create.service",
  "/create-service/:id",
  adminAuth,
  uploadServiceImage,
  serviceCreationValidator,
  serviceController.createService
);

// 5.Define show/display service sub-category page route
namedRouter.get(
  "service-subCategory-page",
  "/service-subcategory-page/:id",
  adminAuth,
  serviceController.serviceSubCategorypage
);

// Define edit service sub-category page route
namedRouter.get(
  "service-subCategory-edit-page",
  "/edit-service-subcategory-page/:id",
  adminAuth,
  serviceController.editServiceSubCategoryPage
);

// Define update service sub-category page route
namedRouter.post(
  "service-subCategory-update",
  "/update-service-subcategory/:id",
  adminAuth,
  uploadServiceImage,
  serviceCategoryUpdationValidator,
  serviceController.updateServiceSubCategory
);

// Define delete service sub-category page route
namedRouter.post(
  "serviceSubCategory.delete",
  "/delete-service-subcategory/:id",
  adminAuth,
  serviceController.deleteServiceSubCategory
);

module.exports = router;
