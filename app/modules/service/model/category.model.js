const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    categoryName: {
      type: String,
    },
    categoryImage: {
      type: String,
      default: "categoryImage",
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

const CategoryModel = mongoose.model("service_category", CategorySchema);

module.exports = CategoryModel;
