import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAlertEmail(params: {
  to: string;
  tokenName: string;
  tokenType: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  triggeredAt: Date;
}) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: "Alertokens <onboarding@resend.dev>",
      to: params.to,
      subject: `🚨 Токен сработал: ${params.tokenName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a1e; color: #e2e8f0; padding: 32px; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6); padding: 16px 24px; border-radius: 12px; margin-bottom: 24px;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🚨 Alertokens</h1>
            <p style="margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Токен-ловушка сработала!</p>
          </div>
          <h2 style="color: #f87171; margin-bottom: 8px;">Обнаружен несанкционированный доступ</h2>
          <p style="color: #94a3b8;">Ваш токен <strong style="color: #e2e8f0;">${params.tokenName}</strong> был активирован.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
              <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Тип токена</td>
              <td style="padding: 10px 0; color: #e2e8f0; font-weight: bold;">${params.tokenType}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
              <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Время</td>
              <td style="padding: 10px 0; color: #e2e8f0;">${params.triggeredAt.toLocaleString("ru-RU")}</td>
            </tr>
            ${params.ipAddress ? `<tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 10px 0; color: #64748b; font-size: 13px;">IP-адрес</td><td style="padding: 10px 0; color: #f87171; font-family: monospace;">${params.ipAddress}</td></tr>` : ""}
            ${params.userAgent ? `<tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 10px 0; color: #64748b; font-size: 13px;">User Agent</td><td style="padding: 10px 0; color: #e2e8f0; font-size: 12px;">${params.userAgent}</td></tr>` : ""}
            ${params.referer ? `<tr><td style="padding: 10px 0; color: #64748b; font-size: 13px;">Referer</td><td style="padding: 10px 0; color: #e2e8f0;">${params.referer}</td></tr>` : ""}
          </table>
          <p style="color: #475569; font-size: 13px; margin-top: 24px;">Это автоматическое уведомление от Alertokens.</p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Email send failed:", e);
  }
}
