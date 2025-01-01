// 3rd-party module
const { validationResult } = require("express-validator");

// import model
const UserModel = require("../model/user.model");

// import repositories
const authRepo = require("../repositories/auth.repositories");
const technicianRepo = require("../../technician/repositories/technician.repositories");

// import others
const {
  removeUploadedFile,
  getRelativePath,
} = require("../../../middleware/multer");
const { transport, sendVerificationEmail } = require("../../../helper/mailer");
const {
  handleRegistrationVerification,
} = require("../../../helper/emailVerification");
const { generateAccessToken } = require("../../../helper/generateToken");
const bookingRepositories = require("../../bookings/repositories/booking.repositories");

// Define User Controller
class AuthContoller {
  // Define Registration page controller method
  async registrationPage(req, res) {
    try {
      res.render("auth/views/register.ejs", {
        layout: false,
        title: "Admin Registration",
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Define admin Registration controller method
  async registration(req, res) {
    // 1. Check validation of register request
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
      return res.redirect("/admin" + generateUrl("admin-registration-page"));
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
        street,
        password,
      } = req.body;

      // 2. Check user, if email is already register or not
      const existingUser = await authRepo.checkUserByEmail({ email });

      // 2b. If user already register, then send the "email already register" message, otherwise execute below code
      if (existingUser) {
        // 1. If email is already exist, then no uploaded file (which is coming from incoming request body) added in the upload directory
        if (req.file) {
          await removeUploadedFile(req.file.path);
        }

        // 3. Return the Error
        req.flash("error", "Opps!, admin already exists with this email");
        return res.redirect("/admin" + generateUrl("admin-registration-page"));
      }

      // 3. Initialize user data into another variable
      let userData = {
        firstName,
        lastName,
        email,
        mobileNo,
        address: { country, state, city, street },
        password,
      };

      // 3a.

      // 4. Configure the user's Full Name and add the user's fullName request body
      if (firstName && lastName) {
        userData.fullName = `${firstName} ${lastName}`;
      }

      // 5. Password Hash with static method
      const hashPassword = await UserModel.generateHashPassword(password);

      // 6. Update the password in userData
      userData.password = hashPassword;

      // 7. Define file upload --> If there's a file, add its path to the userData. Store the profile image in a variable
      if (req.file) {
        userData.profileImage = getRelativePath(req.file.path);
      }

      // 8. Call the registerUserRepo method to create user registration
      const result = await authRepo.registration(userData);

      // 9. Return the response to the client
      if (!(result && result._id)) {
        req.flash("error", "User registration failed");
        return res.redirect("/admin" + generateUrl("admin-registration-page"));
      } else {
        // 1. Call the create crypto token repo method so that token is create in the database for email verification
        const savedToken = await authRepo.createToken(result._id);

        // 2. Set up email transport
        const senderEmail = process.env.SENDER_EMAIL;
        const emailPassword = process.env.EMAIL_PASSWORD;

        // 3. Set-up email server
        const transporter = transport(senderEmail, emailPassword);

        // 4. Send the verification email
        const emailResponse = await sendVerificationEmail(
          req,
          res,
          transporter,
          savedToken,
          result
        );

        // 5. Sending response to the clien
        if (emailResponse.status) {
          req.flash(
            "success",
            "User registration successful. A verification link has been sent to your registered email address. Please verify within 2 minutes"
          );
          return res.redirect("/admin" + generateUrl("admin-login-page"));
        }
      }
    } catch (error) {
      // Remove the uploading file while is error is happening in creating user
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }

      // Log the error for debugging
      console.error("Error in admin registration:", error);

      // Flash the error message to the user
      req.flash(
        "error",
        "An unexpected error occurred in admin registration. Please try again later"
      );

      // Redirect to an appropriate page
      return res.redirect("/admin" + generateUrl("admin-registration-page"));
    }
  }

  // Define route to verify email with validation
  async verifyEmail(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check, if errors is not empty, then first unlink the uploaded image and return error
    if (!errors.isEmpty()) {
      req.flash(
        "error",
        "Validation Errors : " +
          errors
            .array()
            .map((e) => e.msg)
            .join(", ")
      );
      res.redirect("/admin" + generateUrl("admin-login-page"));
    }

    try {
      // 2. Destructure the email and token from request params
      const { role, id, email, token } = req.params;

      // 2. Check user, if email is already register or not
      const existingUser = await authRepo.checkUserById({ _id: id });

      // 2b. If user already register, then send the "email already register" message, otherwise execute below code
      if (!existingUser) {
        req.flash(
          "error",
          "User not found.Please register or check your email"
        );
        return res.redirect("/admin" + generateUrl("admin-login-page"));
      }

      // 3.Find the token in the database based on userId
      const savedToken = await authRepo.findToken({
        _userId: existingUser._id,
        token,
      });

      // If the token is not available, then token is invalid or expired
      if (!savedToken) {
        req.flash("error", "Invalid or expired token");
        return res.redirect("/admin" + generateUrl("admin-login-page"));
      }

      // 4. If the email verification token is not available, then token is invalid or expired
      if (savedToken) {
        const isVerified = await handleRegistrationVerification(
          req,
          res,
          existingUser,
          savedToken
        );

        // b.Delete email token after successful verification
        await authRepo.deleteToken({ _id: savedToken._id });

        // a.Send a success response indicating the email has been verified
        if (isVerified) {
          req.flash(
            "success",
            "Email successfully verified! You can now login"
          );
          return res.redirect("/admin" + generateUrl("admin-login-page"));
        }
      } else {
        req.flash("error", "Verification failed");
        return res.redirect("/admin" + generateUrl("admin-login-page"));
      }
    } catch (error) {
      // Log the error for debugging
      console.error("Error in admin registration verify Email:", error);

      // Flash the error message to the user
      req.flash(
        "error",
        "An unexpected error occurred in admin registration verify Email. Please try again later"
      );

      // Redirect to an appropriate page
      return res.redirect("/admin" + generateUrl("admin-login-page"));
    }
  }

  // Define loginPage controlelr method
  async loginPage(req, res) {
    try {
      res.render("auth/views/login.ejs", {
        layout: false,
        title: "Admin login",
      });
    } catch (error) {
      console.error("Error rendering admin registration page:", error);
      res
        .status(500)
        .send("An error occurred while loading the registration page");
    }
  }

  // Define login Controller method
  async login(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then first unlink the uploaded image and return error
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
      return res.redirect("/admin" + generateUrl("admin-login-page"));
    }
    try {
      // 2. Destructure email and password from the incoming request body
      const { email, password } = req.body;

      // 3. Find user by email
      const existingUser = await authRepo.checkUserByEmail({ email });

      // 3. Check user, if email is already register or not
      if (!existingUser) {
        req.flash("error", "You are not registered. Please register yourself");
        return res.redirect("/admin" + generateUrl("admin-registration-page"));
      }

      // 4. Only Admin role can access Admin Account
      if (existingUser.role !== "admin") {
        req.flash("error", "You do have to permission to access these account");
        return res.redirect("/admin" + generateUrl("admin-login-page"));
      }

      // 5. Check if the user is already verified or not
      if (!existingUser.isVerified) {
        req.flash(
          "error",
          "You are not a verified user. Please verify yourself before login"
        );
        res.redirect("/admin" + generateUrl("admin-login-page"));
      }

      // 6. Compare the password with the hash password so that we can match the password at the time of login
      const comparePassword = await UserModel.validPassword(
        password,
        existingUser.password // pass the user password which is store in the databaser as hashed
      );

      // 7. If password is not match the send the message "Invalid Password", otherwise execute the below code
      if (!comparePassword) {
        req.flash("error", "Invalid Password");
        return res.redirect("/admin" + generateUrl("admin-login-page"));
      }

      // 8. Generate access token at successfull login of user. Token will generate at the time of login
      const accessToken = await generateAccessToken(existingUser);

      // 9. If token not generated then user will not logged in, otherwise he/she will be login
      if (!accessToken) {
        req.flash("error", "invalid credentials");
        return res.redirect("/admin" + generateUrl("admin-login-page"));
      }

      // Store the access token in a cookie
      res.cookie("admin_token", accessToken, {
        httpOnly: true,
        maxAge: 3600000, // 1 hour in milliseconds
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Redirect to the admin dashboard
      req.flash("success", "Login successfull");
      return res.redirect(generateUrl("admin-dashboard-page") + "admin");
    } catch (error) {
      // Log the error for debugging
      console.error("Error in admin login:", error);

      // Flash the error message to the user
      req.flash(
        "error",
        "An unexpected error occurred in admin login. Please try again later"
      );

      // Redirect to an appropriate page
      return res.redirect("/admin" + generateUrl("admin-login-page"));
    }
  }

  // Define Dashboard controller method
  async dashboard(req, res) {
    // Get the all technician
    const totalTechnicina = await technicianRepo.GetTotalTechnicina();

    // Get all the active technician
    const totalActiveTechnicina =
      await technicianRepo.GetTotalActiveTechnicina();

    // Get all the pending bookings
    const totalPendingBooking =
      await bookingRepositories.getAllPendingBookings();

    // Get all the completed bookings
    const completedBookings =
      await bookingRepositories.getAllCompletedBookings();
    try {
      res.render("auth/views/dashboard.ejs", {
        title: "Admin Dashboard",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: "/admin" + generateUrl("admin.logout"),
        },
        // send data
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
        data: {
          totalNoOfTechnician: totalTechnicina.length,
          totalNoOfActiveTechnician: totalActiveTechnicina.length,
          totalNoOfPedingBookings: totalPendingBooking.length,
          totalNoOfCompletedBookings: completedBookings.length,
        },
      });
    } catch (error) {
      console.error("Error rendering admin dashboard page:", error);
      res
        .status(500)
        .send("An error occurred while loading the dashboard page");
    }
  }

  // Define Dashboard controller method
  async updatePasswordPage(req, res) {
    try {
      res.render("auth/views/updatePassword.ejs", {
        title: "Admin Update Password",
        // Send path
        path: {
          home: "/admin" + generateUrl("admin-dashboard-page"),
          logout: "/admin" + generateUrl("admin.logout"),
        },
        // send data
        content: {
          firstName: req.admin.firstName,
          role: req.admin.role,
          profileImageUrl: req.admin.profileImage,
        },
      });
    } catch (error) {
      console.error("Error rendering admin dashboard page:", error);
      res
        .status(500)
        .send("An error occurred while loading the dashboard page");
    }
  }

  async updateAdminPassword(req, res) {
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
      const adminId = req.admin.id;

      // 3. Get the current password and new passwrod from the request body
      const { currentPassword, newPassword } = req.body;

      // 4. Find the user by their ID. If not found, return a 404 error
      const existingUser = await authRepo.checkUserById(adminId);
      if (!existingUser) {
        req.flash("errorMessage", "Admin not found");
        res.redirect("/admin/admin-updatepassword");
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
        res.redirect("/admin/admin-updatepassword");
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
        res.redirect("/admin/admin-updatepassword");
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
        res.redirect("/admin/login");
      } else {
        res.redirect("/admin/admin-updatepassword");
      }
    } catch (error) {
      console.log(`Error in updating admin password ${error}`);
    }
  }

  // Define logout controller method
  async logout(req, res) {
    res.clearCookie("admin_token"); // Clear access token from cookie
    req.flash("success", "Logout successfully");
    return res.redirect("/admin" + generateUrl("admin-login-page"));
  }
}

module.exports = new AuthContoller();
