// Utility function to handle email verification during user registration
const handleRegistrationVerification = async (
  req,
  res,
  existingUser,
  savedToken
) => {
  // Check if the user has already verified their email
  if (existingUser.isVerified) {
    // If already verified, send a 400 Bad Request response with an appropriate message
    req.flash("error", "User already verified. You can login");
    return res.redirect("/admin/login");
  }

  // If not verified, update the user's status to verified
  existingUser.isVerified = true;

  // Save the updated user details to the database
  const verifiedUser = await existingUser.save();

  // Send a success response indicating the email has been verified
  if (verifiedUser) {
    return true;
  } else {
    return false;
  }
};

// Utility function to handle email verification during customer registration
const handleCustomerRegistrationVerification = async (existingUser) => {
  // Check if the user has already verified their email
  if (existingUser.isVerified) {
    return {
      success: false,
      status: 400,
      message: "This email is already verified",
    };
  }

  // If not verified, update the user's status to verified
  existingUser.isVerified = true;

  // Save the updated user details to the database
  const verifiedUser = await existingUser.save();

  // Return the result
  return {
    success: true,
    verifiedUser,
  };
};

module.exports = {
  handleRegistrationVerification,
  handleCustomerRegistrationVerification,
};
