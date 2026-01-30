const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CollectionSchema = new Schema({
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
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  grades: [ {
          assesmintType: {
            type: String,
          },
        gradeValue: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
  ],
  teacher:{
    type: mongoose.Schema.Types.ObjectId || String,
    ref: "User",
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
CollectionSchema.index({ student: 1, subject: 1, class: 1, teacher: 1 });
module.exports = mongoose.model("GradesCollection", CollectionSchema);
