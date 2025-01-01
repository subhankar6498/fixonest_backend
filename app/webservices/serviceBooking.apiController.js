// 3rd-party module
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// import model
const ServiceBookingModel = require("../modules/service/model/serviceBooking.model");
const ServiceCategoryModel = require("../modules/service/model/category.model");
const ServiceModel = require("../modules/service/model/service.model");

// import repositories
const serviceBookingRepo = require("../modules/service/repositories/serviceBooking.repositories");

// import others
const { removeUploadedFile, getRelativePath } = require("../middleware/multer");

// Define Service Booking Controller
class ServiceBookingContoller {
  // Define Service Booking Controller method
  async bookService(req, res) {
    // 1. Check validation of register request
    const errors = validationResult(req);

    // 1b. Check if errors is not empty, then first unlink the uploaded image and return error
    if (!errors.isEmpty()) {
      // 1. If validation is failed, then no uploaded file (which is coming from incoming request body) added in the upload directory
      if (req.files) {
        await removeUploadedFile(req.files);
      }

      // 2. Return the Error
      return res.status(400).json({
        status: 400,
        message: "Validation Errors",
        errors: errors.array(),
      });
    }
    try {
      // 2. Extract data from request body
      const {
        serviceCategory,
        subCategory,
        description,
        preferredDate,
        preferredTimeSlot,
      } = req.body;

      // 3. Get customer ID from authenticated user
      const customerId = req.user.id; // Assuming authentication middleware sets req.user

      // 4. Find the service category documents to get their ObjectIds. no repo created
      const serviceCategoryDoc = await ServiceCategoryModel.findOne({
        categoryName: serviceCategory, // key should be match according to model
      });

      // 4a. If Service category is not found, then return the response
      if (!serviceCategoryDoc) {
        return res.status(404).json({
          status: 404,
          message: "Service category not found",
        });
      }

      // 5. Find the service sub-category documents to get their ObjectIds. no repo created
      const subCategoryDoc = await ServiceModel.findOne({
        title: subCategory, // key should be match according to model
        categoryId: serviceCategoryDoc._id, // key should be match according to model
      });

      // 5a. If Service subcategory is not found, then return the response
      if (!subCategoryDoc) {
        return res.status(404).json({
          status: 404,
          message: "Service subcategory not found",
        });
      }

      // 6. Create new service booking
      const newBooking = new ServiceBookingModel({
        customer: customerId,
        serviceCategory: serviceCategoryDoc._id,
        subCategory: subCategoryDoc._id,
        description,
        preferredDate: new Date(preferredDate),
        preferredTimeSlot,
      });

      // 7. Handle damage photos if provided
      if (req.files && req.files.length > 0) {
        const damagePhotos = req.files.map((file) =>
          getRelativePath(file.path)
        );
        newBooking.damagePhotos = damagePhotos;
      }

      // 8. Create the booking into database
      const savedBooking = await serviceBookingRepo.createBooking(newBooking);

      // 9. Use aggregation to get complete booking details
      const bookingDetails = await ServiceBookingModel.aggregate([
        // Match the created booking
        {
          $match: {
            _id: savedBooking._id,
          },
        },
        // Lookup customer details
        {
          $lookup: {
            from: "customers", // Replace with your actual customer collection name
            localField: "customer",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        // Lookup service category details
        {
          $lookup: {
            from: "service_categories", // Replace with your actual service category collection name
            localField: "serviceCategory",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        // Lookup service (sub-category) details
        {
          $lookup: {
            from: "services", // Replace with your actual service collection name
            localField: "subCategory",
            foreignField: "_id",
            as: "serviceDetails",
          },
        },
        // Unwind arrays created by lookups
        {
          $unwind: "$customerDetails",
        },
        {
          $unwind: "$categoryDetails",
        },
        {
          $unwind: "$serviceDetails",
        },
        // Project the final structure
        {
          $project: {
            bookingId: "$_id",
            status: 1,
            description: 1,
            preferredTimeSlot: 1,
            bookingDate: 1,
            damagePhotos: 1,
            // customer: {
            //   name: "$customerDetails.name",
            //   email: "$customerDetails.email",
            //   phone: "$customerDetails.phone",
            // },
            service: {
              category: {
                name: "$categoryDetails.categoryName",
              },
              subCategory: {
                title: "$serviceDetails.title",
                description: "$serviceDetails.description",
              },
            },
          },
        },
      ]);

      // 10. Send response
      if (bookingDetails && bookingDetails.length > 0) {
        return res.status(201).json({
          status: 201,
          message: "Your Service is booked Successfully",
          data: bookingDetails[0],
        });
      } else {
        throw new Error("Error retrieving booking details");
      }
    } catch (error) {
      console.error("Service Booking Error:", error);

      if (req.files) {
        const filesPath = req.files.map((file) => file);
        await removeUploadedFile(filesPath);
      }

      return res.status(500).json({
        status: 500,
        message: "An error occurred while processing your booking",
        error: error.message,
      });
    }
  }

  // Define get booking by customer
  async getBookingByCustomer(req, res) {
    try {
      // Grab the customer id from params
      const customerId = req.params.id;

      // Validate customerId
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid customer ID format",
        });
      }

      // Perform aggregation to get bookings with related data
      const bookings = await ServiceBookingModel.aggregate([
        // Match bookings for the specific customer
        {
          $match: {
            customer: new mongoose.Types.ObjectId(customerId),
          },
        },

        // Lookup customer details
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customerDetails",
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  mobileNo: 1,
                  address: 1,
                  profileImage: 1,
                },
              },
            ],
          },
        },

        // Lookup service category details
        {
          $lookup: {
            from: "service_categories",
            localField: "serviceCategory",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },

        // Lookup service (sub-category) details
        {
          $lookup: {
            from: "services",
            localField: "subCategory",
            foreignField: "_id",
            as: "serviceDetails",
          },
        },

        // Lookup technician assignment details if exists
        {
          $lookup: {
            from: "technician_assignments",
            localField: "currentAssignment",
            foreignField: "_id",
            as: "assignmentDetails",
          },
        },

        // Unwind the arrays created by lookups (convert arrays to objects)
        {
          $unwind: {
            path: "$customerDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$serviceDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$assignmentDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Project the final structure
        {
          $project: {
            _id: 1,
            bookingId: "$_id",
            // customer: "$customerDetails",
            serviceCategory: {
              _id: "$categoryDetails._id",
              name: "$categoryDetails.categoryName",
            },
            service: {
              _id: "$serviceDetails._id",
              name: "$serviceDetails.title",
              description: "$serviceDetails.description",
            },
            description: 1,
            damagePhotos: 1,
            status: 1,
            // assignment: "$assignmentDetails",
            preferredDate: 1,
            preferredTimeSlot: 1,
            bookingDate: 1,
            completionDate: 1,
            // totalAmount: 1,
            // paymentStatus: 1,
            hasReview: 1,
          },
        },

        // Sort by booking date descending (newest first)
        {
          $sort: {
            bookingDate: -1,
          },
        },
      ]);

      // Check if any bookings were found
      if (!bookings || bookings.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "No bookings found for this customer",
        });
      }

      // Return success response with bookings
      return res.status(200).json({
        status: 200,
        message: "Customer bookings retrieved successfully",
        data: {
          totalBookings: bookings.length,
          bookings: bookings,
        },
      });
    } catch (error) {
      console.error("Error in getBookingByCustomer:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

module.exports = new ServiceBookingContoller();
