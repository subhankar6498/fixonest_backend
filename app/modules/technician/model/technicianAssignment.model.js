const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TechnicianAssignmentSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "service_booking", // Required: Reference to ServiceBooking
      required: true,
    },
    technician: {
      type: Schema.Types.ObjectId,
      ref: "user", // Required: Reference to User (technician)
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "user", // Required: Reference to User (admin)
      required: true,
    },
    assignmentDate: {
      type: Date,
      default: Date.now,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "completed", "rejected"],
      default: "accepted",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    estimatedDuration: {
      type: Number,
      min: 0,
      default: 2, // Default duration of 2 hours
    },
    technicianNotes: {
      type: String,
      trim: true,
      default: "none",
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "none",
    },
    reasonForRejection: {
      type: String,
      trim: true,
      default: "none",
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
    versionKey: false,
  }
);

const TechnicianAssignmentModel = mongoose.model(
  "technician_assignment",
  TechnicianAssignmentSchema
);

module.exports = TechnicianAssignmentModel;
