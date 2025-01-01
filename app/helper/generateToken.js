const jwt = require("jsonwebtoken");

// Define function for generate access token for authentication
async function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
    process.env.JWT_SECRET_KEY_ADMIN,
    { expiresIn: "1h" } // Valid 1 hours
  );
}

// Define function for generate access token for for customer authentication
async function generateAccessTokenForCustomer(user) {
  return jwt.sign(
    {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage,
    },
    process.env.JWT_SECRET_KEY_CUSTOMER,
    { expiresIn: "1h" } // Valid 1 hours
  );
}

// Define function for generate access token for for technician authentication
async function generateAccessTokenForTechnicain(user) {
  return jwt.sign(
    {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email,
      profileImage: user.profileImage,
    },
    process.env.JWT_SECRET_KEY_TECHNICIAN,
    { expiresIn: "1h" } // Valid 1 hours
  );
}

module.exports = {
  generateAccessToken,
  generateAccessTokenForCustomer,
  generateAccessTokenForTechnicain,
};
