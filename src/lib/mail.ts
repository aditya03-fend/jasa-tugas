import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Email gmail Anda
    pass: process.env.EMAIL_PASS, // App Password (BUKAN password login biasa)
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const mailOptions = {
    from: '"JasaTugas Support" <noreply@jasatugas.id>',
    to: email,
    subject: "Kode Verifikasi Akun",
    html: `<p>Kode verifikasi Anda adalah: <b>${token}</b></p><p>Kode ini berlaku selama 15 menit.</p>`,
  };

  await transporter.sendMail(mailOptions);
};