const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentAttendanceSchema = new Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  status: {
  type: String,
  enum: ["present", "absent", "late", "excused", "not taken"],
  required: true,
},
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
studentAttendanceSchema.index({ student: 1, subject: 1, recordedBy: 1 });
module.exports= mongoose.model("StudentAttendance",studentAttendanceSchema);
