const fs = require("fs");
const path = require("path");

// 3rd-party module
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// import model
const UserModel = require("../../auth/model/user.model");
const ServiceBookingModel = require("../../service/model/serviceBooking.model");
const TechnicianAssignmentModel = require("../../technician/model/technicianAssignment.model");

// import repositories
const technicianRepo = require("../repositories/technician.repositories");
const serviceRepo = require("../../service/repositories/service.repositories");

// import others
const {
  generateAccessTokenForTechnicain,
} = require("../../../helper/generateToken");
const { removeUploadedFile } = require("../../../middleware/multer");
const generatePassword = require("../../../helper/generateRandomPassword");
const { getRelativePath } = require("../../../middleware/multer");
const { transport } = require("../../../helper/mailer");
const { technicianVerificationEmail } = require("../././../../helper/mailer");

// Define User Controller
class TechnicianContoller {
  // Define Technician Registration Page controller method from admin panel
  async technicianRegistrationPage(req, res) {
    const getServiceCategoryList = await serviceRepo.getServiceCategoryList();
    try {
      res.render("technician/views/register.ejs", {
        title: "Technician Registration",
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
          getServiceCategoryList,
        },
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Define create technician controller method from admin panel
  async createTechnician(req, res) {
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
        "/admin" + generateUrl("technician-registration-page")
      );
    }

    try {
      // 2. Destructure the data fron the incoming request body
      const {
        firstName,
        lastName,
        email,
        mobileNo,
        country,
        state,
        city,
        pincode,
        role,
        specialization, // It store category id
        experience,
      } = req.body;

      // 3. Check user, if email is already register or not
      const existingUser = await technicianRepo.checkUserByEmail({ email });

      // 3b. If user already register, then send the "email already register" message, otherwise execute below code
      if (existingUser) {
        // 1. If email is already exist, then no uploaded file (which is coming from incoming request body) added in the upload directory
        if (req.file) {
          await removeUploadedFile(req.file.path);
        }

        // 3. Return the Error
        req.flash("error", "Opps!, technician already exists with this email");
        return res.redirect(
          "/admin" + generateUrl("technician-registration-page")
        );
      }
      // Convert category Id to category name
      const specializedCategory = await technicianRepo.getCategoryNamebyId(
        specialization
      );

      // 4. Initialize user data into another variable
      let userData = {
        firstName,
        lastName,
        email,
        mobileNo,
        address: { country, state, city, pincode },
        role,
        specialization: specializedCategory,
        experience,
      };

      // 5. Configure the user's Full Name and add the user's fullName request body
      if (firstName && lastName) {
        userData.fullName = `${firstName} ${lastName}`;
      }

      // 6.Create a random Password by using crypto by passing length
      const randomPassword = await generatePassword(6);

      // 7. Password Hash with static method
      const hashPassword = await UserModel.generateHashPassword(randomPassword);

      // 8. Update the password in userData
      userData.password = hashPassword;

      // 7. Define file upload --> If there's a file, add its path to the userData. Store the profile image in a variable
      if (req.file) {
        userData.profileImage = getRelativePath(req.file.path);
      }

      // 8.Call the registerUserRepo method to create technician
      const result = await technicianRepo.createTechinicianRepo(userData);

      // 9.Check user created successfully or not
      if (!result) {
        throw new Error("Failed to create user in the database");
      }

      // 10.Send email with login credentials
      // 10b.Set up email transport
      const senderEmail = process.env.SENDER_EMAIL;
      const emailPassword = process.env.EMAIL_PASSWORD;
      const transporter = transport(senderEmail, emailPassword); // set-up email server

      // 10c.Login Link
      const loginLink = ` ${req.protocol}://${req.get("host")}/${
        result.role
      }/login`;

      // 10d.Send the verification email
      const emailResponse = await technicianVerificationEmail(
        req,
        res,
        userData,
        transporter,
        loginLink,
        randomPassword
      );

      // 11.Sending response to the client
      if (emailResponse.status) {
        req.flash(
          "success",
          "Technician created successfully and login credentials sent to email"
        );
        return res.redirect(
          "/admin" + generateUrl("technician-registration-page")
        );
      }
    } catch (error) {
      // Remove the uploading file while is error is happening in creating user
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }

      // Log the error for debugging
      console.error("Error in create new user:", error);

      // Flash the error message to the user
      req.flash(
        "error",
        "An unexpected error occurred in creating new user. Please try again later"
      );

      // Redirect to an appropriate page
      return res.redirect(
        "/admin" + generateUrl("technician-registration-page")
      );
    }
  }

