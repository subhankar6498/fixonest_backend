const jwt = require("jsonwebtoken");

// Import admin repository
const authRepo = require("../modules/auth/repositories/auth.repositories");

// import others
const { generateAccessToken } = require("../helper/generateToken");

// Define verify token function
const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

// Define function for  authentication check
const adminAuthCheck = (
  roleType,
  accessTokenCookieName,
  secretKey,
  redirectPath
) => {
  return async (req, res, next) => {
    // Grab the access token and referesh token from the cookie
    const accessToken = req.cookies[accessTokenCookieName];

    // If access token and refresh token is not available in the cookie
    if (!accessToken) {
      console.log(`${roleType} cookie data not found`);
      req.flash("error", "You need to login first!");
      return res.redirect(redirectPath);
    }

    try {
      // First, try to verify the access token
      if (accessToken) {
        const admin = await verifyToken(accessToken, secretKey);

        // Add the access token decoded data to the imcoming request object in admin property
        req[roleType] = admin;
        return next();
      }
    } catch (error) {
      console.error("Auth error:", error);
      // Clear both tokens if they're invalid
      res.clearCookie(accessTokenCookieName);
      req.flash("error", "Session expired. Please login again.");
      return res.redirect(redirectPath);
    }
  };
};

// Define function for user authentication check other than admin
const authMiddleware = (roleType, cookieName, secretKey, redirectPath) => {
  return async (req, res, next) => {
    // Check for admin-view token first
    if (req.cookies && req.cookies.admin_view_token) {
      try {
        const adminViewData = await verifyToken(
          req.cookies.admin_view_token,
          process.env.JWT_SECRET_KEY_ADMIN_VIEW
        );

        if (adminViewData.role === roleType || "none") {
          req[roleType] = adminViewData;
          return next();
        }
      } catch (err) {
        // Admin-view auth failed, continue to regular auth
      }
    }

    // Regular authentication logic (unchanged)
    if (req.cookies && req.cookies[cookieName]) {
      try {
        const data = await verifyToken(req.cookies[cookieName], secretKey);
        req[roleType] = data;
        next();
      } catch (err) {
        req.flash("error", "You need to login first!");
        res.redirect(redirectPath);
      }
    } else {
      console.log(`${roleType} cookie data not found`);
      req.flash("error", "You need to login first!");
      res.redirect(redirectPath);
    }
  };
};

// Export the middleware functions
module.exports = {
  adminAuth: adminAuthCheck(
    "admin",
    "admin_token",
    process.env.JWT_SECRET_KEY_ADMIN,
    "/admin/login"
  ),

  technicianAuth: authMiddleware(
    "technician",
    "technician_token",
    process.env.JWT_SECRET_KEY_TECHNICIAN,
    "/technician/login"
  ),
};
