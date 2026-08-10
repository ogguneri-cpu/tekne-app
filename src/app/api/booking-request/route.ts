import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      listingId,
      listingTitle,
      startDate,
      endDate,
      days,
      total,
      currency,
      renterName,
      renterEmail,
      renterPhone
    } = body;

    if (!listingId || !startDate || !endDate || !renterName || !renterEmail || !renterPhone) {
      return NextResponse.json({ error: 'Eksik parametreler.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Get listing slug for detail link
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('slug')
      .eq('id', listingId)
      .maybeSingle();

    // 2. Load SMTP configurations
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER || 'account@cmx.com.tr';
    const pass = process.env.SMTP_PASS || 'ALi!@-BeRK*-20.23';
    const sender = 'yachting@cmx.com.tr';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://satiliktekne.com';
    const listingUrl = listing?.slug ? `${siteUrl}/tr/listings/${listing.slug}` : siteUrl;

    const formattedTotal = total ? new Intl.NumberFormat('tr-TR').format(total) + ' ' + currency : '-';
    
    // Format dates to readable format (DD.MM.YYYY)
    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const mailOptions = {
      from: `"satiliktekne.com" <${user}>`,
      to: 'yachting@cmx.com.tr',
      replyTo: renterEmail,
      subject: `📅 Rezervasyon Talebi: ${listingTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f8fafc;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              background: #0a1628;
              color: #ffffff;
              padding: 24px;
              text-align: center;
            }
            .header h2 {
              margin: 0;
              font-size: 22px;
              font-weight: bold;
              letter-spacing: 0.5px;
            }
            .header p {
              margin: 6px 0 0;
              opacity: 0.8;
              font-size: 14px;
            }
            .content {
              padding: 30px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #0a1628;
              margin-top: 0;
              margin-bottom: 12px;
              border-bottom: 2px solid #0066FF;
              padding-bottom: 6px;
              display: inline-block;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            .details-table td {
              padding: 10px 0;
              border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
            }
            .details-table td.label {
              color: #64748b;
              width: 40%;
            }
            .details-table td.value {
              font-weight: 600;
              color: #1e293b;
              text-align: right;
            }
            .btn-container {
              text-align: center;
              margin-top: 20px;
            }
            .btn-action {
              background: #0066FF;
              color: #ffffff !important;
              padding: 12px 28px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 14px;
              display: inline-block;
              box-shadow: 0 4px 10px rgba(0, 102, 255, 0.25);
            }
            .footer {
              background: #f8fafc;
              padding: 16px;
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⚓ satiliktekne.com</h2>
              <p>Yeni Rezervasyon Talebi Alındı</p>
            </div>
            
            <div class="content">
              <div class="section-title">Tekne Bilgileri</div>
              <table class="details-table">
                <tr>
                  <td class="label">Tekne Adı</td>
                  <td class="value">${listingTitle}</td>
                </tr>
                <tr>
                  <td class="label">Giriş Tarihi</td>
                  <td class="value">${formatDate(startDate)}</td>
                </tr>
                <tr>
                  <td class="label">Çıkış Tarihi</td>
                  <td class="value">${formatDate(endDate)}</td>
                </tr>
                <tr>
                  <td class="label">Süre</td>
                  <td class="value">${days} Gün</td>
                </tr>
                <tr>
                  <td class="label">Toplam Tutar</td>
                  <td class="value">${formattedTotal}</td>
                </tr>
              </table>

              <div class="section-title">Müşteri Bilgileri</div>
              <table class="details-table">
                <tr>
                  <td class="label">Adı Soyadı</td>
                  <td class="value">${renterName}</td>
                </tr>
                <tr>
                  <td class="label">Telefon Numarası</td>
                  <td class="value">${renterPhone}</td>
                </tr>
                <tr>
                  <td class="label">E-posta Adresi</td>
                  <td class="value">${renterEmail}</td>
                </tr>
              </table>

              <div class="btn-container">
                <a href="${listingUrl}" class="btn-action" target="_blank">İlanı Sitede Görüntüle</a>
              </div>
            </div>
            
            <div class="footer">
              Bu e-posta satiliktekne.com üzerinden yapılan rezervasyon talebi doğrultusunda otomatik olarak gönderilmiştir.
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending booking request email:', error);
    return NextResponse.json({ error: error.message || 'E-posta gönderilirken bir hata oluştu.' }, { status: 500 });
  }
}