  // Define editTechnicina page controller mehtod
  async editTechnicinaPage(req, res) {
    const { technicinaId } = req.params;
    try {
      // Fetch single technician details
      const result = await technicianRepo.getSingleTechnicianDetails(
        technicinaId
      );

      // Get all service category list
      const getServiceCategoryList = await serviceRepo.getServiceCategoryList();

      res.render("technician/views/editTechnician.ejs", {
        title: "Edit Technician Page",
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
          getServiceCategoryList,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error in rendering Edit Technician Page");
    }
  }

  // Define update technician controller method
  async updateTechnician(req, res) {
    try {
      // Grab the technicain id from the params
      const { technicinaId } = req.params;

      const existingTechnician =
        await technicianRepo.getSingleTechnicianDetails(technicinaId);

      if (!existingTechnician) {
        req.flash("error", "Service sub-category not found");
        return res.redirect(
          "/admin" +
            generateUrl("technician-edit-page", {
              technicianId: req.params.technicianId,
            })
        );
      }

      // 2. Destructure the data fron the incoming request body
      const {
        firstName,
        lastName,
        email,
        mobileNo,
        country,
        state,
        city,
        pincode,
        role,
        specialization, // It store category id
        experience,
      } = req.body;

      // Convert category Id to category name
      const specializedCategory = await technicianRepo.getCategoryNamebyId(
        specialization
      );

      // 4. Initialize user data into another variable
      let userData = {
        firstName,
        lastName,
        email,
        mobileNo,
        address: { country, state, city, pincode },
        role,
        specialization: specializedCategory,
        experience,
      };

      // Unlink the image
      if (req.file) {
        fs.unlink(
          "./public/uploads/profile/" +
            path.basename(existingTechnician.profileImage),
          (err) => {
            console.log(`Error in removing old pic ${err}`);
          }
        );
        userData.profileImage = getRelativePath(req.file.path);
      } else {
        userData.profileImage = existingTechnician.profileImage;
      }

      // Update the data in the database
      const result = await technicianRepo.updateTechnicianDetails(
        technicinaId,
        userData
      );

      // Redirect to technicina table page
      if (result) {
        req.flash("success", "Technician updated successfully");
        return res.redirect("/admin" + generateUrl("technician-table-page"));
      }
    } catch (error) {
      res.status(500).send("Error in updating technician details");
      return res.redirect(
        "/admin" +
          generateUrl("technician-edit-page", {
            technicianId: req.params.technicianId,
          })
      );
    }
  }

  // Define deleteTechnician controller method
  async deleteTechnician(req, res) {
    try {
      // 1. Grab the technicianId from the incoming request object which you want to delete
      const technicianId = req.params.technicianId;

      // 2. Fetch the technician based on id which you have to delete
      const technicianToDelete = await technicianRepo.deleteTechnician(
        technicianId
      );

      // 3. Handle image deletion if exists
      if (
        technicianToDelete.profileImage &&
        technicianToDelete.profileImage !== "/uploads/default-image.png"
      ) {
        try {
          // Get the root directory of your project
          const rootDir = path.resolve("./");

          // Create path to the image in public/uploads/service directory
          // Remove the leading slash from profileImage if it exists
          const relativePath = technicianToDelete.profileImage.replace(
            /^\//,
            ""
          );
          const imagePath = path.join(rootDir, "public", relativePath);

          // Check if file exists before trying to delete
          await fs.access(imagePath);

          // Unlink (delete) the profile image
          await fs.unlink(imagePath);
          console.log(`Successfully deleted image: ${imagePath}`);
        } catch (error) {
          console.error("Error deleting image:", error.message);
          // Continue execution even if image deletion fails
        }
      }

      // 5. Return success response
      req.flash("success", "Technician updated successfully");
      return res.redirect("/admin" + generateUrl("technician-table-page"));
    } catch (error) {
      console.error("Error in deleteTechnician controller:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete technician",
        error: error.message,
      });
    }
  }

  // Define technician logout controller method from admin pannel
  async logout(req, res) {
    res.clearCookie("technician_token");
    req.flash("success", "Logout successfully");
    return res.redirect(generateUrl("technician-login-page"));
  }

  // Create Technician table page from admin pannel
  async technicianTablePage(req, res) {
    // Get total technicain list
    const technicianList = await technicianRepo.getTechnicianList();
    try {
      res.render("technician/views/technicianTable.ejs", {
        title: "Technician Table",
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
          technicianList,
        },
      });
    } catch (error) {
      console.error("Error rendering Technician table page:", error);
      res
        .status(500)
        .send("An error occurred while loading the Technician table page");
    }
  }

