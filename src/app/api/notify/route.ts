import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, brand, price, currency, city, district, type } = body;

    // Load SMTP configurations from environment
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn('SMTP credentials (SMTP_USER, SMTP_PASS) are not configured in .env.local. Skipping email send.');
      return NextResponse.json({ success: true, warning: 'SMTP credentials missing' });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const adminLink = `${siteUrl}/tr/admin`;

    const priceFormatted = price ? new Intl.NumberFormat('tr-TR').format(price) + ' ' + currency : '-';
    const locationFormatted = `${city} / ${district || ''}`;

    const mailOptions = {
      from: `"satiliktekne.com" <${user}>`,
      to: 'yachting@cmx.com.tr',
      subject: `🚤 Yeni İlan: ${title}`,
      html: `
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0a1628; color: #fff; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h2 style="margin: 0;">⚓ satiliktekne.com</h2>
            <p style="margin: 5px 0 0; opacity: 0.7; font-size: 14px;">Yeni İlan Başvurusu</p>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
            <h3 style="color: #0a1628; margin-top: 0;">${title}</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b;">Tür</td><td style="padding: 8px 0; font-weight: 600;">${type === 'sale' ? 'Satılık' : 'Kiralık'}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Kategori</td><td style="padding: 8px 0; font-weight: 600;">${category}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Marka</td><td style="padding: 8px 0; font-weight: 600;">${brand}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Fiyat</td><td style="padding: 8px 0; font-weight: 600;">${priceFormatted}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Konum</td><td style="padding: 8px 0; font-weight: 600;">${locationFormatted}</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
            <p style="text-align: center; margin-top: 20px;">
              <a href="${adminLink}" style="background: #0066FF; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Admin Panelini Aç</a>
            </p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent successfully to yachting@cmx.com.tr for: "${title}"`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error sending notify email:', err);
    return NextResponse.json({ error: err.message || 'Error sending email' }, { status: 500 });
  }
}
