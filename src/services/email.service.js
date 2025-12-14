import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendUserPassword = async (email, password, resetLink) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for port 465, false for 587
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ERP System" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Account Credentials",
    text: `
Your temporary password is: ${password}

For security, please reset your password using the link below:
${resetLink}

This link expires in 15 minutes.
`,
  });
};
