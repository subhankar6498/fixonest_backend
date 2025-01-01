// 3rd-party module
const { validationResult } = require("express-validator");

// import model
const CustModel = require("../modules/customer/model/customer.model");

// import repositories
const custRepo = require("../modules/customer/repositories/customer.repositories");

// import others
const { removeUploadedFile, getRelativePath } = require("../middleware/multer");
const {
  transport,
  customerVerificationEmail,
  forgotPasswordVerificationEmail,
} = require("../helper/mailer");
const {
  handleCustomerRegistrationVerification,
} = require("../helper/emailVerification");
const { generateAccessTokenForCustomer } = require("../helper/generateToken");

// Define User Controller
class CustomerContoller {
  // Define customerRegistration controller method
  async customerRegistration(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then first unlink the uploaded image and return error
    if (!errors.isEmpty()) {
      // 1. If validation is failed, then no uploaded file (which is coming from incoming request body) added in the upload directory
      if (req.file) {
        await removeUploadedFile(req.file.path);
      }

      // 2. Return the Error
      return res.status(400).json({
        status: 400,
        message: "Validation Errors",
        errors: errors.array(),
      });
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
        landmark,
        pincode,
        password,
      } = req.body;

      // 3. Check user, if email is already register or not
      const existingUser = await custRepo.checkUserByEmail({ email });

      // 2b. If user already register, then send the "email already register" message, otherwise execute below code
      if (existingUser) {
        // 1. If email is already exist, then no uploaded file (which is coming from incoming request body) added in the upload directory
        if (req.file) {
          await removeUploadedFile(req.file.path);
        }

        // 2. response sent to the client
        return res.status(409).json({
          status: 409,
          message: "Sorry, user already exist with these email",
        });
      }

      // 4. Initialize user data into another variable
      let userData = {
        firstName,
        lastName,
        email,
        mobileNo,
        address: {
          country,
          state,
          city,
          street,
          landmark,
          pincode,
        },
        password,
      };

      // 5. Configure the user's Full Name and add the user's fullName request body
      if (firstName && lastName) {
        userData.fullName = `${firstName} ${lastName}`;
      }

      // 6. Password Hash
      const hashPassword = await CustModel.generateHashPassword(password);

      // 7. Update the password in userData
      userData.password = hashPassword;

      // 8. Define file upload --> If there's a file, add its path to the userData. Store the profile image in a variable
      if (req.file) {
        userData.profileImage = getRelativePath(req.file.path);
      }

      // 8. Call the registerUserRepo method to create user registration
      const result = await custRepo.registration(userData);

      // 9. Return the response to the client
      if (!(result && result._id)) {
        return res.status(400).json({
          status: 400,
          message: "User registration failed",
        });
      } else {
        // 1. Call the create crypto token repo method so that token is create in the database for email verification
        const savedToken = await custRepo.createToken(result._id);

        // 2. Set up email transport
        const senderEmail = process.env.SENDER_EMAIL;
        const emailPassword = process.env.EMAIL_PASSWORD;

        // 3. Set-up email server
        const transporter = transport(senderEmail, emailPassword);

        // 4. Send the verification email
        const emailResponse = await customerVerificationEmail(
          req,
          res,
          transporter,
          savedToken,
          result
        );

        // 5. Sending response to the client
        if (emailResponse.status) {
          return res.status(201).json({
            status: 201,
            message: "User registration successful but Verification Pending",
            info: "A verification link has been sent to your registered email address. Please verify within 2 minutes.",
            data: result,
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  // Define Verify Registration E-mail controller method
  async verifyEmail(req, res) {
    // 1. Check validation of verifyEmail request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 400,
        message: "Validation Errors",
        errors: errors.array(),
      });
    }

    try {
      // 2. Destructure the email and token from request params
      const { id, email, token } = req.params;

      // 3. Check user, if email is already register or not
      const existingUser = await custRepo.checkUserById({ _id: id });

      // 2b. If user already register, then send the "email already register" message, otherwise execute below code
      if (!existingUser) {
        return res.status(404).json({
          status: 404,
          message: "Your are not registered. Please register yourself",
        });
      }

      // 3.Find the token in the database based on userId
      const savedToken = await custRepo.findToken({
        _userId: existingUser._id,
        token,
      });

      // 4. If the email verification token is not available, then token is invalid or expired
      if (!savedToken) {
        return res.status(400).json({
          status: 400,
          message:
            "Invalid or expired token. Please request a new verification link",
        });
      }

      // 5.If token available, then do the customer registration
      if (savedToken) {
        const result = await handleCustomerRegistrationVerification(
          existingUser
        );

        if (!result.success) {
          return res.status(result.status).json({
            status: result.status,
            message: result.message,
          });
        }

        // Delete email token after successful verification
        await custRepo.deleteToken({ _id: savedToken._id });

        // Send success response
        return res.status(200).json({
          status: 200,
          message: "Email successfully verified! You can now login",
          isVerified: true,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  // Define customerLogin controller method
  async customerLogin(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then  return error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 400,
        message: "Validation Errors",
        errors: errors.array(),
      });
    }
    try {
      // 2. Destructure email and password from the incoming request body
      const { email, password } = req.body;

      // 3. Check user, if email is already register or not
      const existingUser = await custRepo.checkUserByEmail({ email });
      if (!existingUser) {
        return res.status(404).json({
          status: 404,
          message: "Your are not register. Please register yourself",
        });
      }

      // 4. Check if the user is already verified or not
      if (!existingUser.isVerified) {
        return res.status(400).json({
          status: 400,
          message:
            "You are not verified user. Please verify yourself before login",
        });
      }

      // 5. Compare the password with the hash password so that we can match the password at the time of login
      const comparePassword = await CustModel.validPassword(
        password,
        existingUser.password // pass the user password which is store in the databaser as hashed
      );

      // 6. If password is not match the send the message "Invalid Password", otherwise execute the below code
      if (!comparePassword) {
        return res.status(401).json({
          status: 401,
          message: "Invalid password",
        });
      }

      // 8. Generate access token at successfull login of user. Token will generate at the time of login
      const accessToken = await generateAccessTokenForCustomer(existingUser);

      // 8. If token not generated then user will not logged in, otherwise he/she will be login
      if (!accessToken) {
        return res.status(401).json({
          status: 401,
          message: "Invalid Creadentials",
        });
      } else {
        return res.status(200).json({
          status: 200,
          message: "Login successfully",
          data: existingUser,
          token: accessToken,
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  // Define getCustomerProfile controller method
  async getCustomerProfile(req, res) {
    try {
      // 1.Grab the user data from the jwt which is set at the time of token creation (login)
      const userData = await custRepo.getUserDetailsById(req.user.id);

      // 2.If user is not available then stop the code execution and return a message "User not found"
      if (!userData) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }

      // 3. If user is available then return the response
      res.status(200).json({
        status: 200,
        message: "User profile fetch successfully",
        data: userData,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  // Define updateCustomerPassword controller method
  async updateCustomerPassword(req, res) {
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
      const userId = req.user.id;

      // 3. Get the current password and new passwrod from the request body
      const { currentPassword, newPassword } = req.body;

      // 4. Find the user by their ID. If not found, return a 404 error
      const existingUser = await custRepo.getUserByIdRepo(userId);
      if (!existingUser) {
        return res.status(404).json({ status: 404, message: "User not found" });
      }

      // 5. Verify current password
      const comparePassword = await CustModel.validPassword(
        currentPassword,
        existingUser.password // pass the user password which is store in the databaser as hashed
      );

      // 6. If password is not match the send the message "Invalid Password", otherwise execute the below code
      if (!comparePassword) {
        return res.status(401).json({
          status: 401,
          message: "Invalid password",
        });
      }

      // 7. Check if new password is the same as the current password
      if (currentPassword === newPassword) {
        return res.status(400).json({
          status: 400,
          message: "New password must be different from current password",
        });
      }

      // 8. Password Hash
      const hashPassword = await CustModel.generateHashPassword(newPassword);

      // 9. Update password in database
      existingUser.password = hashPassword; // update the Password in existing user
      const result = await existingUser.save();

      if (result) {
        res.status(200).json({
          status: 200,
          message: "Password updated successfully",
        });
      } else {
        res
          .status(500)
          .json({ status: 500, message: "Failed to update password" });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  // Define forgot password email verification controller method
  async forgotPassword(req, res) {
    // 1. Check validation of verifyEmail request
    const errors = validationResult(req);

    // 2. Return the Error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 400,
        message: "Validation Errors",
        errors: errors.array(),
      });
    }
    try {
      // 3.Destructure the email from request body
      const { email } = req.body;

      // 4.Find the user based on email
      const existingUser = await custRepo.checkUserByEmail({ email });
      if (!existingUser) {
        return res.status(404).json({
          status: 404,
          message: "Your are not register user. Please register yourself",
        });
      }

      // 5. Call the create token repo method so that token is create in the database for email verification
      const generateTokenForForgotPassword = await custRepo.createToken(
        existingUser._id // Pass the user Id
      );

      // 6. Set up email transport
      const senderEmail = process.env.SENDER_EMAIL;
      const emailPassword = process.env.EMAIL_PASSWORD;

      // 2. Set up email transport
      const transporter = transport(senderEmail, emailPassword);

      // 3. Send the forgot password verification email
      const emailResponse = await forgotPasswordVerificationEmail(
        req,
        res,
        existingUser,
        transporter,
        generateTokenForForgotPassword
      );

      // 5. Sending response to the client
      if (emailResponse.status) {
        res.status(200).json({
          status: 200,
          message:
            "Forgot password verification link has been sent to your registered email address. Please check and verify within 5 minutes",
        });
      } else {
        res
          .status(500)
          .json({ message: "Failed to send reset password verification link" });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  // Define forgot password email verification confirmation controller method
  async passwordConfirmation(req, res) {
    try {
      // Find the token in the database using the provided token from the URL
      const token = await custRepo.forgotPasswordEmailConfirmation({
        token: req.params.token,
      });

      if (!token) {
        return res
          .status(400)
          .json({ message: "Verification link may have expired." });
      }

      // Find the user associated with the token and the provided email
      const user = await custRepo.findUserByidAndMail({
        _id: token._userId,
        email: req.params.email,
      });

      if (!user) {
        res.status(400).json({ message: "Please Register Yourself" });
      } else {
        // Delete Token Automatically after user Verification
        await custRepo.deleteToken({ _id: token._id });

        return res.status(200).json({ message: "User Verified Successfully" });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  // Define reset password email verification controller method
  async resetPassword(req, res) {
    try {
      // Extract email and token from the request params
      const { email } = req.params;

      // 2. Extract newPassword from incoming request body
      const { newPassword } = req.body;

      // 3. Call the repository method to check email is already exist or not
      const existingUser = await custRepo.checkUserByEmail({
        email,
      });

      // 4. If email and firstScholl not found, then send 400 response
      if (!existingUser) {
        return res.status(400).json({
          status: 400,
          message: "Wrong email",
        });
      }

      // 5. If email are correct, then hash the new password which is present in incoming request body
      const hashPassword = await CustModel.generateHashPassword(newPassword);

      // 6. Call the repository method to update the new password in the database based on userId
      await custRepo.forgotPasswordRepo(existingUser._id, {
        password: hashPassword,
      });

      // 7. Response to the client
      res.status(200).json({
        status: 200,
        message: "Password Reset Successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
}

module.exports = new CustomerContoller();
