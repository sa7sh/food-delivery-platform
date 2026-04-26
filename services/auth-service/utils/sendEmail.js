import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  console.log(`[EmailService] Attempting to send email to: ${options.email}`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("[EmailService] ERROR: EMAIL_USER or EMAIL_PASS is missing in environment variables!");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
