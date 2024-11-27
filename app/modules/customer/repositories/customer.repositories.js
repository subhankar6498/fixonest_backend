const mongoose = require("mongoose");
// import model
const CustModel = require("../model/customer.model");
const CustTokenModelForEmail = require("../model/custEmailToken.model");
const crypto = require("crypto");

// Define user repository object
const customerRepository = {
  // Define checkUserByEmail repo method
  checkUserByEmail: async (email) => {
    try {
      // 1. Grab the existing user by email
      const userRecords = await CustModel.findOne(email);

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
      const userRecords = await CustModel.create(userData);

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
      const token = new CustTokenModelForEmail({
        _userId: userId,
        token: crypto.randomBytes(16).toString("hex"),
      });

      // 2. Save token into database after registration
      const createToken = await CustTokenModelForEmail.create(token);

      // 3. Response send to the controller
      return createToken;
    } catch (error) {
      throw new Error("Failed to generate new token");
    }
  },

  // Define checkUserById repo method
  checkUserById: async (userId) => {
    try {
      // 1. Grab the existing user by email
      const userRecords = await CustModel.findById(userId);

      // 2. Response send to the controller
      return userRecords;
    } catch (error) {
      return error;
    }
  },

  findToken: async (userId, token) => {
    try {
      // 1. Find the token in the database using the provided token from the URL
      const verifiedToken = await CustTokenModelForEmail.findOne(userId, token);

      // 2. Response send to the controller
      return verifiedToken;
    } catch (error) {
      return error;
    }
  },

  // Define Delete Token repo method
  deleteToken: async (id) => {
    try {
      // 1. Delete in the database using the provided token from the UR
      const deletedToken = await CustTokenModelForEmail.deleteOne(id);

      // 2. Response send to the controller
      return deletedToken;
    } catch (error) {
      return error;
    }
  },

  // Define forgot password cerification repo
  forgotPasswordEmailConfirmation: async (token) => {
    try {
      // 1. Find the token in the database using the provided token from the UR
      const verifiedToken = await CustTokenModelForEmail.findOne(token);

      // 2. Response send to the controller
      return verifiedToken;
    } catch (error) {
      return error;
    }
  },

  // Define findUserByidAndMail repo mehtod
  findUserByidAndMail: async (id, mail) => {
    try {
      // 1. Grab the existing user by email
      const userRecords = await CustModel.findOne(id, mail);

      // 2. Response send to the controller
      return userRecords;
    } catch (error) {
      return error;
    }
  },

  // Define forgotPasswordRepo mehtod
  forgotPasswordRepo: async (userId, newPassword) => {
    try {
      // 1. Update the new password in the database based on userId
      const resetPassword = await CustModel.findByIdAndUpdate(
        userId,
        newPassword
      );

      // 2. Response send to the controller method
      return resetPassword;
    } catch (error) {
      return error;
    }
  },

  // Define get user profile by id repo
  async getUserByIdRepo(userId) {
    try {
      // 1. Grab the existing user by userID
      const userRecords = await CustModel.findById(userId);

      // 2. Response send to the controller
      return userRecords;
    } catch (error) {
      return error;
    }
  },

  // Define get user profile by id repo
  async getUserDetailsById(userId) {
    try {
      // Convert to ObjectId only if userId is a valid string
      const objectId = mongoose.isValidObjectId(userId)
        ? new mongoose.Types.ObjectId(userId)
        : null;

      const userRecords = await CustModel.aggregate([
        { $match: { _id: objectId } },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            fullName: 1,
            email: 1,
            mobileNo: 1,
            address: {
              country: { $arrayElemAt: ["$address.country", 0] },
              state: 1,
              city: 1,
              street: 1,
              landmark: 1,
              pincode: 1,
            },
            profileImage: 1,
          },
        },
      ]);

      // Since aggregate returns an array, return the first element if it exists
      return userRecords.length > 0 ? userRecords[0] : null;
    } catch (error) {
      return error;
    }
  },
};

module.exports = customerRepository;
