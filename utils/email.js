const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'ac4906a252fcf0',
      pass: '6020c06338108e'
    }
  })
  // Define the mail options
  const mailOptions = {
    from: "Magic Elves <from@example.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  }
  console.log(mailOptions)
  // Actually send the mail
  transporter.sendMail(mailOptions);

};

module.exports = sendEmail;
