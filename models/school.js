const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SchoolSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  contacts: {
    phone : {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    }
  },
  managerName: {
    type: String,
    required: true,
  },
  photos: [String],
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  address: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SchoolSchema.index({ name: 1 });
SchoolSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("School", SchoolSchema);
