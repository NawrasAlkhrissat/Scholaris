const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const remarksCollectionSchema = new Schema({
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
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      remark:{
        type: String,
        required: true,
      },
        date: {
            type: Date,
            default: Date.now,
        },
});

remarksCollectionSchema.index({ student: 1, subject: 1, teacher: 1 });
module.exports = mongoose.model("RemarksCollection", remarksCollectionSchema);
