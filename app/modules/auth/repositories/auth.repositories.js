// import model
const UserModel = require("../model/user.model");
const TokenModelForEmail = require("../model/emailToken.model");
const crypto = require("crypto");

// Define user repository object
const authRepository = {
  // Define checkUserByEmail repo method
  checkUserByEmail: async (email) => {
    try {
      // 1. Grab the existing user by email
      const userRecords = await UserModel.findOne(email);

      // 2. Response send to the controller
      return userRecords;
    } catch (error) {
      return error;
    }
  },

  // Define registration repo method
  registration: async (userData) => {
    try {
      // 1. Create user into database for registration
      const userRecords = await UserModel.create(userData);

      // Return response to the client
      return userRecords;
    } catch (error) {
      return error;
    }
  },

  // Define create Token repo method for mail verification
  createToken: async (userId) => {
    try {
      // 1. Create a token for account verification
      const token = new TokenModelForEmail({
        _userId: userId,
        token: crypto.randomBytes(16).toString("hex"),
      });

      // 2. Save token into database after registration
      const createToken = await TokenModelForEmail.create(token);

      // 3. Response send to the controller
      return createToken;
    } catch (error) {
      throw new Error("Failed to generate new token");
    }
  },

  findToken: async (userId, token) => {
    try {
      // 1. Find the token in the database using the provided token from the URL
      const verifiedToken = await TokenModelForEmail.findOne(userId, token);

      // 2. Response send to the controller
      return verifiedToken;
    } catch (error) {
      return error;
    }
  },

  // Define checkUserById repo method
  checkUserById: async (userId) => {
    try {
      // 1. Grab the existing user by email
      const userRecords = await UserModel.findById(userId);

      // 2. Response send to the controller
      return userRecords;
    } catch (error) {
      return error;
    }
  },

  // Define Delete Token repo method
  deleteToken: async (id) => {
    try {
      // 1. Delete in the database using the provided token from the UR
      const deletedToken = await TokenModelForEmail.deleteOne(id);

      // 2. Response send to the controller
      return deletedToken;
    } catch (error) {
      return error;
    }
  },
};

module.exports = authRepository;
