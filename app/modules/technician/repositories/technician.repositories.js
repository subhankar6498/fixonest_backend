// 3rd-party module
const mongoose = require("mongoose");

// import model
const UserModel = require("../../auth/model/user.model");
const serviceCategoryModel = require("../../service/model/category.model");
const technicinaAssignModel = require("../model/technicianAssignment.model");
const crypto = require("crypto");

// Define Technician repository object
const technicianRepository = {
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

  // Define create technician repo method
  createTechinicianRepo: async (userData) => {
    try {
      // 1. Create user into database for registration
      const userRecords = await UserModel.create(userData);

      // 2. Response send to the controller
      return userRecords;
    } catch (error) {
      return error;
    }
  },

  getTechnicianList: async () => {
    try {
      const technicianRecords = await UserModel.find({
        role: { $ne: "admin" },
      });
      return technicianRecords;
    } catch (error) {
      throw new Error("Failed to retrieve service category list");
    }
  },

  // Get the category name by id
  getCategoryNamebyId: async (specializationId) => {
    try {
      // Find the service category name by id
      const categoryRecords = await serviceCategoryModel.findById(
        specializationId
      );

      // return the recoreds
      return categoryRecords.categoryName;
    } catch (error) {
      return error;
    }
  },

  // Get technician by category
  categoryWiseTechnician: async (bookingDetails) => {
    try {
      // Get the subcategory from booking details
      const subCategory = bookingDetails.serviceCategory.name;

      // Find technicians matching the criteria
      const technicians = await UserModel.find({
        role: "technician",
        specialization: subCategory,
        isAvailable: true, // Only get available technicians
        status: "active", // Only get active technicians
        isVerified: true, // Only get verified technicians
      }).select({
        // firstName: 1,
        // lastName: 1,
        fullName: 1,
        // mobileNo: 1,
        // email: 1,
        specialization: 1,
        experience: 1,
        // expertise: 1,
        // profileImage: 1,
        // isAvailable: 1,
        // address: 1,
        _id: 1,
      });

      return technicians;
    } catch (error) {
      throw error;
    }
  },

  // Get Notes
  getNotes: async (id) => {
    try {
      // Find the order information
      const notes = await technicinaAssignModel.find({ booking: id }).select({
        _id: 1,
        technicianNotes: 1,
        adminNotes: 1,
        reasonForRejection: 1,
      });

      // Return the output
      return notes[0];
    } catch (error) {
      throw new Error("Failed to retrieve booking records");
    }
  },

  // Define getSingleTechnicianDetails repo method
  getSingleTechnicianDetails: async (technicinaId) => {
    try {
      // Fetch the single technician records
      const technicianRecords = await UserModel.findById(technicinaId, {
        __v: 0,
      });

      // return the response
      return technicianRecords;
    } catch (error) {
      return error;
    }
  },

  // Define update technicain repository method
  updateTechnicianDetails: async (technicinaId, userData) => {
    try {
      // Update the technician records in the database
      const technicainRecords = await UserModel.findByIdAndUpdate(
        technicinaId,
        userData,
        { new: true }
      );

      // Return the response
      return technicainRecords;
    } catch (error) {
      return error;
    }
  },

  // Delete technicina repo method
  deleteTechnician: async (technicianId) => {
    try {
      // 1. Fetch the technician details
      const technicinaRecords = await UserModel.findByIdAndDelete(technicianId);

      // Return the response
      return technicinaRecords;
    } catch (error) {
      return error;
    }
  },

  // Get total technician repo method
  GetTotalTechnicina: async () => {
    try {
      const technicianRecords = await UserModel.find({
        role: "technician",
      });

      return technicianRecords;
    } catch (error) {
      throw error;
    }
  },

  // Get total technician repo method
  GetTotalActiveTechnicina: async () => {
    try {
      const technicianRecords = await UserModel.find({
        role: "technician",
        status: "active",
      });

      return technicianRecords;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = technicianRepository;
