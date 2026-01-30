const express = require("express");
const router = express.Router();

const School = require("../models/school");
const User = require("../models/user");
const Class = require("../models/class");
const Subject = require("../models/subject");
const Student = require("../models/student");
const AcademicCalendar = require("../models/academicCalendar");
const Messages = require("../models/messages");
const { isAdmin, isLoggedIn } = require("../middlewares");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const upload = require("../utils/upload");
const sendEmail = require("../utils/email");
const StudentAttendance = require("../models/studentAttendance");
const GradesCollection = require("../models/gradesCollection");
const RemarksCollection = require("../models/remarksCollection");
const student = require("../models/student");
const mongoose = require("mongoose");

/////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const school = await School.findOne();
    res.render("school", { school });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.post("/", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { name, location } = req.body;
    const school = await School.create({ name, location });
    res.status(201).json(school);
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get("/editSchool/:id", isLoggedIn, async (req, res) => {
  try {
    const school = await School.findOne();
    res.render("editSchool", { school });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.put(
  "/:id",
  isLoggedIn,
  isAdmin,
  upload.array("photos"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, address, remainingPhotos, email, phone, managerName } =
        req.body;

      const school = await School.findById(id);
      if (!school) {
        return res.render("error", { error: "School not found" });
      }
      const keptPhotos = remainingPhotos ? JSON.parse(remainingPhotos) : [];
      if (school.photos && school.photos.length > 0) {
        school.photos.forEach((photo) => {
          if (!keptPhotos.includes(photo)) {
            const filePath = path.join(__dirname, "..", "public", photo);
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
              } catch (err) {
                console.error(`Failed to delete ${filePath}:`, err);
              }
            }
          }
        });
      }
      const newPhotos =
        req.files && req.files.length > 0
          ? req.files.map((file) => `/images/${file.filename}`)
          : [];

      school.name = name;
      school.photos = [...keptPhotos, ...newPhotos];
      school.address = address;
      school.contacts.email = email;
      school.contacts.phone = phone;
      school.managerName = managerName;

      await school.save();
      req.flash("action", "updatedSchool");
      res.status(200).json({
        message: "School updated successfully",
        school,
      });
    } catch (err) {
      res.render("error", {
        error: "Error while updating school plaeas try again later",
      });
    }
  }
);
router.delete("/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const school = await School.findByIdAndDelete(id);
    res.status(200).json(school);
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/dashboard", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const school = await School.findOne();
    const classes = await Class.find();
    const subjects = await Subject.find();
    const students = await Student.find();
    const messages = await Messages.find({ isReplayed: false });
    const users = await User.find({ role: "teacher", isActive: true });
    res.render("dashboard", {
      school,
      classes,
      subjects,
      students,
      users,
      messages,
    });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/user", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "teacher", isActive: true });
    res.render("users", { users });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get("/user/add", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const classes = await Class.find();
    const subjects = await Subject.find().populate("class", "className");
    res.render("addUser", { classes, subjects });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get("/user/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && req.user.id !== id) {
      req.flash("action", "unauthorized");
      return res.redirect("/school/user/" + req.user.id);
    }
    const user = await User.findById(id)
      .populate("subjects")
      .populate("assingedClass");
    const schedule = await Class.aggregate([
      { $unwind: "$schedule" },
      { $unwind: "$schedule.periods" },
      {
        $match: {
          "schedule.periods.teacher": user._id,
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "schedule.periods.subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $lookup: {
          from: "users",
          localField: "schedule.periods.teacher",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: "$teacher" },
      {
        $project: {
          _id: 0,
          day: "$schedule.day",
          startTime: "$schedule.periods.startTime",
          endTime: "$schedule.periods.endTime",
          subjectName: "$subject.subjectName",
          teacherName: {
            $concat: ["$teacher.firstName", " ", "$teacher.lastName"],
          },
          class: "$className",
        },
      },
    ]);

    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };

    schedule.sort((a, b) => {
      if (dayOrder[a.day] !== dayOrder[b.day]) {
        return dayOrder[a.day] - dayOrder[b.day];
      }
      return a.startTime.localeCompare(b.startTime);
    });
    res.render("presonal", { user, schedule });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.post(
  "/user",
  isLoggedIn,
  isAdmin,
  upload.single("photo"),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        subjects,
        phone,
        assignedClasses,
        bio,
        role
      } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({
        firstName,
        lastName,
        email,
        phone,
        role,
        password: hashedPassword,
        profile: {
          photo: req.file ? "/images/" + req.file.filename : "",
          bio: bio,
        },
        subjects,
        assingedClass: assignedClasses,
      });
      req.flash("action", "added");
      res.redirect("/school/user");
    } catch (err) {
      res.render("error", {
        error: "Ops something went wrong please try again later",
      });
    }
  }
);

