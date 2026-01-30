const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const School = require("../models/school");
const User = require("../models/user");
const Class = require("../models/class");
const Subject = require("../models/subject");
const Student = require("../models/student");
const GradesCollection = require("../models/gradesCollection");
const RemarksCollection = require("../models/remarksCollection");
const StudentAttendance = require("../models/studentAttendance");
const AcademicCalendar = require("../models/academicCalendar");
const generateCertificate = require("../utils/Certificate");
const path = require("path");
const fs = require("fs");
const {
  checkAssingedClass,
  isLoggedIn,
  checkTeachersSubject,
  isItSubjectsClass,
} = require("../middlewares");
const sendEmail = require("../utils/email");

router.get("/studentGrades/:studentId", isLoggedIn, async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate(
      "currentClass",
      "className subjects responsibleTeacher"
    );
    const studentGrades = await GradesCollection.find({ student: studentId })
      .populate({
        path: "subject",
      })
      .populate({
        path: "teacher",
        select: "firstName lastNames",
      });
    let gradesSum = {};
    studentGrades.forEach((grade) => {
      let sum = 0;
      grade.grades.forEach((g) => {
        sum += g.gradeValue;
      });
      gradesSum = {
        ...gradesSum,
        [grade.subject.subjectName]: sum,
      };
    });
    res.render("studentGrades", { studentGrades, gradesSum, student });
  } catch (err) {
    res.render("error", { error: "Oops! Something went wrong" });
  }
});

