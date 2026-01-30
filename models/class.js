const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  className: {
    type: String,
    required: true,
  },
  responsibleTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  schedule: [
    {
      day: {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        required: true,
      },
      periods: [
        {
          periodNumber: { type: Number, required: true },
          subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
          },
          teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
        },
      ],
    },
  ],
  capacity: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Class", ClassSchema);
