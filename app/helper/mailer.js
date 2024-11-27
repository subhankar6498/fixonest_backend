// 3rd-party module
const nodeMailer = require("nodemailer");

//  Set up email transport
const transport = (senderEmail, password) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com", // fallback if environment variable is not set,
    port: process.env.EMAIL_PORT || 587, // default to standard SMTP port
    secure: false,
    requireTLS: true,
    auth: {
      user: senderEmail,
      pass: password,
    },
  });
  return transporter;
};

// Send verification email
const sendVerificationEmail = async (
  req,
  res,
  transporter,
  savedToken,
  result
) => {
  // Verification email template
  const verificationEmailOptions = {
    from: `Fixonest <${process.env.SENDER_EMAIL}>`, // Professional format for sender
    to: result.email,
    subject: "Action Required: Verify Your Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333;">Hello ${result.fullName},</h2>
      <p style="color: #555; font-size: 16px;">
        Thank you for registering with <strong>Fixonest</strong>. To complete your registration, please verify your account by clicking the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${req.protocol}://${req.get("host")}/admin/${
      result.role
    }/confirmation/${result._id}/${result.email}/${savedToken.token}" 
           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
           Verify Account
        </a>
      </div>
      <p style="color: #555; font-size: 14px;">
        Or copy and paste this link into your browser:
      </p>
      <p style="word-wrap: break-word; color: #555;">
        ${req.protocol}://${req.get("host")}/admin/${
      result.role
    }/confirmation/${result._id}/${result.email}/${savedToken.token}
      </p>
      <p style="color: #555; font-size: 14px;">
        If you didn’t create an account with us, please ignore this email.
      </p>
      <p style="color: #333; font-size: 16px;">
        Thank you,<br/>
        <strong>Fixonest</strong> Team
      </p>
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply to this email.
      </p>
      </div>
      `,
  };

  try {
    const info = await transporter.sendMail(verificationEmailOptions);
    // console.log(`Email sent: ${info.messageId}`);

    // Return if succesfully main is send
    return { status: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email:", error.message);
    return {
      status: false,
      message: error.message,
    };
  }
};

// send customer verification email
const customerVerificationEmail = async (
  req,
  res,
  transporter,
  savedToken,
  result
) => {
  // Verification email template
  const verificationEmailOptions = {
    from: `Fixonest <${process.env.SENDER_EMAIL}>`, // Professional format for sender
    to: result.email,
    subject: "Action Required: Verify Your Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333;">Hello ${result.fullName},</h2>
      <p style="color: #555; font-size: 16px;">
        Thank you for registering with <strong>Fixonest</strong>. To complete your registration, please verify your account by clicking the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${req.get("origin")}/api/confirmation/${result._id}/${
      result.email
    }/${savedToken.token}" 
           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
           Verify Account
        </a>
      </div>
      <p style="color: #555; font-size: 14px;">
        Or copy and paste this link into your browser:
      </p>
      <p style="word-wrap: break-word; color: #555;">
      ${req.get("origin")}/api/confirmation/${result._id}/${result.email}/${
      savedToken.token
    }
      </p>
      <p style="color: #555; font-size: 14px;">
        If you didn’t create an account with us, please ignore this email.
      </p>
      <p style="color: #333; font-size: 16px;">
        Thank you,<br/>
        <strong>Fixonest</strong> Team
      </p>
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated message, please do not reply to this email.
      </p>
      </div>
      `,
  };

  try {
    const info = await transporter.sendMail(verificationEmailOptions);
    // console.log(`Email sent: ${info.messageId}`);

    // Return if succesfully main is send
    return { status: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email:", error.message);
    return {
      status: false,
      message: error.message,
    };
  }
};

