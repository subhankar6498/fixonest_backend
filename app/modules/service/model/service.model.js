
const mongoose = require("mongoose");
let mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const { Schema } = mongoose;

const ServiceSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "service_category",
    },
    serviceImage: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ServiceSchema.plugin(mongooseAggregatePaginate);

const ServiceModel = mongoose.model("service", ServiceSchema);

module.exports = ServiceModel;
