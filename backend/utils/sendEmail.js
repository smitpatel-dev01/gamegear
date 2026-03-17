import nodemailerPkg from "nodemailer";
const { createTransport } = nodemailerPkg;

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send failed (non-fatal):", err.message);
  }
};

export default sendEmail;