  // Define technicianloginPage controller method
  async technicianloginPage(req, res) {
    try {
      res.render("technician/views/login.ejs", {
        title: "Technician Login",
        layout: false,
      });
    } catch (error) {
      console.error("Error rendering technician login page:", error);
      res
        .status(500)
        .send("An error occurred while loading the technician login page");
    }
  }

  // Define technician login controller method
  async technicianLogin(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then  return error
    if (!errors.isEmpty()) {
      // Return the Error
      req.flash(
        "error",
        "Validation Errors: " +
          errors
            .array() // Converts the errors object into an array
            .map((e) => e.msg) //  Maps over the array of error objects, extracting the msg (message) property of each error.
            .join(", ") // Joins all error messages into a single string, separated by commas
      );
      return res.redirect(generateUrl("technician-login-page"));
    }
    try {
      // 2. Destructure email and password from the incoming request body
      const { email, password } = req.body;

      // 3. Check user, if email is already register or not
      const existingUser = await technicianRepo.checkUserByEmail({ email });
      if (!existingUser) {
        req.flash(
          "error",
          "Account not found. Plesae connect with Administrator"
        );
        return res.redirect(generateUrl("technician-login-page"));
      }

      // 4.Check if the user has the employee or admin role
      if (existingUser.role !== "technician") {
        req.flash(
          "error",
          "You do not have permission to access the employee Account"
        );
        return res.redirect(generateUrl("technician-login-page"));
      }

      // 5. Compare the password with the hash password so that we can match the password at the time of login
      const comparePassword = await UserModel.validPassword(
        password,
        existingUser.password // pass the user password which is store in the databaser as hashed
      );

      // 6. If password is not match the send the message "Invalid Password", otherwise execute the below code
      if (!comparePassword) {
        req.flash("error", "Invalid password");
        return res.redirect(generateUrl("technician-login-page"));
      }

      // 7. Generate access token at successfull login of user. Token will generate at the time of login
      const accessToken = await generateAccessTokenForTechnicain(existingUser);

      // 8. If token not generated then user will not logged in, otherwise he/she will be login
      if (!accessToken) {
        req.flash("error", "invalid credentials");
        return res.redirect(generateUrl("technician-login-page"));
      }

      // 9. Store the token in a cookie
      res.cookie("technician_token", accessToken, {
        httpOnly: true,
        maxAge: 3600000, // 1 hour in milliseconds
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Protect against CSRF
      });

      // 10.Role check
      if (existingUser.role === "technician") {
        // Verified the user
        existingUser.isVerified = true;

        // Save the updated user
        await existingUser.save();

        // Send response
        req.flash("success", "Technician Login successfully");
        return res.redirect(generateUrl("technician-dashboard-page"));
      }
    } catch (error) {
      //
    }
  }

