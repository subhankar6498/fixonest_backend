const mongoose = require("mongoose");
const { Schema } = mongoose;

const TestimonialSchema = new Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
    },
    talk: {
      type: String,
      required: [true, "Client talk is required"],
    },
    testimonialImage: {
      type: String,
      default: "testimonial_image",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: 0,
  }
);

const TestimonialModel = mongoose.model("testimonials", TestimonialSchema);

module.exports = TestimonialModel;