router.get(
  "/grades/:subjectId/:classId",
  isLoggedIn,
  checkTeachersSubject,
  checkAssingedClass,
  isItSubjectsClass,
  async (req, res) => {
    try {
      const { subjectId, classId } = req.params;
      const studentsInClass = await Student.find({
        currentClass: classId,
      }).select("_id name");
      const studentIds = studentsInClass.map((s) => s._id);

      const gradesRecords = await GradesCollection.find({
        student: { $in: studentIds },
        subject: subjectId,
        class: classId,
      }).populate("student", "name");

      const result = studentsInClass.map((student) => {
        const gradeRecord = gradesRecords.find((g) =>
          g.student._id.equals(student._id)
        );
        return {
          studentId: student._id,
          studentName: student.name,
          currentGrades: gradeRecord ? gradeRecord.grades : [],
          recordId: gradeRecord ? gradeRecord._id : null,
        };
      });

      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching grades." });
    }
  }
);
router.put(
  "/grades/bulk-update/:subjectId/:classId",
  isLoggedIn,
  // checkTeachersSubject,
  // checkAssingedClass,
  // isItSubjectsClass,
  async (req, res) => {
    try {
      const { subjectId, classId } = req.params;
      const teacherId = req.user.id;
      const subject = await Subject.findById(subjectId).select("subjectName");
      const bulkGradesData = req.body;

      const updateOperations = bulkGradesData.map(async (data) => {
        if (!data.studentId || !data.grades || !Array.isArray(data.grades)) {
          return null;
        }
        let gradeDoc = await GradesCollection.findOne({
          student: data.studentId,
          subject: subjectId,
          class: classId,
        });

        if (!gradeDoc) {
          gradeDoc = new GradesCollection({
            student: data.studentId,
            subject: subjectId,
            class: classId,
            teacher: teacherId,
            grades: data.grades,
          });
        } else {
          data.grades.forEach((incomingGrade) => {
            const existingIndex = gradeDoc.grades.findIndex(
              (g) => g.assesmintType === incomingGrade.assesmintType
            );

            if (existingIndex > -1) {
              gradeDoc.grades[existingIndex].gradeValue =
                incomingGrade.gradeValue;
              gradeDoc.grades[existingIndex].date =
                incomingGrade.date || Date.now();
            } else {
              gradeDoc.grades.push(incomingGrade);
            }
          });
          gradeDoc.teacher = teacherId;
          gradeDoc.updatedAt = Date.now();
        }
        await gradeDoc.save();
        let student = await Student.findById(data.studentId);
        if (
          student &&
          student.parentContacts &&
          student["parentContacts"].email
        ) {
          sendEmail(
            student["parentContacts"].email,
            "gradeUploaded",
            `Your child ${student.name} has a grade update for subject ${
              subject.subjectName
            } <br>
                ${data.grades
                  .map(
                    (grade) =>
                      `<b>${grade.assesmintType}:</b> ${grade.gradeValue} <br>`
                  )
                  .join("")}
                `
          );
        }

        return gradeDoc;
      });

      const results = (await Promise.all(updateOperations)).filter(
        (res) => res !== null
      );

      res.status(200).json({
        status: "success",
        message: "Bulk grades processed successfully.",
        updatedRecords: results.length,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Error processing bulk grades." });
    }
  }
);

router.delete("/greades/:greadeId", isLoggedIn, async (req, res) => {
  try {
    const { greadeId } = req.params;
    const { assesmintType } = req.body;
    const greades = await GradesCollection.findById(greadeId);
    const index = greades.grades.findIndex(
      (g) => g.assesmintType === assesmintType
    );
    greades.grades.splice(index, 1);
    if (greades.grades.length === 0) {
      await greades.deleteOne();
    } else {
      await greades.save();
    }
    req.flash("action", "gradeDeleted");
    res.redirect("/teacher/studentGrades/" + greades.student);
  } catch (error) {
    res.render("error", { error: error.message });
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////
router.get("/studentAttendance/:studentId", isLoggedIn, async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    const studentAttendance = await StudentAttendance.find({
      student: studentId,
    })
      .populate("subject", "subjectName")
      .populate("recordedBy", "firstName lastName");
    res.render("studentAttendance", { studentAttendance, student });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get(
  "/attendance/:subjectId/:classId",
  isLoggedIn,
  checkTeachersSubject,
  checkAssingedClass,
  isItSubjectsClass,
  async (req, res) => {
    try {
      const { subjectId, classId } = req.params;
      const today = new Date();

      const studentsInClass = await Student.find({
        currentClass: classId,
      }).select("_id name");
      const studentIds = studentsInClass.map((s) => s._id);

      const recordedAttendance = await StudentAttendance.find({
        student: { $in: studentIds },
        subject: subjectId,
        date: {
          $gte: today,
          $lt: new Date(today).setDate(new Date(today).getDate() + 1),
        },
      }).populate("student", "name");

      const result = studentsInClass.map((student) => {
        const attendanceRecord = recordedAttendance.find((r) =>
          r.student._id.equals(student._id)
        );

        const status = attendanceRecord ? "Present" : "Absent";
        return {
          studentId: student._id,
          studentName: student.name,
          status: status,
          recordId: attendanceRecord ? attendanceRecord._id : null,
        };
      });

      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error fetching student attendance data." });
    }
  }
);

router.put("/attendance/status/:attendanceId", isLoggedIn, async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;
    const attendance = await StudentAttendance.findById(attendanceId);
    if (!attendance) {
      return res.render("error", { error: "Attendance not found" });
    }
    attendance.status = status;
    await attendance.save();
    req.flash("action", "attendanceSuccess");
    res.redirect("/teacher/studentAttendance/" + attendance.student);
  } catch (err) {
    res.render("error", {
      error:
        "Ops something went wrong while updating attendance please try again later",
    });
  }
});
router.put(
  "/attendance/bulk-update/:subjectId/:classId",
  isLoggedIn,
  // checkTeachersSubject,
  // checkAssingedClass,
  // isItSubjectsClass,
  async (req, res) => {
    try {
      const { subjectId, classId } = req.params;
      const teacherId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const bulkAttendanceData = req.body;

      const updateOperations = bulkAttendanceData
        .map(async (data) => {
          if (
            !data.studentId ||
            !data.status ||
            (data.status !== "present" &&
              data.status !== "absent" &&
              data.status !== "late" &&
              data.status !== "excused" &&
              data.status !== "not taken")
          ) {
            console.warn(
              `Skipping invalid attendance data for student: ${data.studentId}`
            );
            return null;
          }

          const existing = await StudentAttendance.findOne({
            student: data.studentId,
            subject: subjectId,
            date: today,
          });

          if (existing) {
            if (existing.status === data.status) {
              return existing;
            }

            existing.status = data.status;
            existing.updatedAt = Date.now();
            existing.recordedBy = teacherId;
            await existing.save();

            const student = await Student.findById(data.studentId);
            const subject = await Subject.findById(subjectId);
            sendEmail(
              student["parentContacts"].email,
              "attendanceUpdated",
              ` Your child ${student.name} has been marked as <b style="color:#0A66C2">${data.status} </b> for subject ${subject.subjectName} <br>`
            );
            return existing;
          }

          const student = await Student.findById(data.studentId);
          const subject = await Subject.findById(subjectId);
          sendEmail(
            student["parentContacts"].email,
            "attendanceUpdated",
            ` Your child ${student.name} has been marked as <b style="color:#0A66C2">${data.status} </b> for subject ${subject.subjectName} <br>`
          );
          return StudentAttendance.findOneAndUpdate(
            {
              student: data.studentId,
              subject: subjectId,
              recordedBy: teacherId,
              date: today,
            },
            {
              $set: {
                status: data.status,
                updatedAt: Date.now(),
                date: today,
              },
              $setOnInsert: {
                createdAt: Date.now(),
              },
            },
            {
              new: true,
              upsert: true,
            }
          );
        })
        .filter((op) => op !== null);

      const results = await Promise.all(updateOperations);

      res.status(200).json({
        status: "success",
        message: "Bulk attendance records processed successfully.",
        updatedRecords: results.length,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error processing bulk attendance update." });
    }
  }
);
router.delete("/attendance/:attendanceId", isLoggedIn, async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const attendance = await StudentAttendance.findByIdAndDelete(attendanceId);
    req.flash("action", "attendanceDeleted");
    res.redirect("/teacher/studentAttendance/" + attendance.student);
  } catch (error) {
    console.error(error);
    res.render("error", { error: error.message });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/studentRemarks/:studentId", isLoggedIn, async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    const studentRemarks = await RemarksCollection.find({
      student: studentId,
    })
      .populate("subject", "subjectName")
      .populate("teacher", "firstName lastName");
    res.render("studentRemarks", { studentRemarks, student });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.get(
  "/remarks/:subjectId/:classId",
  isLoggedIn,
  checkTeachersSubject,
  checkAssingedClass,
  isItSubjectsClass,
  async (req, res) => {
    try {
      const { subjectId, classId } = req.params;

      const studentsInClass = await Student.find({
        currentClass: classId,
      }).select("_id name email");
      const studentIds = studentsInClass.map((s) => s._id);

      const existingRemarks = await RemarksCollection.find({
        student: { $in: studentIds },
        subject: subjectId,
        teacher: req.user._id,
      }).populate("student", "name");

      const result = studentsInClass.map((student) => {
        const remarkRecord = existingRemarks.find((r) =>
          r.student._id.equals(student._id)
        );
        return {
          studentId: student._id,
          studentName: student.name,
          currentRemark: remarkRecord ? remarkRecord.remark : "",
          recordId: remarkRecord ? remarkRecord._id : null,
        };
      });

      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Error processing bulk remarks." });
    }
  }
);

router.put(
  "/remarks/bulk-update/:subjectId/:classId",
  isLoggedIn,
  // checkTeachersSubject,
  // checkAssingedClass,
  // isItSubjectsClass,
  async (req, res) => {
    try {
      const { subjectId, classId } = req.params;

      const teacherId = req.user.id;
      // expected format of (req.body):
      // [
      //   { studentId: '...', remark: '...' },
      //   { studentId: '...', remark: '...' },
      //   // and so on .....
      // ]
      const bulkRemarksData = req.body;

      const operations = bulkRemarksData
        .map(async (data) => {
          const remarkText = (data.remark || "").trim();
          const recordId = data.recordId;
          const student = await Student.findById(data.studentId);
          const subject = await Subject.findById(subjectId);

          if (remarkText === "" && recordId) {
            return RemarksCollection.deleteOne({
              _id: recordId,
              teacher: teacherId,
            });
          } else if (remarkText !== "") {
            sendEmail(
              student["parentContacts"].email,
              "remarkUploaded",
              `Your child ${student.name} has a new remark for subject ${
                subject.subjectName
              } <br> <br>
            ${`<b>Remark:</b> ${remarkText} <b  r>`}
            `
            );
            return RemarksCollection.findOneAndUpdate(
              {
                _id: recordId || new mongoose.Types.ObjectId(),
                student: data.studentId,
                subject: subjectId,
                teacher: teacherId,
              },
              {
                $set: {
                  remark: remarkText,
                  teacher: teacherId,
                  date: Date.now(),
                },
              },
              {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
              }
            );
          }
          return null;
        })
        .filter((op) => op !== null);

      const results = await Promise.all(operations);

      res.status(200).json({
        status: "success",
        message: "Bulk remarks processed successfully.",
        results: results,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Error processing bulk remarks." });
    }
  }
);

router.delete("/studentRemarks/:remarkId", isLoggedIn, async (req, res) => {
  try {
    const { remarkId } = req.params;
    if (!remarkId) {
      return res.render("error", { error: "Remark not found" });
    }
    const remark = await RemarksCollection.findById(remarkId);
    console.log(remark.teacher.toString() + " " + req.user.id);
    console.log(req.user.role);
    if (
      req.user.id !== remark.teacher.toString() &&
      req.user.role === "teacher"
    ) {
      return res.render("error", {
        error: "You are not authorized to delete this remark",
      });
    }
    await RemarksCollection.findByIdAndDelete(remarkId);
    req.flash("action", "remarkDeleted");
    res.redirect("/teacher/studentRemarks/" + remark.student);
  } catch (error) {
    console.error(error);
    res.render("error", { error: "Error processing bulk remarks." });
  }
});

router.get("/certificate/:studentId", isLoggedIn, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);
    const cls = await Class.findById(student.currentClass).populate(
      "responsibleTeacher",
      "firstName lastName"
    );
    const school = await School.findOne();
    let marks = [];
    let total = 0;
    const greades = await GradesCollection.find({
      student: studentId,
    }).populate("subject");
    greades.forEach((grade) => {
      let sum = 0;
      grade.grades.forEach((g) => {
        sum += g.gradeValue;
      });
      marks = [
        ...marks,
        {
          subjectName: grade.subject.subjectName,
          score: sum,
        },
      ];
      total += sum;
    });
    const finalResult = {
      average: total / greades.length,
      status: `${total / greades.length >= 50 ? "pass" : "fail"}`,
    };
    const logoPath = path.join(process.cwd(), "public/images/logo.jpg");
    const logoBase64 = fs.readFileSync(logoPath, "base64");
    res.render("certificateReview", {
      school,
      academicYear: "",
      semester: "",
      student,
      cls,
      marks,
      finalResult,
      logoBase64,
    });
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.post("/certificate/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { academicYear, semester } = req.body;
    const student = await Student.findById(studentId);
    const cls = await Class.findById(student.currentClass).populate(
      "responsibleTeacher",
      "firstName lastName"
    );
    const school = await School.findOne();
    let marks = [];
    let total = 0;
    const greades = await GradesCollection.find({
      student: studentId,
    }).populate("subject");
    greades.forEach((grade) => {
      let sum = 0;
      grade.grades.forEach((g) => {
        sum += g.gradeValue;
      });
      marks = [
        ...marks,
        {
          subjectName: grade.subject.subjectName,
          score: sum,
        },
      ];
      total += sum;
    });
    const finalResult = {
      average: total / greades.length,
      status: `${total / greades.length >= 50 ? "pass" : "failed"}`,
    };
    const logoPath = path.join(process.cwd(), "public/images/logo.jpg");
    const logoBase64 = fs.readFileSync(logoPath, "base64");
    await generateCertificate({
      school,
      academicYear,
      semester,
      student,
      cls,
      marks,
      finalResult,
      logoBase64,
    });
    const file = {
      filename: student.name + ".pdf",
      path: path.join(process.cwd(), "certificates", student.name + ".pdf"),
    }
    console.log(file);
    sendEmail(
      student["parentContacts"].email,
      "certificate",
      `Dear ${student.parentContacts.name}, <br>
        Your child ${student.name} has been issued a certificate for the academic year ${academicYear} and semester ${semester} <br>
        You can Find the certificate attached to this email.
      `,
      file
    );
    req.flash("action", "certificateGenerated");
    res.redirect("/teacher/studentGrades/" + studentId);
  } catch (err) {
    console.error(err);
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////
// router.get("/tattendance", isLoggedIn, isAdmin, async (req, res) => {
//   try {
//     const data = await TeacherAttendance.find()
//       .populate("teacherId", "name email")
//       .sort({ teacherId: 1, date: -1 });

//     res.status(200).json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get("/tattendance/:teacherId", isLoggedIn, async (req, res) => {
//   try {
//     const { teacherId } = req.params;
//     const data = await TeacherAttendance.find({ teacherId }).sort({ date: -1 });
//     const teacher = await User.findById(teacherId);
//     const school = await School.findOne();
//     if (!teacher) {
//       return res.status(404).json({ error: "Teacher not found" });
//     }

//     if (!data) {
//       return res.status(404).json({ error: "Attendance data not found" });
//     }
//     res.render("tattendance", { data, teacher , school});
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
//   const R = 6371e3;
//   const toRad = (value) => (value * Math.PI) / 180;

//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// router.post("/tattendance/:teacherId", isLoggedIn, async (req, res) => {
//   try {
//     if(!req.body.date || !req.body.location || !req.body.schoolId){
//       return res.status(400).json({ error: "Missing required fields ops" , success: false});
//     }
//     const { teacherId } = req.params;
//     if(teacherId !== req.user.id){
//       return res.status(401).json({ error: "Unauthorized" , success: false});
//     }
//     const {  date, location, schoolId } = req.body;
//     const teacher = await User.findById(teacherId);

//     /* data to be sent from the frontend
//     {
//   "date": "2025-11-16T07:30:00.000Z",
//   "location": {
//     "type": "Point",
//     "coordinates": [35.91423, 32.01567]
//    }
//    }
//     */
//     if (!teacher) {
//       return res.status(404).json({ error: "Teacher not found" , success: false});
//     }
//     const school = await School.findById(schoolId);
//     if (!school) {
//       return res.status(404).json({ error: "School not found", success: false });
//     }

//     const schoolLocation = school.location.coordinates;
//     const teacherLocation = location.coordinates;
//     const distanceMeters = calculateDistanceMeters(
//       schoolLocation[1],
//       schoolLocation[0],
//       teacherLocation[1],
//       teacherLocation[0]
//     );

//     if (distanceMeters > 25) {
//       return res.status(400).json({
//         success: false,
//         message: "Teacher is not within the allowed range (25m)",
//         distance: distanceMeters.toFixed(2),
//       });
//     }
//     const newAttendance = await TeacherAttendance.create({
//       teacherId,
//       date,
//       location,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Attendance registered successfully",
//       data: newAttendance,
//     });
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(400).json({
//         error: "Attendance already exists for this teacher on this date",
//       });
//     }

//     res.status(500).json({ error: err.message });
//   }
// });

//////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
