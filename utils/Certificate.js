const ejs = require("ejs");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function generateCertificate(data) {
  const html = await ejs.renderFile(
    path.join(__dirname, "../views/certificate.ejs"),data);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.setContent(html, { waitUntil: "networkidle" });

  const outputDir = path.join(process.cwd(), "certificates");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  await page.pdf({
    path: path.join(outputDir, `${data.student.name}.pdf`),
    format: "A4",
    printBackground: true,
    margin: {
      top: "0mm",
      bottom: "0mm",
      left: "0mm",
      right: "0mm",
    },
  });

  await browser.close();
}
// const logoPath = path.join(process.cwd(), "public/images/logo.jpg");
//   const logoBase64 = fs.readFileSync(logoPath, "base64");
// generateCertificate({
//   school: {
//     name: "Al-Nahda International School",
//     address: "Amman - Khalda, Jordan",
//     contacts: {
//       phone: "+962 6 555 1234",
//       email: "info@Scholaris.edu.jo"
//     },
//   },

//   academicYear: "2024 / 2025",
//   semester: "First Semester",

//   student: {
//     name: "Ahmad Khaled",
//     nationalId: "100245678901",
//     dateOfBirth: new Date("2006-03-12"),
//     gender: "male",
//   },

//   cls: {
//     className: "Grade 10 - A",
//     responsibleTeacher: {
//       firstName: "Ahmed",
//       lastName: "Al-Masri",
//     },
//   },

//   marks: [
//     {
//       subjectName: "Mathematics Grade 10-A",
//       score: 88,
//     },
//     {
//       subjectName: "Physics Grade 10-A",
//       score: 92,
//     },
//     {
//       subjectName: "Chemistry Grade 10-A",
//       score: 76,
//     },
//     {
//       subjectName: "Biology Grade 10-A",
//       score: 81,
//     },
//     {
//       subjectName: "English Literature Grade 10-A",
//       score: 69,
//     },
//     {
//       subjectName: "History Grade 10-A",
//       score: 99,
//     },
//     {
//       subjectName: "Computer Science Grade 10-A",
//       score: 90,
//     },
//     {
//       subjectName: "Arabic Language Grade 10-A",
//       score: 77,
//     }
//   ],

//   finalResult: {
//     average: 84,
//     status: "pass",
//   },logoBase64
// });
module.exports = generateCertificate;
