const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const academicCalendarSchema = Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    eventType: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    startTime: String,
    endTime: String,
    academicYear: {
      type: String,
      required: true,
    },
    semester: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("AcademicCalendar", academicCalendarSchema);
