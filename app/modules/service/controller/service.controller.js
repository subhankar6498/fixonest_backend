const fs = require("fs").promises; // Use the promises API for cleaner async/await syntax// 3rd-party module
const path = require("path");
const { validationResult } = require("express-validator");

// import model

// import repositories
const serviceRepo = require("../repositories/service.repositories");

// import others
const {
  removeUploadedFile,
  getRelativePath,
} = require("../../../middleware/multer");

// Define service category Controller
class serviceContoller {
  // Define Create Service Table Page controller method
  async createServiceTablePage(req, res) {
    // Get total Service Category list
    const categoryList = await serviceRepo.getServiceCategoryList();
    try {
      res.render("service/views/serviceTable.ejs", {
        title: "Service Table",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: "/admin" + generateUrl("admin.logout"),
        },
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
        data: {
          categoryList,
        },
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Define Create Service Category Page controller method
  async createServiceCategoryPage(req, res) {
    try {
      res.render("service/views/createServiceCaterory.ejs", {
        title: "Create Service Category",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: "/admin" + generateUrl("admin.logout"),
        },
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Creating new service category controller method
  async createServiceCategory(req, res) {
    // 1. Check validation of create technician request
    const errors = validationResult(req);

    // 1b. Check, if errors is not empty, then first unlink the uploaded image and return error
    if (!errors.isEmpty()) {
      // 1. If validation is failed, then no uploaded file (which is coming from incoming request body) added in the upload directory
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }

      // 2. Return the Error
      req.flash(
        "error",
        "Validation Errors: " +
          errors
            .array() // Converts the errors object into an array
            .map((e) => e.msg) //  Maps over the array of error objects, extracting the msg (message) property of each error.
            .join(", ") // Joins all error messages into a single string, separated by commas
      );
      return res.redirect(
        "/admin" + generateUrl("service-category-creation-page")
      );
    }

    try {
      // 2. Destructure the data fron the incoming request body
      const { categoryName } = req.body;

      // 3.Store service category data into another variable
      let serviceCategorydata = {
        categoryName,
      };

      // 4. Define file upload --> If there's a file, add its path to the serviceCategorydata. Store the service category image in a variable
      if (req.file) {
        serviceCategorydata.categoryImage = getRelativePath(req.file.path);
      }

      // 5.Call the create categoryRepo method to create service category
      const savedData = await serviceRepo.create(serviceCategorydata);
      if (savedData) {
        req.flash("success", "New service category created succussfully");
        return res.redirect(
          "/admin" + generateUrl("service-category-creation-page")
        );
      }
    } catch (error) {
      // Remove the uploading file while is error is happening in creating service category
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }

      // Log the error for debugging
      console.error("Error in create new service category:", error);

      // Flash the error message to the user
      req.flash(
        "error",
        "An unexpected error occurred in creating new service category. Please try again later"
      );

      // Redirect to an appropriate page
      return res.redirect(
        "/admin" + generateUrl("service-category-creation-page")
      );
    }
  }

  // Define editServiceCategoryPage controller method
  async editServiceCategoryPage(req, res) {
    const { id } = req.params;
    try {
      // Fetch single service category details
      const result = await serviceRepo.getServiceCategoryById(id);

      res.render("service/views/editServiceCategory.ejs", {
        title: "Edit service category page",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: generateUrl("technician.logout"),
        },
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
        data: {
          result,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error in rendering Edit Technician Page");
    }
  }

  // Define update service category controller mehtod
  async updateServiceCategory(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }
      req.flash(
        "error",
        "Validation Errors: " +
          errors
            .array()
            .map((e) => e.msg)
            .join(", ")
      );
      return res.redirect(
        "/admin" +
          generateUrl("service-subCategory-edit-page", {
            id: req.params.id,
          })
      );
    }
    try {
      const { id } = req.params;

      // Chek service category is exist or not
      const existingServiceCategory = await serviceRepo.getServiceCategoryById(
        id
      );
      if (!existingServiceCategory) {
        req.flash("error", "Service category not found");
        return res.redirect("/admin" + generateUrl("service-table-page"));
      }

      const { categoryName } = req.body;
      const categoryData = { categoryName };

      // If new image is upload, old image should be unlink
      if (req.file) {
        fs.unlink(
          "./public/uploads/service_category/" +
            path.basename(existingServiceCategory.categoryImage),
          (err) => {
            console.log(`Error in removing old pic ${err}`);
          }
        );
        categoryData.categoryImage = getRelativePath(req.file.path);
      } else {
        categoryData.categoryImage = existingServiceCategory.categoryImage;
      }

      const result = await serviceRepo.updateServiceCategoryRepo(
        id,
        categoryData
      );
      // console.log(result);

      if (result) {
        req.flash("success", "Service sub-category updated successfully");
        return res.redirect("/admin" + generateUrl("service-table-page"));
      }
    } catch (error) {
      req.flash(
        "error",
        "Error updating service sub-category: " + error.message
      );
      return res.redirect(
        "/admin" +
          generateUrl("service-subCategory-edit-page", {
            id: req.params.id,
          })
      );
    }
  }

  // Define deleteServiceCategory controller method
  async deleteServiceCategory(req, res) {
    try {
      // 1. Grab the service sub-category from the incoming request object which you want to delete
      const id = req.params.id;

      // Check existing service category are present or not
      const existingServiceCategory = await serviceRepo.getServiceCategoryById(
        id
      );

      // 2. Fetch the technician based on id which you have to delete
      await serviceRepo.deleteServiceCategory(id);

      // Unlink the image
      fs.unlink(
        "./public/uploads/service_category/" +
          path.basename(existingServiceCategory.categoryImage),
        (err) => {
          console.log(`Error in removing old pic ${err}`);
        }
      );

      // 5. Return success response
      req.flash(
        "success",
        "service subcategory deleted successfully successfully"
      );
      return res.redirect("/admin" + generateUrl("service-table-page"));
    } catch (error) {
      console.error("Error in deleteTechnician controller:", error);
      return res.redirect("/admin" + generateUrl("service-table-page"));
    }
  }

  // Define create service sub-category page controller mehtod
  async createServicePage(req, res) {
    try {
      res.render("service/views/createService.ejs", {
        title: "Create Service sub-category",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: "/admin" + generateUrl("admin.logout"),
        },
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
        data: {
          categoryId: req.params.id,
        },
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Define create service sub-category controller method
  async createService(req, res) {
    // 1. Check validation of create technician request
    const errors = validationResult(req);

    // 1b. Check, if errors is not empty, then first unlink the uploaded image and return error
    if (!errors.isEmpty()) {
      // 1. If validation is failed, then no uploaded file (which is coming from incoming request body) added in the upload directory
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }

      // 2. Return the Error
      req.flash(
        "error",
        "Validation Errors: " +
          errors
            .array() // Converts the errors object into an array
            .map((e) => e.msg) //  Maps over the array of error objects, extracting the msg (message) property of each error.
            .join(", ") // Joins all error messages into a single string, separated by commas
      );
      res.redirect(`/admin${generateUrl("create-service-page")}/${id}`);
    }

    try {
      // 2. Destructure the categoryid from params and data fron the incoming request body
      const { id } = req.params;
      const { title, description } = req.body;

      // 3.Store service category data into another variable
      let servicedata = {
        categoryId: id,
        title,
        description,
      };

      // 4. Define file upload --> If there's a file, add its path to the serviceCategorydata. Store the service category image in a variable
      if (req.file) {
        servicedata.serviceImage = getRelativePath(req.file.path);
      }

      // 5.Call the create categoryRepo method to create service category
      const savedData = await serviceRepo.createService(servicedata);
      if (savedData) {
        req.flash("success", "New service created succussfully");
        res.redirect(`/admin${generateUrl("service-table-page")}`);
      }
    } catch (error) {
      // Remove the uploading file while is error is happening in creating service category
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }

      // Log the error for debugging
      console.error("Error in create new service", error);

      // Flash the error message to the user
      req.flash(
        "error",
        "An unexpected error occurred in creating new service category. Please try again later"
      );

      // Redirect to an appropriate page
      res.redirect(`/admin${generateUrl("create-service-page")}/${id}`);
    }
  }

  // Define display or show service sub-category page
  async serviceSubCategorypage(req, res) {
    const categoryId = req.params.id;

    // Get total Service Category list
    const serviceSubCategoryList = await serviceRepo.getServiceSubCategoryList({
      categoryId,
    });
    try {
      res.render("service/views/serviceSubCategory.ejs", {
        title: "Show service sub-category",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: "/admin" + generateUrl("admin.logout"),
        },
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
        data: {
          categoryId: req.params.id,
          serviceSubCategoryList,
        },
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Define edit service sub-category controller method
  async editServiceSubCategoryPage(req, res) {
    const { id } = req.params;
    try {
      // Fetch single service sub-category details
      const result = await serviceRepo.getServiceSubCategoryById(id);

      res.render("service/views/editServiceSubCategory.ejs", {
        title: "Edit service sub-category page",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: generateUrl("technician.logout"),
        },
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
        data: {
          result,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error in rendering Edit Technician Page");
    }
  }

  // Define update service sub-category controller mehtod
  async updateServiceSubCategory(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }
      req.flash(
        "error",
        "Validation Errors: " +
          errors
            .array()
            .map((e) => e.msg)
            .join(", ")
      );
      return res.redirect(
        "/admin" +
          generateUrl("service-subCategory-edit-page", {
            id: req.params.id,
          })
      );
    }

    try {
      const { id } = req.params;

      const existingServiceSubCategory =
        await serviceRepo.getServiceSubCategoryById(id);

      if (!existingServiceSubCategory) {
        req.flash("error", "Service sub-category not found");
        return res.redirect("/admin" + generateUrl("service-table-page"));
      }

      const { title, description } = req.body;
      let userData = { title, description };

      if (req.file) {
        fs.unlink(
          "./public/uploads/service/" +
            path.basename(existingServiceSubCategory.serviceImage),
          (err) => {
            console.log(`Error in removing old pic ${err}`);
          }
        );
        userData.serviceImage = getRelativePath(req.file.path);
      } else {
        userData.serviceImage = existingServiceSubCategory.serviceImage;
      }

      const result = await serviceRepo.updateServiceSubCategoryById(
        id,
        userData
      );

      if (result) {
        req.flash("success", "Service sub-category updated successfully");
        return res.redirect("/admin" + generateUrl("service-table-page"));
      }
    } catch (error) {
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }
      req.flash(
        "error",
        "Error updating service sub-category: " + error.message
      );
      return res.redirect(
        "/admin" +
          generateUrl("service-subCategory-edit-page", {
            id: req.params.id,
          })
      );
    }
  }

  // Define delete service sub-category controller method
  async deleteServiceSubCategory(req, res) {
    try {
      // 1. Grab the service sub-category from the incoming request object which you want to delete
      const id = req.params.id;

      // 2. Fetch the technician based on id which you have to delete
      const subcategoryToDelete = await serviceRepo.deleteServiceSubCategory(
        id
      );

      // 5. Return success response
      req.flash(
        "success",
        "service subcategory deleted successfully successfully"
      );
      return res.redirect("/admin" + generateUrl("service-table-page"));
    } catch (error) {
      console.error("Error in deleteTechnician controller:", error);
      return res.redirect("/admin" + generateUrl("service-table-page"));
    }
  }
}

module.exports = new serviceContoller();