router.get("/edituser/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && req.user.id !== id) {
      req.flash("action", "unauthorized");
      return res.redirect("/school/user/" + req.user.id);
    }
    const user = await User.findById(id);
    res.render("editUser", { user });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.put(
  "/user/:id",
  isLoggedIn,
  upload.single("photo"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role !== "admin" && req.user.id !== id) {
        req.flash("action", "unauthorized");
        return res.redirect("/school/user/" + req.user.id);
      }
      const user = await User.findById(id);
      const { firstName, lastName, email, phone, bio, password } = req.body;
      if (!user) {
        return render("error", { error: "User not found" });
      }
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.phone = phone;

      if (!user.profile) {
        user.profile = {};
      }

      user.profile.bio = bio;
      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
      }

      if (req.file) {
        if (user.profile.photo) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            user.profile.photo
          );

          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        ``;
        user.profile.photo = "/images/" + req.file.filename;
      }

      await user.save();
      if (req.user.role === "admin") {
        req.flash("action", "updated");
        return res.redirect("/school/user");
      }
      req.flash("action", "updated");
      res.redirect(`/school/user/${id}`);
    } catch (err) {
      res.render("error", {
        error: "Ops something went wrong please try again later",
      });
    }
  }
);

router.delete("/user/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const classes = await Class.find({ responsibleTeacher: id });
    for (let cls of classes) {
      cls.responsibleTeacher = null;
      await cls.save();
    }
    user.isActive = false;
    await user.save();
    req.flash("action", "deleted");
    res.redirect("/school/user");
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong while deleting please try again later",
    });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/classStudents/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const students = await Student.find({ currentClass: id }).populate(
      "currentClass"
    );
    res.render("classStudents", { students, classId: id });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get("/student", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const students = await Student.find().populate("currentClass");
    res.render("students", { students });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get("/student/add", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const classes = await Class.find();
    res.render("addStudent", { classes });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/student/edit/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).populate("currentClass");
    const classes = await Class.find();
    res.render("editStudent", { student, classes });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/student/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).populate({
      path: "currentClass",
    });
    res.render("student", { student });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.post("/student", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const {
      name,
      nationalId,
      dateOfBirth,
      gender,
      currentClass,
      parentName,
      parentPhone,
      parentEmail,
      address,
    } = req.body;
    const newClass = await Class.findById(currentClass);
    if (newClass.students.length >= newClass.capacity)
      return res.render("error", {
        error: "Class is full and can't add more students",
      });
    const student = await Student.create({
      name,
      nationalId,
      dateOfBirth,
      gender,
      currentClass,
      parentContacts: {
        name: parentName,
        phone: parentPhone,
        email: parentEmail,
      },
      address,
    });
    newClass.students.push(student._id);
    await newClass.save();
    req.flash("action", "addedStudent");
    res.redirect("/school/dashboard");
  } catch (err) {
    res.send(err);
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.put("/student/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      nationalId,
      dateOfBirth,
      gender,
      currentClass,
      address,
      parentName,
      parentPhone,
      parentEmail,
    } = req.body;
    const student = await Student.findById(id);
    if (!student.currentClass.equals(currentClass)) {
      const newClass = await Class.findById(currentClass);
      newClass.students.push(student._id);
      await newClass.save();
      const previousClass = await Class.findById(student.currentClass);
      previousClass.students.pull(student._id);
      await previousClass.save();
      const grades = await GradesCollection.find({ student: student._id });
      for (let grade of grades) {
        grade.class = currentClass;
        await grade.save();
      }
    }
    student.name = name;
    student.nationalId = nationalId;
    student.dateOfBirth = dateOfBirth;
    student.gender = gender;
    student.currentClass = currentClass;
    student.parentContacts = {
      name: parentName,
      phone: parentPhone,
      email: parentEmail,
    };
    student.address = address;
    await student.save();
    req.flash("action", "updatedStudent");
    res.redirect("/school/student/" + id);
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.delete("/student/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    const currentClass = await Class.findById(student.currentClass);
    currentClass.students.pull(id);
    await currentClass.save();
    await studentAttendance.deleteMany({
      student: id,
    });
    await RemarksCollection.deleteMany({
      student: id,
    });
    await GradesCollection.deleteMany({
      student: id,
    });
    await Student.findByIdAndDelete(id);
    req.flash("action", "deletedStudent");
    res.redirect("/school/student");
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong while deleting please try again later",
    });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/class", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const classes = await Class.find().populate("responsibleTeacher");
    res.render("classes", { classes });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get("/class/add", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher", isActive: true });
    res.render("addclass", { teachers });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/class/edit/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const currentClass = await Class.findById(id)
      .populate({
        path: "subjects",
        populate: {
          path: "teacher",
          select: "firstName lastName _id",
        },
      })
      .populate("responsibleTeacher", "firstName lastName _id");
    const teachers = await User.find({
      role: "teacher",
      isActive: true,
    }).select("firstName lastName _id");
    res.render("editclass", { currentClass, teachers });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/class/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await Class.findById(id)
      .populate({
        path: "subjects",
        populate: {
          path: "teacher",
          select: "firstName lastName",
        },
      })
      .populate("responsibleTeacher")
      .populate({
        path: "schedule.periods.subject",
      })
      .populate({
        path: "schedule.periods.teacher",
      });
    res.render("class", { cls });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.post("/class", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { className, responsibleTeacher, capacity } = req.body;
    const classs = await Class.create({
      className,
      responsibleTeacher,
      capacity,
    });
    if (responsibleTeacher) {
      const teacher = await User.findById(responsibleTeacher);
      teacher.assingedClass.push(classs._id);
      await teacher.save();
    }
    req.flash("action", "addedClass");
    res.redirect("/school/class/" + classs._id);
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.put("/class/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { className, responsibleTeacher, capacity, schedule, subjects } =
      req.body;
    const cls = await Class.findById(id);
    if (!cls.responsibleTeacher && responsibleTeacher) {
      const teacher = await User.findById(responsibleTeacher);
      teacher.assingedClass.push(id);
      await teacher.save();
    }
    if (
      cls.responsibleTeacher &&
      !cls.responsibleTeacher.equals(responsibleTeacher)
    ) {
      const teacher = await User.findById(responsibleTeacher);
      teacher.assingedClass.push(id);
      await teacher.save();
      const previousTeacher = await User.findById(cls.responsibleTeacher);
      previousTeacher.assingedClass.pull(id);
      await previousTeacher.save();
    }
    const updatedClass = await Class.findByIdAndUpdate(id, {
      className,
      responsibleTeacher,
      capacity,
      schedule,
      subjects,
    });
    req.flash("action", "updatedClass");
    res.status(200).json(updatedClass);
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong while updating please try again later",
    });
  }
});

