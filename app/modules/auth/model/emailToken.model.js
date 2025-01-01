// 3rd-party moduel
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define token Schema for Email verification
const tokenSchema = new Schema(
  {
    _userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: {
        expires: 120, // 120 seconds = 2min
      },
    },
  },
  {
    versionKey: false,
  }
);

const TokenModel = new mongoose.model("token", tokenSchema);
module.exports = TokenModel;
