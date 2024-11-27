const jwt = require("jsonwebtoken");

const authenticateApi = async (req, res, next) => {
  // 1. Extract the Token from the incoming Request
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  // 2. Check if the Token is Present or not in incoming request. If the token not present, do the following
  if (!token) {
    return res.status(403).json({
      status: 403,
      message: "A token is required for authentication",
    });
  }

  // 3. If the token present in incoming requrest, Verify the Token
  try {
    // 1. Verify the token and attach the verify user to the request object
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY_CUSTOMER);
    req.user = verifyToken; // Update the user property in the incoming request

    // 2. Control passes to the next middleware or route handler
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: 401, message: "Invalid Token Access" });
  }
};

module.exports = authenticateApi;
