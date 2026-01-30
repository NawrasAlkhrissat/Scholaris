const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
subjectName:{
    type: String,
    required: true,
},
class:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
},
teacher:{   
    type : mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
},
gradeDistribution:[{
    assesmintType:{
        type: String,
    },
    weight:{
        type: Number,
    },
}],
createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Subject", SubjectSchema);