// Techinician verfication email
const technicianVerificationEmail = async (
  req,
  res,
  userData,
  transporter,
  loginLink,
  randomPassword
) => {
  // Verification email template
  const verificationEmailOptions = {
    from: `"Fixonest" <${process.env.SENDER_EMAIL}>`,
    to: userData.email,
    subject: "Your Fixonest Account Credentials - Action Required",
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <h2 style="color: #333;">Welcome ${userData.firstName} ${userData.lastName},</h2>
    <p style="color: #555; font-size: 16px;">
      Your account has been successfully created by our administrator. You can now log in and explore <strong>Fixonest</strong>. Below are your temporary login credentials:
    </p>
    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px;">
      <p style="color: #333; font-size: 16px;"><strong>Email:</strong> ${userData.email}</p>
      <p style="color: #333; font-size: 16px;"><strong>Temporary Password:</strong> ${randomPassword}</p>
    </div>
    <p style="color: #555; font-size: 16px;">
      To log in, click the button below or use the following link:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginLink}" 
         style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
         Log In to Your Account
      </a>
    </div>
    <p style="word-wrap: break-word; color: #555; font-size: 14px;">
      ${loginLink}
    </p>
    <p style="color: #555; font-size: 16px;">
      <strong>Important:</strong> For security reasons, you are required to change your password upon your first login. Please create a new password that meets the following criteria:
    </p>
    <ul style="color: #555; font-size: 16px;">
      <li>Must be at least 7 characters long</li>
      <li>Contains at least one uppercase letter</li>
      <li>Contains at least one lowercase letter</li>
      <li>Contains at least one number</li>
      <li>Contains at least one special character</li>
    </ul>
    <p style="color: #555; font-size: 16px;">
      Creating a strong, unique password helps ensure the security of your account and personal information.
    </p>
    <p style="color: #555; font-size: 14px;">
      If you didn't request this account, please contact our support team immediately.
    </p>
    <p style="color: #333; font-size: 16px;">
      Thank you for choosing eShop,<br/>
      <strong>Fixonest</strong> Team
    </p>
    <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      This is an automated message, please do not reply to this email.
    </p>
  </div>
  `,
  };

  try {
    const info = await transporter.sendMail(verificationEmailOptions);
    // console.log(`Email sent: ${info.messageId}`);

    // Return if succesfully main is send
    return { status: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email:", error.message);
    return {
      status: false,
      message: error.message,
    };
  }
};

// Forgot password email verification
const forgotPasswordVerificationEmail = async (
  req,
  res,
  existingUser,
  transporter,
  generateTokenForForgotPassword
) => {
  // Verification email template
  const verificationEmailOptions = {
    from: `Fixonest <${process.env.SENDER_EMAIL}>`, // Professional format for sender
    to: existingUser.email,
    subject: "Action Required: Verify Your Account",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Hello ${existingUser.fullName},</h2>
          <p style="color: #555; font-size: 16px;">
            You have requested to reset your password. Please click the button below to set a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${req.get("origin")}/api/password-confirmation/${
      existingUser.email
    }/${generateTokenForForgotPassword.token}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
               Reset Password
            </a>
          </div>
          <p style="color: #555; font-size: 14px;">
  Or copy and paste this link into your browser:
</p>
<p style="word-wrap: break-word; color: #555;">
${req.get("origin")}/api/password-confirmation/${existingUser.email}/${
      generateTokenForForgotPassword.token
    }
</p>
          <p style="color: #555; font-size: 14px;">
            If you didn't request this, please ignore this email and your password will remain unchanged.
          </p>
          <p style="color: #555; font-size: 14px;">
            This password reset link is valid for 5 minutes.
          </p>
          <p style="color: #333; font-size: 16px;">
            Thank you,<br/>
            <strong>Fixonest</strong> Team
          </p>
        </div>
      `,
  };

  try {
    const info = await transporter.sendMail(verificationEmailOptions);
    // console.log(`Email sent: ${info.messageId}`);

    // Return if succesfully main is send
    return { status: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email:", error.message);
    return {
      status: false,
      message: error.message,
    };
  }
};

// // Send notification email
// const notificationEmail = async (req, res, transporter, mailOptions) => {
//   try {
//     const info = await transporter.sendMail(mailOptions);
//     // console.log(`Email sent: ${info.messageId}`);

//     // Return if succesfully main is send
//     return { status: true, messageId: info.messageId };
//   } catch (error) {
//     // console.error("Error sending email:", error.message);

//     return {
//       status: false,
//       message: error.message,
//     };
//   }
// };

module.exports = {
  transport,
  sendVerificationEmail,
  customerVerificationEmail,
  technicianVerificationEmail,
  forgotPasswordVerificationEmail,
  // notificationEmail,
};
