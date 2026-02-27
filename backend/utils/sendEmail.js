import nodemailer from "nodemailer";

export async function sendInviteEmail(to, inviteLink) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"TopDentTeam" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Pozvánka do aplikace TopDentTeam",
    html: `
      <h2>Vítejte v TopDentTeam</h2>
      <p>Klikněte na tlačítko níže a nastavte si heslo:</p>
      <a href="${inviteLink}" 
         style="padding:10px 20px;background:#2d8cff;color:white;text-decoration:none;border-radius:5px;">
         Nastavit heslo
      </a>
      <p>Odkaz je platný 24 hodin.</p>
    `,
  });
}