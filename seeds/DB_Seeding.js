require("dotenv").config();
const mongoose = require('mongoose');

// Import all models
const School = require('../models/school');
// const User = require('./models/User');
// const Class = require('./models/Class');
// const Subject = require('./models/Subject');
// const Student = require('./models/Student');
// const GradesCollection = require('./models/GradesCollection');
// const RemarksCollection = require('./models/RemarksCollection');
// const StudentAttendance = require('./models/StudentAttendance');
// const TeacherAttendance = require('./models/TeacherAttendance');
// const AcademicCalendar = require('./models/AcademicCalendar');


async function seedDatabase() {
  try {
    // Connect to MongoDB
    const connectDB = async () => {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
      } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
      }
    };
    connectDB()

    // // ✅ CRITICAL: Drop all indexes first to avoid parallel array index error
    // try {
    //   await Class.collection.dropIndexes();
    //   console.log('✓ Dropped Class indexes');
    // } catch (err) {
    //   console.log('No indexes to drop for Class');
    // }

    // try {
    //   await User.collection.dropIndexes();
    //   console.log('✓ Dropped User indexes');
    // } catch (err) {
    //   console.log('No indexes to drop for User');
    // }

    // try {
    //   await StudentAttendance.collection.dropIndexes();
    //   console.log('✓ Dropped StudentAttendance indexes');
    // } catch (err) {
    //   console.log('No indexes to drop for StudentAttendance');
    // }

    // try {
    //   await TeacherAttendance.collection.dropIndexes();
    //   console.log('✓ Dropped TeacherAttendance indexes');
    // } catch (err) {
    //   console.log('No indexes to drop for TeacherAttendance');
    // }

    // Clear existing data
    await School.deleteMany({});
    // await User.deleteMany({});
    // await Class.deleteMany({});
    // await Subject.deleteMany({});
    // await Student.deleteMany({});
    // await GradesCollection.deleteMany({});
    // await RemarksCollection.deleteMany({});
    // await StudentAttendance.deleteMany({});
    // await TeacherAttendance.deleteMany({});
    // await AcademicCalendar.deleteMany({});
    // console.log('✓ Cleared existing data');

    // 1. Create School
    const school = await School.create({
      name: 'Bright Future International School',
      location: {
        type: 'Point',
        coordinates: [35.9239, 31.9454] 
      },
      managerName: 'Nawras Alkhrissat',
      contacts: {
        phone: '+962788697696',
        email: 'nawrasalkhrissat@gmail.edu'
      }
    });
    console.log('✓ School created');

    // 2. Create Admin User
    // const admin = await User.create({
    //   role: 'admin',
    //   firstName: 'Sarah',
    //   lastName: 'Anderson',
    //   email: 'admin@brightfuture.edu',
    //   password: '$2b$10$XYZ123', // In production, use proper hashing
    //   phone: '+962791234567',
    //   profile: {
    //     bio: 'School Administrator with 15 years of experience in educational management'
    //   }
    // });
    // console.log('✓ Admin user created');

    // // 3. Create Teachers
    // const teachers = await User.insertMany([
    //   {
    //     role: 'teacher',
    //     firstName: 'John',
    //     lastName: 'Smith',
    //     email: 'john.smith@brightfuture.edu',
    //     password: '$2b$10$ABC123',
    //     phone: '+962791234568',
    //     profile: {
    //       bio: 'Mathematics teacher with passion for problem-solving'
    //     }
    //   },
    //   {
    //     role: 'teacher',
    //     firstName: 'Emily',
    //     lastName: 'Johnson',
    //     email: 'emily.johnson@brightfuture.edu',
    //     password: '$2b$10$DEF456',
    //     phone: '+962791234569',
    //     profile: {
    //       bio: 'English Literature specialist with creative teaching methods'
    //     }
    //   },
    //   {
    //     role: 'teacher',
    //     firstName: 'Michael',
    //     lastName: 'Brown',
    //     email: 'michael.brown@brightfuture.edu',
    //     password: '$2b$10$GHI789',
    //     phone: '+962791234570',
    //     profile: {
    //       bio: 'Science enthusiast making learning fun through experiments'
    //     }
    //   },
    //   {
    //     role: 'teacher',
    //     firstName: 'Lisa',
    //     lastName: 'Davis',
    //     email: 'lisa.davis@brightfuture.edu',
    //     password: '$2b$10$JKL012',
    //     phone: '+962791234571',
    //     profile: {
    //       bio: 'History teacher bringing the past to life'
    //     }
    //   }
    // ]);
    // console.log('✓ Teachers created');

    // // 4. Create Classes
    // const classes = await Class.insertMany([
    //   {
    //     className: 'Grade 10-A',
    //     responsibleTeacher: teachers[0]._id,
    //     students: [],
    //     subjects: [],
    //     capacity: 30,
    //     schedule: [
    //       {
    //         day: 'Monday',
    //         periods: []
    //       },
    //       {
    //         day: 'Tuesday',
    //         periods: []
    //       },
    //       {
    //         day: 'Wednesday',
    //         periods: []
    //       }
    //     ]
    //   },
    //   {
    //     className: 'Grade 10-B',
    //     responsibleTeacher: teachers[1]._id,
    //     students: [],
    //     subjects: [],
    //     capacity: 30,
    //     schedule: [
    //       {
    //         day: 'Monday',
    //         periods: []
    //       },
    //       {
    //         day: 'Tuesday',
    //         periods: []
    //       }
    //     ]
    //   },
    //   {
    //     className: 'Grade 9-A',
    //     responsibleTeacher: teachers[2]._id,
    //     students: [],
    //     subjects: [],
    //     capacity: 28,
    //     schedule: []
    //   }
    // ]);
    // console.log('✓ Classes created');

    // // 5. Create Subjects
    // const subjects = await Subject.insertMany([
    //   {
    //     subjectName: 'Mathematics',
    //     class: classes[0]._id,
    //     teacher: teachers[0]._id,
    //     gradeDistribution: [
    //       { assesmintType: 'Homework', weight: 10 },
    //       { assesmintType: 'Quizzes', weight: 20 },
    //       { assesmintType: 'Midterm Exam', weight: 30 },
    //       { assesmintType: 'Final Exam', weight: 40 }
    //     ]
    //   },
    //   {
    //     subjectName: 'English Literature',
    //     class: classes[0]._id,
    //     teacher: teachers[1]._id,
    //     gradeDistribution: [
    //       { assesmintType: 'Essays', weight: 25 },
    //       { assesmintType: 'Participation', weight: 15 },
    //       { assesmintType: 'Midterm Exam', weight: 30 },
    //       { assesmintType: 'Final Exam', weight: 30 }
    //     ]
    //   },
    //   {
    //     subjectName: 'Physics',
    //     class: classes[0]._id,
    //     teacher: teachers[2]._id,
    //     gradeDistribution: [
    //       { assesmintType: 'Lab Work', weight: 20 },
    //       { assesmintType: 'Quizzes', weight: 15 },
    //       { assesmintType: 'Midterm Exam', weight: 30 },
    //       { assesmintType: 'Final Exam', weight: 35 }
    //     ]
    //   },
    //   {
    //     subjectName: 'World History',
    //     class: classes[0]._id,
    //     teacher: teachers[3]._id,
    //     gradeDistribution: [
    //       { assesmintType: 'Projects', weight: 25 },
    //       { assesmintType: 'Quizzes', weight: 15 },
    //       { assesmintType: 'Midterm Exam', weight: 30 },
    //       { assesmintType: 'Final Exam', weight: 30 }
    //     ]
    //   },
    //   {
    //     subjectName: 'Mathematics',
    //     class: classes[1]._id,
    //     teacher: teachers[0]._id,
    //     gradeDistribution: [
    //       { assesmintType: 'Homework', weight: 10 },
    //       { assesmintType: 'Quizzes', weight: 20 },
    //       { assesmintType: 'Midterm Exam', weight: 30 },
    //       { assesmintType: 'Final Exam', weight: 40 }
    //     ]
    //   },
    //   {
    //     subjectName: 'English Literature',
    //     class: classes[2]._id,
    //     teacher: teachers[1]._id,
    //     gradeDistribution: [
    //       { assesmintType: 'Essays', weight: 25 },
    //       { assesmintType: 'Midterm Exam', weight: 35 },
    //       { assesmintType: 'Final Exam', weight: 40 }
    //     ]
    //   }
    // ]);
    // console.log('✓ Subjects created');

    // // 6. Create Students
    // const students = await Student.insertMany([
    //   {
    //     name: 'Ahmed Hassan',
    //     dateOfBirth: new Date('2008-03-15'),
    //     gender: 'male',
    //     nationalId: 'JO20080315001',
    //     parentContacts: [
    //       {
    //         name: 'Hassan Ali',
    //         phone: '+962791111111',
    //         email: 'hassan.ali@email.com'
    //       }
    //     ],
    //     address: '123 King Abdullah Street, Amman',
    //     enrolledSubjects: [subjects[0]._id, subjects[1]._id, subjects[2]._id, subjects[3]._id],
    //     Absences: 2,
    //     currentClass: classes[0]._id,
    //     currentGPA: 3.8
    //   },
    //   {
    //     name: 'Layla Mohammed',
    //     dateOfBirth: new Date('2008-07-22'),
    //     gender: 'female',
    //     nationalId: 'JO20080722002',
    //     parentContacts: [
    //       {
    //         name: 'Mohammed Ibrahim',
    //         phone: '+962792222222',
    //         email: 'mohammed.ibrahim@email.com'
    //       }
    //     ],
    //     address: '456 Queen Rania Avenue, Amman',
    //     enrolledSubjects: [subjects[0]._id, subjects[1]._id, subjects[2]._id, subjects[3]._id],
    //     Absences: 0,
    //     currentClass: classes[0]._id,
    //     currentGPA: 3.9
    //   },
    //   {
    //     name: 'Omar Khalil',
    //     dateOfBirth: new Date('2008-11-10'),
    //     gender: 'male',
    //     nationalId: 'JO20081110003',
    //     parentContacts: [
    //       {
    //         name: 'Khalil Ahmed',
    //         phone: '+962793333333',
    //         email: 'khalil.ahmed@email.com'
    //       }
    //     ],
    //     address: '789 Rainbow Street, Amman',
    //     enrolledSubjects: [subjects[0]._id, subjects[1]._id, subjects[2]._id, subjects[3]._id],
    //     Absences: 1,
    //     currentClass: classes[0]._id,
    //     currentGPA: 3.6
    //   },
    //   {
    //     name: 'Fatima Youssef',
    //     dateOfBirth: new Date('2008-05-18'),
    //     gender: 'female',
    //     nationalId: 'JO20080518004',
    //     parentContacts: [
    //       {
    //         name: 'Youssef Mahmoud',
    //         phone: '+962794444444',
    //         email: 'youssef.mahmoud@email.com'
    //       }
    //     ],
    //     address: '321 Paris Square, Amman',
    //     enrolledSubjects: [subjects[4]._id, subjects[1]._id],
    //     Absences: 3,
    //     currentClass: classes[1]._id,
    //     currentGPA: 3.5
    //   },
    //   {
    //     name: 'Zaid Tariq',
    //     dateOfBirth: new Date('2009-01-25'),
    //     gender: 'male',
    //     nationalId: 'JO20090125005',
    //     parentContacts: [
    //       {
    //         name: 'Tariq Abdullah',
    //         phone: '+962795555555',
    //         email: 'tariq.abdullah@email.com'
    //       }
    //     ],
    //     address: '654 Gardens Street, Amman',
    //     enrolledSubjects: [subjects[5]._id],
    //     Absences: 1,
    //     currentClass: classes[2]._id,
    //     currentGPA: 3.7
    //   }
    // ]);
    // console.log('✓ Students created');

    // // Update Classes with students and subjects
    // await Class.findByIdAndUpdate(classes[0]._id, {
    //   students: [students[0]._id, students[1]._id, students[2]._id],
    //   subjects: [subjects[0]._id, subjects[1]._id, subjects[2]._id, subjects[3]._id],
    //   schedule: [
    //     {
    //       day: 'Monday',
    //       periods: [
    //         {
    //           periodNumber: 1,
    //           subject: subjects[0]._id,
    //           teacher: teachers[0]._id,
    //           startTime: '08:00',
    //           endTime: '08:45'
    //         },
    //         {
    //           periodNumber: 2,
    //           subject: subjects[1]._id,
    //           teacher: teachers[1]._id,
    //           startTime: '09:00',
    //           endTime: '09:45'
    //         }
    //       ]
    //     },
    //     {
    //       day: 'Tuesday',
    //       periods: [
    //         {
    //           periodNumber: 1,
    //           subject: subjects[2]._id,
    //           teacher: teachers[2]._id,
    //           startTime: '08:00',
    //           endTime: '08:45'
    //         },
    //         {
    //           periodNumber: 2,
    //           subject: subjects[3]._id,
    //           teacher: teachers[3]._id,
    //           startTime: '09:00',
    //           endTime: '09:45'
    //         }
    //       ]
    //     }
    //   ]
    // });

    // await Class.findByIdAndUpdate(classes[1]._id, {
    //   students: [students[3]._id],
    //   subjects: [subjects[4]._id]
    // });

    // await Class.findByIdAndUpdate(classes[2]._id, {
    //   students: [students[4]._id],
    //   subjects: [subjects[5]._id]
    // });
    // console.log('✓ Classes updated with students and subjects');

    // // Update Users with subjects and assigned classes
    // await User.findByIdAndUpdate(teachers[0]._id, {
    //   subjects: [subjects[0]._id, subjects[4]._id],
    //   assingedClass: [classes[0]._id, classes[1]._id]
    // });

    // await User.findByIdAndUpdate(teachers[1]._id, {
    //   subjects: [subjects[1]._id, subjects[5]._id],
    //   assingedClass: [classes[0]._id, classes[2]._id]
    // });

    // await User.findByIdAndUpdate(teachers[2]._id, {
    //   subjects: [subjects[2]._id],
    //   assingedClass: [classes[0]._id]
    // });

    // await User.findByIdAndUpdate(teachers[3]._id, {
    //   subjects: [subjects[3]._id],
    //   assingedClass: [classes[0]._id]
    // });
    // console.log('✓ Teachers updated with subjects and classes');

    // // 7. Create Grades Collection
    // const grades = await GradesCollection.insertMany([
    //   {
    //     student: students[0]._id,
    //     subject: subjects[0]._id,
    //     class: classes[0]._id,
    //     teacher: teachers[0]._id,
    //     grades: [
    //       {
    //         gradeDistribution: [
    //           { assesmintType: 'Homework', weight: 10 }
    //         ],
    //         gradeValue: 95,
    //         date: new Date('2024-09-15')
    //       },
    //       {
    //         gradeDistribution: [
    //           { assesmintType: 'Quizzes', weight: 20 }
    //         ],
    //         gradeValue: 88,
    //         date: new Date('2024-10-01')
    //       },
    //       {
    //         gradeDistribution: [
    //           { assesmintType: 'Midterm Exam', weight: 30 }
    //         ],
    //         gradeValue: 92,
    //         date: new Date('2024-10-20')
    //       }
    //     ]
    //   },
    //   {
    //     student: students[0]._id,
    //     subject: subjects[1]._id,
    //     class: classes[0]._id,
    //     teacher: teachers[1]._id,
    //     grades: [
    //       {
    //         gradeDistribution: [
    //           { assesmintType: 'Essays', weight: 25 }
    //         ],
    //         gradeValue: 90,
    //         date: new Date('2024-09-20')
    //       }
    //     ]
    //   },
    //   {
    //     student: students[1]._id,
    //     subject: subjects[0]._id,
    //     class: classes[0]._id,
    //     teacher: teachers[0]._id,
    //     grades: [
    //       {
    //         gradeDistribution: [
    //           { assesmintType: 'Homework', weight: 10 }
    //         ],
    //         gradeValue: 98,
    //         date: new Date('2024-09-15')
    //       },
    //       {
    //         gradeDistribution: [
    //           { assesmintType: 'Midterm Exam', weight: 30 }
    //         ],
    //         gradeValue: 95,
    //         date: new Date('2024-10-20')
    //       }
    //     ]
    //   },
    //   {
    //     student: students[2]._id,
    //     subject: subjects[2]._id,
    //     class: classes[0]._id,
    //     teacher: teachers[2]._id,
    //     grades: [
    //       {
    //         gradeDistribution: [
    //           { assesmintType: 'Lab Work', weight: 20 }
    //         ],
    //         gradeValue: 85,
    //         date: new Date('2024-09-25')
    //       }
    //     ]
    //   }
    // ]);
    // console.log('✓ Grades created');

    // // 8. Create Remarks Collection
    // const remarks = await RemarksCollection.insertMany([
    //   {
    //     student: students[0]._id,
    //     subject: subjects[0]._id,
    //     teacher: teachers[0]._id,
    //     remark: 'Excellent problem-solving skills. Shows great potential in advanced mathematics.',
    //     date: new Date('2024-10-15')
    //   },
    //   {
    //     student: students[1]._id,
    //     subject: subjects[1]._id,
    //     teacher: teachers[1]._id,
    //     remark: 'Outstanding creative writing abilities. Always submits high-quality essays.',
    //     date: new Date('2024-10-10')
    //   },
    //   {
    //     student: students[2]._id,
    //     subject: subjects[2]._id,
    //     teacher: teachers[2]._id,
    //     remark: 'Needs to improve lab safety practices. Good understanding of theoretical concepts.',
    //     date: new Date('2024-10-05')
    //   },
    //   {
    //     student: students[3]._id,
    //     subject: subjects[4]._id,
    //     teacher: teachers[0]._id,
    //     remark: 'Participates actively in class discussions. Could benefit from additional practice.',
    //     date: new Date('2024-10-12')
    //   }
    // ]);
    // console.log('✓ Remarks created');

    // // 9. Create Student Attendance
    // const studentAttendance = await StudentAttendance.insertMany([
    //   {
    //     student: students[0]._id,
    //     subject: subjects[0]._id,
    //     recordedBy: teachers[0]._id,
    //     date: new Date('2024-10-28')
    //   },
    //   {
    //     student: students[0]._id,
    //     subject: subjects[1]._id,
    //     recordedBy: teachers[1]._id,
    //     date: new Date('2024-10-28')
    //   },
    //   {
    //     student: students[1]._id,
    //     subject: subjects[0]._id,
    //     recordedBy: teachers[0]._id,
    //     date: new Date('2024-10-28')
    //   },
    //   {
    //     student: students[1]._id,
    //     subject: subjects[1]._id,
    //     recordedBy: teachers[1]._id,
    //     date: new Date('2024-10-28')
    //   },
    //   {
    //     student: students[2]._id,
    //     subject: subjects[2]._id,
    //     recordedBy: teachers[2]._id,
    //     date: new Date('2024-10-27')
    //   },
    //   {
    //     student: students[3]._id,
    //     subject: subjects[4]._id,
    //     recordedBy: teachers[0]._id,
    //     date: new Date('2024-10-28')
    //   },
    //   {
    //     student: students[4]._id,
    //     subject: subjects[5]._id,
    //     recordedBy: teachers[1]._id,
    //     date: new Date('2024-10-28')
    //   }
    // ]);
    // console.log('✓ Student attendance created');

    // // 10. Create Teacher Attendance
    // const teacherAttendance = await TeacherAttendance.insertMany([
    //   {
    //     teacherId: teachers[0]._id,
    //     date: new Date('2024-10-28'),
    //     location: {
    //       type: 'Point',
    //       coordinates: [35.9239, 31.9454]
    //     }
    //   },
    //   {
    //     teacherId: teachers[1]._id,
    //     date: new Date('2024-10-28'),
    //     location: {
    //       type: 'Point',
    //       coordinates: [35.9239, 31.9454]
    //     }
    //   },
    //   {
    //     teacherId: teachers[2]._id,
    //     date: new Date('2024-10-28'),
    //     location: {
    //       type: 'Point',
    //       coordinates: [35.9239, 31.9454]
    //     }
    //   },
    //   {
    //     teacherId: teachers[3]._id,
    //     date: new Date('2024-10-28'),
    //     location: {
    //       type: 'Point',
    //       coordinates: [35.9239, 31.9454]
    //     }
    //   },
    //   {
    //     teacherId: teachers[0]._id,
    //     date: new Date('2024-10-27'),
    //     location: {
    //       type: 'Point',
    //       coordinates: [35.9239, 31.9454]
    //     }
    //   },
    //   {
    //     teacherId: teachers[1]._id,
    //     date: new Date('2024-10-27'),
    //     location: {
    //       type: 'Point',
    //       coordinates: [35.9239, 31.9454]
    //     }
    //   }
    // ]);
    // console.log('✓ Teacher attendance created');

    // // 11. Create Academic Calendar
    // const academicCalendar = await AcademicCalendar.insertMany([
    //   {
    //     title: 'First Semester Start',
    //     description: 'Beginning of the 2024-2025 academic year first semester',
    //     eventType: 'semester_start',
    //     startDate: new Date('2024-09-01'),
    //     endDate: new Date('2024-09-01'),
    //     startTime: '08:00',
    //     endTime: '14:00',
    //     academicYear: '2024-2025',
    //     semester: 'First',
    //     createdBy: admin._id,
    //     isActive: true
    //   },
    //   {
    //     title: 'Midterm Examinations',
    //     description: 'First semester midterm examination period',
    //     eventType: 'exam_schedule',
    //     startDate: new Date('2024-10-20'),
    //     endDate: new Date('2024-10-25'),
    //     startTime: '09:00',
    //     endTime: '12:00',
    //     academicYear: '2024-2025',
    //     semester: 'First',
    //     createdBy: admin._id,
    //     isActive: true
    //   },
    //   {
    //     title: 'Winter Break',
    //     description: 'Winter holiday break for students and staff',
    //     eventType: 'holiday',
    //     startDate: new Date('2024-12-20'),
    //     endDate: new Date('2025-01-05'),
    //     academicYear: '2024-2025',
    //     semester: 'First',
    //     createdBy: admin._id,
    //     isActive: true
    //   },
    //   {
    //     title: 'First Semester Final Exams',
    //     description: 'Final examination period for first semester',
    //     eventType: 'exam_schedule',
    //     startDate: new Date('2025-01-15'),
    //     endDate: new Date('2025-01-25'),
    //     startTime: '09:00',
    //     endTime: '12:00',
    //     academicYear: '2024-2025',
    //     semester: 'First',
    //     createdBy: admin._id,
    //     isActive: true
    //   },
    //   {
    //     title: 'Grade Submission Deadline',
    //     description: 'Teachers must submit final grades by this date',
    //     eventType: 'grade_submission_deadline',
    //     startDate: new Date('2025-01-30'),
    //     endDate: new Date('2025-01-30'),
    //     startTime: '00:00',
    //     endTime: '23:59',
    //     academicYear: '2024-2025',
    //     semester: 'First',
    //     createdBy: admin._id,
    //     isActive: true
    //   },
    //   {
    //     title: 'First Semester End',
    //     description: 'Last day of the first semester',
    //     eventType: 'semester_end',
    //     startDate: new Date('2025-01-31'),
    //     endDate: new Date('2025-01-31'),
    //     academicYear: '2024-2025',
    //     semester: 'First',
    //     createdBy: admin._id,
    //     isActive: true
    //   },
    //   {
    //     title: 'Parent-Teacher Meeting',
    //     description: 'Quarterly parent-teacher conference to discuss student progress',
    //     eventType: 'parent_meeting',
    //     startDate: new Date('2024-11-15'),
    //     endDate: new Date('2024-11-15'),
    //     startTime: '14:00',
    //     endTime: '18:00',
    //     academicYear: '2024-2025',
    //     semester: 'First',
    //     specificToClass: classes[0]._id,
    //     createdBy: admin._id,
    //     isActive: true
    //   },
    //   {
    //     title: 'Science Fair',
    //     description: 'Annual school science fair showcasing student projects',
    //     eventType: 'special_event',
    //     startDate: new Date('2024-12-10'),
    //     endDate: new Date('2024-12-10'),
    //     startTime: '10:00',
    //     endTime: '16:00',
    //     academicYear: '2024-2025',
    //     semester: 'First',
    //     createdBy: admin._id,
    //     isActive: true
    //   },
    //   {
    //     title: 'Mathematics Competition',
    //     description: 'Inter-class mathematics competition for Grade 10',
    //     eventType: 'special_event',
    //     startDate: new Date('2024-11-20'),
    //     endDate: new Date('2024-11-20'),
    //     startTime: '10:00',
    //     endTime: '13:00',
    //     academicYear: '2024-2025',
    //     semester: 'First',
    //     specificToSubject: subjects[0]._id,
    //     createdBy: teachers[0]._id,
    //     isActive: true
    //   }
    // ]);
    // console.log('✓ Academic calendar created');

    // // Summary
    // console.log('\n=================================');
    // console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    // console.log('=================================');
    // console.log(`Schools: ${1}`);
    // console.log(`Users (Admin + Teachers): ${1 + teachers.length}`);
    // console.log(`Classes: ${classes.length}`);
    // console.log(`Subjects: ${subjects.length}`);
    // console.log(`Students: ${students.length}`);
    // console.log(`Grade Records: ${grades.length}`);
    // console.log(`Remarks: ${remarks.length}`);
    // console.log(`Student Attendance Records: ${studentAttendance.length}`);
    // console.log(`Teacher Attendance Records: ${teacherAttendance.length}`);
    // console.log(`Academic Calendar Events: ${academicCalendar.length}`);
    // console.log('=================================\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedDatabase();