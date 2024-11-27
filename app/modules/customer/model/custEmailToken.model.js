// 3rd-party moduel
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define token Schema for Email verification
const tokenSchema = new Schema(
  {
    _userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "customer",
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: {
        expires: 300, // 300 seconds = 5 min
      },
    },
  },
  {
    versionKey: false,
  }
);

const CustTokenModel = new mongoose.model("custToken", tokenSchema);
module.exports = CustTokenModel;
