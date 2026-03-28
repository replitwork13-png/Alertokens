import { Resend } from "resend";

export async function sendTokenAlertEmail(opts: {
  toEmail: string;
  tokenName: string;
  tokenType: string;
  ipAddress: string | null;
  userAgent: string | null;
  referer: string | null;
  triggeredAt: Date;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const resend = new Resend(apiKey);
  const { toEmail, tokenName, tokenType, ipAddress, userAgent, referer, triggeredAt } = opts;
  const time = triggeredAt.toUTCString();

  const TYPE_LABELS: Record<string, string> = {
    web: "Веб-бикон",
    dns: "DNS",
    email: "Email",
    pdf: "PDF-документ",
    qr_code: "QR-код",
    image: "Изображение",
    credit_card: "Кредитная карта",
    redirect: "URL-редирект",
  };

  const typeLabel = TYPE_LABELS[tokenType] ?? tokenType.toUpperCase();

  await resend.emails.send({
    from: "Alertokens <onboarding@resend.dev>",
    to: toEmail,
    subject: `🚨 Тревога Alertokens: токен "${tokenName}" был активирован`,
    html: `
      <div style="font-family: monospace; background: #0d1117; color: #e6edf3; padding: 24px; border-radius: 8px; max-width: 600px;">
        <div style="border-left: 4px solid #f85149; padding-left: 16px; margin-bottom: 20px;">
          <h1 style="color: #f85149; font-size: 20px; margin: 0;">🚨 ТОКЕН СРАБОТАЛ</h1>
          <p style="color: #8b949e; margin: 4px 0 0;">Кто-то получил доступ к вашему токену-ловушке</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #8b949e; width: 140px;">Токен</td>
            <td style="padding: 8px 0; color: #e6edf3; font-weight: bold;">${tokenName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8b949e;">Тип</td>
            <td style="padding: 8px 0; color: #e6edf3;">${typeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8b949e;">Время</td>
            <td style="padding: 8px 0; color: #e6edf3;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8b949e;">IP-адрес</td>
            <td style="padding: 8px 0; color: #58a6ff; font-family: monospace;">${ipAddress || "Неизвестно"}</td>
          </tr>
          ${referer ? `<tr>
            <td style="padding: 8px 0; color: #8b949e;">Источник</td>
            <td style="padding: 8px 0; color: #e6edf3; word-break: break-all;">${referer}</td>
          </tr>` : ""}
          ${userAgent ? `<tr>
            <td style="padding: 8px 0; color: #8b949e;">User Agent</td>
            <td style="padding: 8px 0; color: #8b949e; font-size: 12px; word-break: break-all;">${userAgent}</td>
          </tr>` : ""}
        </table>

        <div style="margin-top: 24px; padding: 12px; background: #161b22; border-radius: 6px; border: 1px solid #30363d;">
          <p style="color: #8b949e; font-size: 12px; margin: 0;">Это уведомление отправлено вашим развёртыванием Alertokens. Если вы не ожидали этого — немедленно проведите расследование.</p>
        </div>
      </div>
    `,
  });
}
