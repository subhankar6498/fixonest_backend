// 3rd-party Model
const mongoose = require("mongoose");

// import model
const BookingModel = require("../../service/model/serviceBooking.model");

// Define Service Repository
class ServiceBookingRepositories {
  // Define Get all booking list repo method
  async getAllBookingList() {
    try {
      // Find the information
      const bookingRecords = await BookingModel.aggregate([
        {
          $lookup: {
            from: "customers", // Assuming your customer collection name
            localField: "customer",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: "$customerDetails",
        },
        {
          $lookup: {
            from: "service_categories", // Assuming your service category collection name
            localField: "serviceCategory",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },
        {
          $lookup: {
            from: "services", // Assuming your service subcategory collection name
            localField: "subCategory",
            foreignField: "_id",
            as: "subCategoryDetails",
          },
        },
        {
          $unwind: "$subCategoryDetails",
        },
        {
          $project: {
            _id: 1,
            description: 1,
            damagePhotos: 1,
            status: 1,
            preferredDate: 1,
            preferredTimeSlot: 1,
            totalAmount: 1,
            paymentStatus: 1,
            hasReview: 1,
            bookingDate: 1,
            completionDate: 1,
            createdAt: 1,
            updatedAt: 1,
            "customer._id": "$customerDetails._id",
            "customer.name": "$customerDetails.fullName",
            "serviceCategory._id": "$categoryDetails._id",
            "serviceCategory.name": "$categoryDetails.categoryName",
            "subCategory._id": "$subCategoryDetails._id",
            "subCategory.name": "$subCategoryDetails.title",
          },
        },
        {
          $sort: { bookingDate: -1 }, // Sort by booking date in descending order
        },
      ]);
      //   // Debug the aggregation
      //   console.log(JSON.stringify(bookingRecords, null, 2));

      // Return the output
      return bookingRecords;
    } catch (error) {
      throw new Error("Failed to retrieve Booking Order list");
    }
  }

  // Define Get single booking repo method
  async getSingleBookingDetails(orderID) {
    try {
      // Find the order information
      const bookingRecords = await BookingModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(orderID),
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: "$customerDetails",
        },
        {
          $lookup: {
            from: "service_categories",
            localField: "serviceCategory",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },
        {
          $lookup: {
            from: "services",
            localField: "subCategory",
            foreignField: "_id",
            as: "subCategoryDetails",
          },
        },
        {
          $unwind: "$subCategoryDetails",
        },

        {
          $project: {
            _id: 1,
            description: 1,
            damagePhotos: 1,
            status: 1,
            preferredDate: 1,
            preferredTimeSlot: 1,
            totalAmount: 1,
            paymentStatus: 1,
            hasReview: 1,
            bookingDate: 1,
            completionDate: 1,
            createdAt: 1,
            updatedAt: 1,
            "customer._id": "$customerDetails._id",
            "customer.name": "$customerDetails.fullName",
            "customer.email": "$customerDetails.email",
            "customer.phone": "$customerDetails.mobileNo",
            "customer.address": "$customerDetails.address",
            "serviceCategory._id": "$categoryDetails._id",
            "serviceCategory.name": "$categoryDetails.categoryName",
            "subCategory._id": "$subCategoryDetails._id",
            "subCategory.name": "$subCategoryDetails.title",
          },
        },
      ]);

      // Return the output
      return bookingRecords[0]; // Since we're querying by ID, we'll get at most one record
    } catch (error) {
      throw new Error("Failed to retrieve booking records");
    }
  }

  // Define get all pending booking repo mehtod
  async getAllPendingBookings() {
    try {
      const bookingRecords = await BookingModel.find({
        status: "pending",
      });

      return bookingRecords;
    } catch (error) {
      throw error;
    }
  }

  // Define get all the completed booking repo mehtod
  async getAllCompletedBookings() {
    try {
      const bookingRecords = await BookingModel.find({
        status: "completed",
      });
      return bookingRecords;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ServiceBookingRepositories();
