const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  nationalId: {
    type: Number,
    required: true,
    unique: true,
  },
  parentContacts:{
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
  address: {
    type: String,
    required: true,
  },
  currentClass: { type: mongoose.Schema.Types.ObjectId, ref: "Class" }
});

StudentSchema.index({ currentClass: 1, name: 1, nationalId: 1 });
module.exports = mongoose.model("Student", StudentSchema);
