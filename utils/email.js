const nodemailer = require("nodemailer");

// const sendEmail = async function (subject, message) {
//   const transport = nodemailer.createTransport({
//     // service: "gmail",
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = await transport.sendMail({
//     from: "oauife@school.com",
//     to: "unknown@gmail.com",
//     subject,
//     text: message,
//   });
// };

module.exports = class Email {
  constructor(user, message) {
    this.to = user.email;
    this.firstname = user.firstName;
    this.from = `The School ${process.env.EMAIL_FROM}`;
    this.message = message;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(subject, message) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: message,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  //   async resetPassword(){
  //     await this.send('ResetPassword', )
  //   }
};

// module.exports = sendEmail;