router.delete("/class/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await Class.findById(id);
    cls.students.forEach(async (student) => {
      await Student.findById(student);
      student.currentClass = null;
      await student.save();
    });
    await Subject.deleteMany({
      class: id,
    });
    const teacher = await User.findById(cls.responsibleTeacher);
    if (teacher) {
      teacher.assingedClass.pull(id);
      await teacher.save();
    }
    await Class.findByIdAndDelete(id);
    req.flash("action", "deletedClass");
    res.redirect("/school/user/" + req.user.id);
  } catch (err) {
    res.render("error", {
      error: err.message,
    });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/subject", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const subjects = await Subject.find()
        .populate("class")
        .populate("teacher");
      res.render("subjects", { subjects });
    } else {
      const subjects = await Subject.find({ teacher: req.user.id })
        .populate("class")
        .populate("teacher");
      res.render("subjects", { subjects });
    }
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/subject/add", isLoggedIn, async (req, res) => {
  try {
    const classes = await Class.find();
    const teachers = await User.find({ role: "teacher", isActive: true });
    res.render("addSubject", { classes, teachers });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/subject/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id)
      .populate("class")
      .populate("teacher", "firstName lastName _id");
    const classes = await Class.find({ _id: { $ne: subject.class._id } });
    const teachers = await User.find({
      role: "teacher",
      _id: { $ne: subject.teacher._id },
      isActive: true,
    });
    res.render("editSubject", { subject, classes, teachers });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/subject/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id)
      .populate("class", "className _id")
      .populate("teacher", "firstName lastName _id");
    if (
      req.user.role !== "admin" &&
      req.user.id !== subject.teacher._id.toString()
    ) {
      req.flash("action", "unauthorized");
      return res.redirect("/school/user/" + req.user.id);
    }
    const students = await Student.find({ currentClass: subject.class._id });
    res.render("subject", { subject, students });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.post("/subject", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { subjectName, classId, teacherId, gradeDistribution } = req.body;
    const subject = await Subject.create({
      subjectName,
      class: classId,
      teacher: teacherId,
      gradeDistribution,
    });
    const teacher = await User.findById(teacherId);
    teacher.subjects.push(subject._id);
    await teacher.save();
    const cls = await Class.findById(classId);
    cls.subjects.push(subject._id);
    await cls.save();
    req.flash("action", "addedSubject");
    res.status(200).json(subject);
  } catch (err) {
    res.send(err.message);
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.put("/subject/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSubject = req.body;
    if (
      req.user.role !== "admin" &&
      req.user.id !== updatedSubject.teacher.toString()
    ) {
      req.flash("action", "unauthorized");
      return res.redirect("/school/user/" + req.user.id);
    }
    await Subject.findByIdAndUpdate(id, updatedSubject, {
      new: true,
    });
    req.flash("action", "updatedSubject");
    res.status(200).redirect("/school/subject/" + id);
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.delete("/subject/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const subjectId = new mongoose.Types.ObjectId(id);
    const cls = await Class.findById(req.body.classId);
    const teacher = await User.findById(req.body.teacherId);
    await Class.updateOne(
       {},
  [
    {
      $set: {
        schedule: {
          $map: {
            input: "$schedule",
            as: "day",
            in: {
              $mergeObjects: [
                "$$day",
                {
                  periods: {
                    $filter: {
                      input: "$$day.periods",
                      as: "p",
                      cond: { $ne: ["$$p.subject", subjectId] },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  ]
    );
    cls.subjects.pull(id);
    teacher.subjects.pull(id);
    await teacher.save();
    await GradesCollection.deleteMany({ subject: id });
    await RemarksCollection.deleteMany({ subject: id });
    await StudentAttendance.deleteMany({ subject: id });
    await Subject.findByIdAndDelete(id);
    await cls.save();
    req.flash("action", "deletedSubject");
    res.redirect("/school/subject");
  } catch (err) {
    console.log(err);
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////
router.get("/academic-calendar", isLoggedIn, async (req, res) => {
  try {
    const academicCalendars = await AcademicCalendar.find({ isActive: true });
    res.render("academicCalendar", { academicCalendars });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get("/academic-calendar/add", isLoggedIn, isAdmin, async (req, res) => {
  try {
    res.render("addAcademicCalendar");
  } catch (error) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get(
  "/academic-calendar/edit/:id",
  isLoggedIn,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const event = await AcademicCalendar.findById(id);
      res.render("editAcademicCalendar", { event });
    } catch (err) {
      res.render("error", {
        error: "Ops something went wrong please try again later",
      });
    }
  }
);
router.get("/academic-calendar/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const academicCalendar = await AcademicCalendar.findById(id);
    res.status(200).json(academicCalendar);
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.post("/academic-calendar", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      academicYear,
      semester,
    } = req.body;
    await AcademicCalendar.create({
      title,
      description,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      academicYear,
      semester,
      createdBy: req.user.id,
    });
    console.log("Weeee")
    req.flash("action", "addedAcademicCalendar");
    res.redirect("/school/academic-calendar");
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.put("/academic-calendar/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      academicYear,
      semester,
    } = req.body;
    await AcademicCalendar.findByIdAndUpdate(
      id,
      {
        title,
        description,
        eventType,
        startDate,
        endDate,
        startTime,
        endTime,
        academicYear,
        semester,
      },
      { new: true }
    );
    req.flash("action", "updatedAcademicCalendar");
    res.redirect("/school/academic-calendar");
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.delete(
  "/academic-calendar/:id",
  isLoggedIn,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      await AcademicCalendar.findByIdAndDelete(id);
      req.flash("action", "deletedAcademicCalendar");
      res.redirect("/school/academic-calendar");
    } catch (err) {
      res.render("error", {
        error: "Ops something went wrong please try again later",
      });
    }
  }
);
//////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/contact", async (req, res) => {
  try {
    await Messages.create(req.body);
    req.flash("action", "success");
    res.redirect("/contact");
  } catch (error) {
    res.render("error", {
      error: error.message,
    });
  }
});

router.post("/email/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { recipientEmail, message } = req.body;
    await sendEmail(recipientEmail, "administration", message);
    req.flash("action", "emailSent");
    res.redirect("/school/user");
  } catch (error) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.post("/reply/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Messages.findById(id);
    const { recipientEmail, reply } = req.body;
    await sendEmail(recipientEmail, "reply", reply);
    message.isReplayed = true;
    message.reply = reply;
    await message.save();
    req.flash("action", "emailSent");
    res.redirect("/school/dashboard");
  } catch (error) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/messages", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const messages = await Messages.find({ isReplayed: true });
    res.render("prevMessages", { messages });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.delete("/messages/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Messages.findByIdAndDelete(id);
    req.flash("action", "deletedMessage");
    res.redirect("/school/messages");
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
module.exports = router;
