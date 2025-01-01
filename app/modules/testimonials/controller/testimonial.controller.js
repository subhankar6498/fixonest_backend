const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const {
  getRelativePath,
  removeUploadedFile,
} = require("../../../middleware/multer");
const testimonialRepositories = require("../repositories/testimonial.repositories");

class TestimonialApiController {
  //create testimonial
  async addTestimonialPage(req, res) {
    try {
      res.render("testimonials/views/addTestimonial.ejs", {
        title: "Add Testimonial",
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
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  async createTestimonials(req, res) {
    const errors = validationResult(req);
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
      return res.redirect("/admin" + generateUrl("add-testimonial"));
    }
    try {
      const { clientName, talk } = req.body;
      const testimonialdata = {
        clientName,
        talk,
      };
      if (req.file) {
        testimonialdata.testimonialImage = getRelativePath(req.file.path);
      }
      const savedTestimonialData =
        await testimonialRepositories.createTestimonial(testimonialdata);
      if (savedTestimonialData) {
        req.flash("success", "New testimonial created succussfully");
        return res.redirect("/admin" + generateUrl("all-testimonials"));
      }
    } catch (error) {
      // Remove the uploading file while is error is happening in creating service category
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }
      console.log(`Error in creating new testimonial ${error}`);
      // Flash the error message to the user
      req.flash(
        "error",
        "An unexpected error occurred in creating new testimonial. Please try again later"
      );

      // Redirect to an appropriate page
      return res.redirect("/admin" + generateUrl("add-testimonial"));
    }
  }

  //get all testimonials
  async getAllTestimonialsData(req, res) {
    const allTestimonialsdata =
      await testimonialRepositories.getAllTestimonials();
    try {
      res.render("testimonials/views/testimonialsTable", {
        title: "Testimonials",
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
          allTestimonialsdata,
        },
      });
    } catch (error) {
      console.log(`Error in getting all contacts ${error}`);
    }
  }

  // async activateTestimonials(req, res) {
  //   try {
  //     const id = req.params.id;
  //     const activateTdata = await testimonialRepositories.updateTestimonials(
  //       id,
  //       { isActive: true }
  //     );
  //     if (activateTdata) {
  //       req.flash("success", "Your testimonial is activated");
  //       res.redirect("/admin/all-testimonials");
  //     } else {
  //       req.flash("error", "Error detected in activating testimonial");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async deActivateTestimonials(req, res) {
  //   try {
  //     const id = req.params.id;
  //     const deActivateTdata = await testimonialRepositories.updateTestimonials(
  //       id,
  //       { isActive: false }
  //     );
  //     if (deActivateTdata) {
  //       req.flash("error", "Your testimonial is deactivated");
  //       res.redirect("/admin/all-testimonials");
  //     } else {
  //       req.flash("error", "Error detected in activating testimonial");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async editTestimonialPage(req, res) {
    try {
      const id = req.params.id;
      const singledata = await testimonialRepositories.getSingleTestimonials(
        id
      );
      res.render("testimonials/views/editTestimonials.ejs", {
        title: "Edit testimonials page",
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
          singledata,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updateTestimonialsData(req, res) {
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
          generateUrl("testimonials-edit", {
            id: req.params.id,
          })
      );
    }
    try {
      const { id } = req.params;

      // Chek service category is exist or not
      const existingTestimonial =
        await testimonialRepositories.getSingleTestimonials(id);

      if (!existingTestimonial) {
        req.flash("error", "Testimonial data not found");
        return res.redirect("/admin" + generateUrl("all-testimonials"));
      }

      const { clientName, talk } = req.body;
      const testimonialData = { clientName, talk };

      // If new image is upload, old image should be unlink
      if (req.file) {
        fs.unlink(
          "./public/uploads/testimonials/" +
            path.basename(existingTestimonial.testimonialImage),
          (err) => {
            console.log(`Error in removing old pic ${err}`);
          }
        );
        testimonialData.testimonialImage = getRelativePath(req.file.path);
      } else {
        testimonialData.testimonialImage = existingTestimonial.testimonialImage;
      }

      const result = await testimonialRepositories.updateTestimonials(
        id,
        testimonialData
      );
      // console.log(result);

      if (result) {
        req.flash("success", "Testimonial data updated successfully");
        return res.redirect("/admin" + generateUrl("all-testimonials"));
      }
    } catch (error) {
      req.flash("error", "Error updating testimonials: " + error.message);
      return res.redirect(
        "/admin" +
          generateUrl("testimonial-edit", {
            id: req.params.id,
          })
      );
    }
  }

  async removeTestimonials(req, res) {
    try {
      const id = req.params.id;
      const removedTdata = await testimonialRepositories.deleteTestimonials(
        id,
        { isDeleted: true }
      );
      if (removedTdata) {
        fs.unlink(
          "./public/uploads/testimonials/" +
            path.basename(removedTdata.testimonialImage),
          (err) => {
            console.log(`Error in removing existing pic ${err}`);
          }
        );
        req.flash("success", "Your testimonial is removed successfully");
        res.redirect("/admin/all-testimonials");
      } else {
        req.flash("error", "Error detected in removing testimonial");
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new TestimonialApiController();
