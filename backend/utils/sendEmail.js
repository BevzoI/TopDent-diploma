import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail(to, inviteLink) {
  try {
    console.log("📧 Sending email via Resend:", to);

    const response = await resend.emails.send({
      from: `TopDentTeam <${process.env.EMAIL_FROM}>`,
      to,
      subject: "Pozvánka do aplikace TopDentTeam",
      html: `
        <div style="font-family: Arial; max-width: 500px; margin: auto;">
          <h2 style="color:#2d8cff;">Vítejte v TopDentTeam 👋</h2>

          <p>Klikněte na tlačítko níže a nastavte si heslo:</p>

          <a href="${inviteLink}" 
            style="
              display:inline-block;
              padding:12px 20px;
              background:#2d8cff;
              color:white;
              text-decoration:none;
              border-radius:6px;
              margin-top:10px;
            ">
            Nastavit heslo
          </a>

          <p style="margin-top:20px;color:#888;">
            Odkaz je platný 24 hodin.
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent:", response);
  } catch (error) {
    console.error("❌ Resend error:", error);
    throw error;
  }
}