  // Define Technician Dashboard Controller
  async technicianDashboard(req, res) {
    try {
      // Fetch all assignments for the technician using aggregation
      const aggregatedAssignments = await TechnicianAssignmentModel.aggregate([
        // Match assignments for the current technician
        {
          $match: {
            technician: new mongoose.Types.ObjectId(req.technician.id),
          },
        },
        // Sort by scheduled date
        {
          $sort: {
            scheduledDate: -1,
          },
        },
        // Lookup service booking details
        {
          $lookup: {
            from: "service_bookings",
            localField: "booking",
            foreignField: "_id",
            as: "booking",
          },
        },
        // Unwind the booking array (since it's a 1-1 relationship)
        {
          $unwind: "$booking",
        },
        // Lookup customer details
        {
          $lookup: {
            from: "customers",
            localField: "booking.customer",
            foreignField: "_id",
            as: "customer",
          },
        },
        // Unwind customer array
        {
          $unwind: "$customer",
        },
        // Lookup service category details
        {
          $lookup: {
            from: "service_categories",
            localField: "booking.serviceCategory",
            foreignField: "_id",
            as: "serviceCategory",
          },
        },
        // Unwind service category array
        {
          $unwind: "$serviceCategory",
        },
        // Lookup sub-category (service) details
        {
          $lookup: {
            from: "services",
            localField: "booking.subCategory",
            foreignField: "_id",
            as: "subCategory",
          },
        },
        // Unwind sub-category array
        {
          $unwind: "$subCategory",
        },
        // Project only the needed fields
        {
          $project: {
            _id: 1,
            status: 1,
            scheduledDate: 1,
            technicianNotes: 1,
            reasonForRejection: 1,
            "booking._id": 1,
            "booking.status": 1,
            "booking.description": 1,
            "booking.preferredDate": 1,
            "booking.preferredTimeSlot": 1,
            "booking.completionDate": 1,
            "customer.fullName": 1,
            "customer.email": 1,
            "customer.mobileNo": 1,
            "customer.address": 1,
            "serviceCategory.categoryName": 1,
            "subCategory.title": 1,
            // "subCategory.price": 1,
          },
        },
      ]);
      // Format the assignments to match the expected structure
      const assignments = aggregatedAssignments.map((assignment) => ({
        ...assignment,
        booking: {
          ...assignment,
          ...assignment.booking,
          customer: assignment.customer,
          serviceCategory: assignment.serviceCategory,
          subCategory: assignment.subCategory,
        },
      }));

      // Group assignments by status
      const bookings = {
        newAssignments: assignments.filter(
          (a) => a.booking.status === "assigned"
        ),
        inProgress: assignments.filter(
          (a) => a.booking.status === "in-progress"
        ),
        completed: assignments.filter((a) => a.booking.status === "completed"),
        rejected: assignments.filter((a) => a.booking.status === "rejected"),
      };

      // Count total bookings in each category
      const counts = {
        total: assignments.length,
        new: bookings.newAssignments.length,
        inProgress: bookings.inProgress.length,
        completed: bookings.completed.length,
        rejected: bookings.rejected.length,
      };

      // Alternative way to get counts using aggregation
      const statusCounts = await TechnicianAssignmentModel.aggregate([
        {
          $match: {
            technician: req.technician._id,
          },
        },
        {
          $lookup: {
            from: "service_bookings",
            localField: "booking",
            foreignField: "_id",
            as: "booking",
          },
        },
        {
          $unwind: "$booking",
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            new: {
              $sum: {
                $cond: [{ $eq: ["$status", "assigned"] }, 1, 0],
              },
            },
            inProgress: {
              $sum: {
                $cond: [{ $eq: ["$booking.status", "in-progress"] }, 1, 0],
              },
            },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
              },
            },
            rejected: {
              $sum: {
                $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
              },
            },
          },
        },
      ]);

      // Use the aggregated counts if available, otherwise use the counted ones
      const finalCounts = statusCounts.length > 0 ? statusCounts[0] : counts;

      res.render("technician/views/dashboard.ejs", {
        title: "Technician Dashboard",
        // Send path
        path: {
          home: generateUrl("technician-dashboard-page"),
          logout: generateUrl("technician.logout"),
          // updateStatus: generateUrl("update-assignment-status"),
        },
        // send data
        content: {
          firstName: req.technician.firstName,
          role: req.technician.role,
          profileImageUrl: req.technician.profileImage,
          bookings,
          counts: finalCounts,
        },
      });
    } catch (error) {
      console.error("Error rendering technician dashboard page:", error);
      res
        .status(500)
        .send("An error occurred while loading the dashboard page");
    }
  }

  // Booking assing to technician by admin
  async assignTechnician(req, res) {
    try {
      const { bookingId, technicianId } = req.params;
      const adminId = req.admin.id; // Get admin ID from authenticated user

      // Validate if booking and technician exist
      const [booking, technician] = await Promise.all([
        ServiceBookingModel.findById(bookingId),
        UserModel.findById(technicianId),
      ]);

      if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect(
          "/admin" +
            generateUrl("booking-assing-to-technician", {
              bookingId: bookingId,
              technicianId: technicianId,
            })
        );
      }

      if (!technician) {
        req.flash("error", "Technician not found");
        return res.redirect(
          "/admin" +
            generateUrl("booking-assing-to-technician", {
              bookingId: bookingId,
              technicianId: technicianId,
            })
        );
      }

      // Validate technician exists and is available
      if (!technician || technician.role !== "technician") {
        req.flash("error", "Technician not found or invalid role");
        return res.redirect(
          "/admin" +
            generateUrl("booking-assing-to-technician", {
              bookingId: bookingId,
              technicianId: technicianId,
            })
        );
      }

      if (!technician.isAvailable) {
        req.flash("error", "Technician is not available");
        return res.redirect(
          "/admin" +
            generateUrl("booking-assing-to-technician", {
              bookingId: bookingId,
              technicianId: technicianId,
            })
        );
      }

      // Check if booking is already assigned
      if (booking.status !== "pending") {
        req.flash("error", "Booking is already assigned or cannot be assigned");
        return res.redirect(
          "/admin" +
            generateUrl("booking-assing-to-technician", {
              bookingId: bookingId,
              technicianId: technicianId,
            })
        );
      }

      // Create technician assignment
      const assignment = await TechnicianAssignmentModel.create({
        booking: bookingId,
        technician: technicianId,
        assignedBy: adminId,
        scheduledDate: booking.preferredDate,
        priority: "medium", // Default priority
        estimatedDuration: 2, // Default duration in hours
        adminNotes: req.body.adminNotes || "none",
      });

      // Update booking status and current assignment
      await ServiceBookingModel.findByIdAndUpdate(bookingId, {
        status: "assigned",
        currentAssignment: assignment._id,
      });

      req.flash("success", "Technician assigned successfully");
      return res.redirect("/admin" + generateUrl("booking-table-page"));
    } catch (error) {
      console.error("Error in assignTechnician:", error);
      req.flash("error", "Failed to assign technician");
      return res.redirect(
        "/admin" +
          generateUrl("booking-assing-to-technician", {
            bookingId: bookingId,
            technicianId: technicianId,
          })
      );
    }
  }

  // Update assignment status
  async updateBookingStatus(req, res) {
    try {
      const { bookingId } = req.params;
      const { status, rejectionReason } = req.body;
      const technicianId = req.technician.id;

      // Find booking and its current assignment
      const booking = await ServiceBookingModel.findById(bookingId);
      if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect(
          "/admin" + generateUrl("technician-dashboard-page")
        );
      }

      const assignment = await TechnicianAssignmentModel.findOne({
        booking: bookingId,
        technician: technicianId,
      });
      if (!assignment) {
        req.flash("error", "Assignment not found");
        return res.redirect(
          "/admin" + generateUrl("technician-dashboard-page")
        );
      }
      // Update assignment status
      assignment.status = status;
      if (status === "rejected") {
        assignment.reasonForRejection = rejectionReason || "No reason provided";
      }
      await assignment.save();

      // Update booking status
      booking.status = status;
      if (status === "completed") {
        booking.completionDate = new Date();
        booking.paymentStatus = "paid";
      }
      await booking.save();

      req.flash("success", `Booking ${status} successfully`);
      return res.redirect(generateUrl("technician-dashboard-page"));
    } catch (error) {
      console.error("Error in updateAssignmentStatus:", error);
      req.flash("error", "Failed to update status");
      return res.redirect("/admin" + generateUrl("technician-dashboard-page"));
    }
  }

  //update technician password
  async updateTechnicianPasswordPage(req, res) {
    try {
      // Fetch all assignments for the technician using aggregation
      const aggregatedAssignments = await TechnicianAssignmentModel.aggregate([
        // Match assignments for the current technician
        {
          $match: {
            technician: new mongoose.Types.ObjectId(req.technician.id),
          },
        },
        // Sort by scheduled date
        {
          $sort: {
            scheduledDate: -1,
          },
        },
        // Lookup service booking details
        {
          $lookup: {
            from: "service_bookings",
            localField: "booking",
            foreignField: "_id",
            as: "booking",
          },
        },
        // Unwind the booking array (since it's a 1-1 relationship)
        {
          $unwind: "$booking",
        },
        // Lookup customer details
        {
          $lookup: {
            from: "customers",
            localField: "booking.customer",
            foreignField: "_id",
            as: "customer",
          },
        },
        // Unwind customer array
        {
          $unwind: "$customer",
        },
        // Lookup service category details
        {
          $lookup: {
            from: "service_categories",
            localField: "booking.serviceCategory",
            foreignField: "_id",
            as: "serviceCategory",
          },
        },
        // Unwind service category array
        {
          $unwind: "$serviceCategory",
        },
        // Lookup sub-category (service) details
        {
          $lookup: {
            from: "services",
            localField: "booking.subCategory",
            foreignField: "_id",
            as: "subCategory",
          },
        },
        // Unwind sub-category array
        {
          $unwind: "$subCategory",
        },
        // Project only the needed fields
        {
          $project: {
            _id: 1,
            status: 1,
            scheduledDate: 1,
            technicianNotes: 1,
            reasonForRejection: 1,
            "booking._id": 1,
            "booking.status": 1,
            "booking.description": 1,
            "booking.preferredDate": 1,
            "booking.preferredTimeSlot": 1,
            "booking.completionDate": 1,
            "customer.fullName": 1,
            "customer.email": 1,
            "customer.mobileNo": 1,
            "customer.address": 1,
            "serviceCategory.categoryName": 1,
            "subCategory.title": 1,
            // "subCategory.price": 1,
          },
        },
      ]);
      // Format the assignments to match the expected structure
      const assignments = aggregatedAssignments.map((assignment) => ({
        ...assignment,
        booking: {
          ...assignment,
          ...assignment.booking,
          customer: assignment.customer,
          serviceCategory: assignment.serviceCategory,
          subCategory: assignment.subCategory,
        },
      }));

      // Group assignments by status
      const bookings = {
        newAssignments: assignments.filter(
          (a) => a.booking.status === "assigned"
        ),
        inProgress: assignments.filter(
          (a) => a.booking.status === "in-progress"
        ),
        completed: assignments.filter((a) => a.booking.status === "completed"),
        rejected: assignments.filter((a) => a.booking.status === "rejected"),
      };

      // Count total bookings in each category
      const counts = {
        total: assignments.length,
        new: bookings.newAssignments.length,
        inProgress: bookings.inProgress.length,
        completed: bookings.completed.length,
        rejected: bookings.rejected.length,
      };

      // Alternative way to get counts using aggregation
      const statusCounts = await TechnicianAssignmentModel.aggregate([
        {
          $match: {
            technician: req.technician._id,
          },
        },
        {
          $lookup: {
            from: "service_bookings",
            localField: "booking",
            foreignField: "_id",
            as: "booking",
          },
        },
        {
          $unwind: "$booking",
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            new: {
              $sum: {
                $cond: [{ $eq: ["$status", "assigned"] }, 1, 0],
              },
            },
            inProgress: {
              $sum: {
                $cond: [{ $eq: ["$booking.status", "in-progress"] }, 1, 0],
              },
            },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
              },
            },
            rejected: {
              $sum: {
                $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
              },
            },
          },
        },
      ]);

      // Use the aggregated counts if available, otherwise use the counted ones
      const finalCounts = statusCounts.length > 0 ? statusCounts[0] : counts;

      res.render("technician/views/updatePassword.ejs", {
        title: "Technician Update Password",
        // Send path
        path: {
          home: generateUrl("technician-dashboard-page"),
          logout: generateUrl("technician.logout"),
          // updateStatus: generateUrl("update-assignment-status"),
        },
        // send data
        content: {
          firstName: req.technician.firstName,
          role: req.technician.role,
          profileImageUrl: req.technician.profileImage,
          bookings,
          counts: finalCounts,
        },
      });
    } catch (error) {
      console.error("Error rendering technician update password page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Define updateTechnicianPassword controller method
  async updateTechnicianPassword(req, res) {
    // 1. Check validation of update email request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then return error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 400,
        message: "Validation Errors",
        errors: errors.array(),
      });
    }
    try {
      // 2. Retrieve the user's ID from the JWT token (req.user is set by authentication middleware)
      const technicianId = req.technician.id;

      // 3. Get the current password and new passwrod from the request body
      const { currentPassword, newPassword } = req.body;

      // 4. Find the user by their ID. If not found, return a 404 error
      const existingUser = await technicianRepo.getSingleTechnicianDetails(
        technicianId
      );
      if (!existingUser) {
        req.flash("errorMessage", "Technician not found");
        res.redirect("/technician-updatepassword");
        // return res.status(404).json({ status: 404, message: "Technician not found" });
      }

      // console.log(currentPassword, existingUser.password);
      // 5. Verify current password
      const comparePassword = await UserModel.validPassword(
        currentPassword,
        existingUser.password // pass the user password which is store in the databaser as hashed
      );

      // 6. If password is not match the send the message "Invalid Password", otherwise execute the below code
      if (!comparePassword) {
        req.flash("errorMessage", "Invalid password");
        res.redirect("/technician-updatepassword");
        // return res.status(401).json({
        //   status: 401,
        //   message: "Invalid password",
        // });
      }

      // 7. Check if new password is the same as the current password
      if (currentPassword === newPassword) {
        req.flash(
          "errorMessage",
          "New password must be different from current password"
        );
        res.redirect("/technician-updatepassword");
        // return res.status(400).json({
        //   status: 400,
        //   message: "New password must be different from current password",
        // });
      }

      // 8. Password Hash
      const hashPassword = await UserModel.generateHashPassword(newPassword);

      // 9. Update password in database
      existingUser.password = hashPassword; // update the Password in existing user
      const result = await existingUser.save();

      if (result) {
        req.flash(
          "successMessage",
          "Your Password has been updated successfully"
        );
        return res.redirect("/technician/login");
      } else {
        return res.redirect("/technician-updatepassword");
      }
    } catch (error) {
      console.log(`Error in updating technician password ${error}`);
    }
  }

  // Define active or inactive technician
  async activeInactiveTechnician(req, res) {
    try {
      const technicianId = req.params.id;

      // Find technician
      const existingTechnician =
        await technicianRepo.getSingleTechnicianDetails(technicianId);

      if (!existingTechnician) {
        req.flash("errorMessage", "Technician not found");
        res.redirect("/admin/technician-table-page");
        // return res.status(404).json({ status: 404, message: "Technician not found" });
      }

      // Toggle the blog status
      const newTechnicianStatus =
        existingTechnician.status === "active" ? "inactive" : "active";

      // Update the data in the database
      await UserModel.findByIdAndUpdate(
        technicianId,
        { status: newTechnicianStatus },
        { new: true }
      );

      // res.status(200).json({ status: newBlogStatus });
      // Redirect to Admin DashBoard page
      res.redirect("/admin/technician-table-page");
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
}

module.exports = new TechnicianContoller();
