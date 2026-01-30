require("dotenv").config();
const nodemailer = require("nodemailer");
let subject;
const subjects = {
    gradeUploaded: "Notification - Grades Updated",
    remarkUploaded: "Notification - Remarks Updated",
    attendanceUpdated: "Notification - Attendance Taken",
    administration: "Notification - Administration",
    reply: "Notification - Reply to your message",
    certificate: "Notification - Certificate",
}


let transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN, 
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// const to = "Sultanmadhat25@gmail.com";
// const subject = "Anhalt HS Acceptance Letter";
// const message = `Congratulations! You have been accepted to our university. Here are the dates: <br>
// <ul style="list-style-type:disc; margin:20px 0; padding:0; font-size:15px; color:#444; line-height:1.7;">
// Orientation week starts on 15/3/2026<br>
// Orientation week ends on 20/3/2026<br>
// semester starts on 21/3/2026 <br>
// semester ends on 30/9/2026<br>
// <br>
// <br>
// <br>
// <br>
// <br>
// </ul>
// <div style="text-align:center; margin:20px 0;">
// Now all you have to do is go to sleep.
// </div>

// المهم كنت قاعد بجرب اني ابعث ايميلات من الباك ايند وربحت معنا رسالة اكصبتنص مجانا.... اسف 
// `;

const sendEmail = async (to , key,message, file) => {
    switch (key) {
      case "gradeUploaded":
        subject = subjects.gradeUploaded;
        break;
        case "remarkUploaded":
        subject = subjects.remarkUploaded;
        break;
        case "attendanceUpdated":
        subject = subjects.attendanceUpdated;
        break;
        case "administration":
        subject = subjects.administration;
        break;
        case "reply":
        subject = subjects.reply;
        break;
      case "certificate":
        subject = subjects.certificate;
        break;
      default:
        break;
    }
  try {
    const htmlTemplate = `
    <div style="background:#f6f9fc; padding:25px; font-family:Arial, sans-serif;">
      <div style="max-width:600px; margin:auto; background:#ffffff; padding:25px; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.07);">

        <!-- Title -->
        <h2 style="color:#0A66C2; margin-bottom:10px; text-align:center;">
          ${subject}
        </h2>

        <!-- Main Text -->
        <p style="font-size:15px; color:#444; line-height:1.7;">
          ${message}
        </p>
        <!-- Divider -->
        <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;">

        <!-- Footer -->
        <p style="font-size:12px; color:#777; text-align:center;">
          BestRegards,<br>
          <strong>${process.env.FROM_NAME}</strong><br>
          ${process.env.FROM_EMAIL}<br>
         Al-Nawras High School
        </p>

      </div>
    </div>
    `;
    let mailOptions;
    if(file){
      mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      attachments: [
        {
          filename: file.filename,
          path: file.path,
        }
      ],
      html: htmlTemplate,
      headers: {
  "List-Unsubscribe": "<mailto:nawrasalkhrissat@gmail.com>"
},
    };
    }else{
      mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html: htmlTemplate,
      headers: {
  "List-Unsubscribe": "<mailto:nawrasalkhrissat@gmail.com>"
},
    };
  }
    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error("Email Error:", error);
  }
};

 module.exports = sendEmail;

 module.exports = sendEmail;
