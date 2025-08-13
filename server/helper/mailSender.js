// import dotenv from "dotenv";
// import nodemailer from "nodemailer";

// dotenv.config();
// const pass = process.env.GMAIL_PASSWORD_KEY;
// const user = process.env.GMAIL_USER

// export async function mailSender(receiver, message, htmlContent = "Thank You") {
//   var transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: user,
//       pass: pass,
//     },
//   });

//   var mailOptions = {
//     from: user,
//     to: receiver,
//     subject: "Yours DGX Community",
//     text: message,
//     html: htmlContent,
//   };

//   return new Promise((resolve, reject) => {
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(error);
//         reject({ success: false, error: error.message });
//       } else {
//         // console.log('Email sent: ' + info.response);
//         resolve({ success: true, response: info.response });
//       }
//     });
//   });
// }


import dotenv from 'dotenv'
import nodemailer from 'nodemailer'


dotenv.config()
const pass = process.env.GMAIL_PASSWORD_KEY
const user = process.env.GMAIL_USER

export async function mailSender(receiver, message, htmlContent = "thank You") {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });

    var mailOptions = {
        from: user,
        to: receiver,
        subject: 'Yours DGX Community',
        text: message,
        html: htmlContent
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject({ success: false, error: error.message });
            } else {
                // console.log('Email sent: ' + info.response);
                resolve({ success: true, response: info.response });
            }
        });
    });

}
