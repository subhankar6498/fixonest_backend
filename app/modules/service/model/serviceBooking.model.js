const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceBookingSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "customer", // Required: Reference to Customer
      required: true,
    },
    serviceCategory: {
      type: Schema.Types.ObjectId,
      ref: "service_category", // Required: Reference to ServiceCategory
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "service", // Required: Reference to service
      required: true,
    },
    description: {
      type: String, // Required: Problem description
      required: true,
    },
    damagePhotos: {
      type: [String],
      default: ["uploads/serviceBookings/default_service_booking.png"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in-progress",
        "completed",
        "rejected", // for technician
        "cancelled", // for customer
      ],
      default: "pending",
    },
    currentAssignment: {
      type: Schema.Types.ObjectId,
      ref: "technician_assignment",
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTimeSlot: {
      type: String,
      default: "afternoon",
      enum: ["morning", "afternoon", "evening"],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date, // Default will be set 2 days after bookingDate using pre-save middleware
    },
    totalAmount: {
      type: Number,
      default: 0, // Default value set to 0
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    hasReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to set completionDate
serviceBookingSchema.pre("save", function (next) {
  if (!this.completionDate) {
    // Only set completionDate if not already set
    this.completionDate = new Date(
      this.bookingDate.getTime() + 2 * 24 * 60 * 60 * 1000
    ); // Add 2 days
  }
  next();
});

const ServiceBookingModel = mongoose.model(
  "service_booking",
  serviceBookingSchema
);

module.exports = ServiceBookingModel;
