const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  role: { type: String, enum: ["admin", "teacher"], default: "teacher",required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, index: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  profile: {
    photo: {
      type: String,
    },
    bio: String,
  },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  assingedClass: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});
UserSchema.index({ schoolId: 1, role: 1 });

module.exports = mongoose.model("User", UserSchema);
