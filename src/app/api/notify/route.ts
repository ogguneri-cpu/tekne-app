import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action = 'new_listing',
      title,
      category,
      brand,
      model,
      price,
      currency,
      city,
      district,
      type,
      year,
      userEmail,
      userName = 'Değerli Kullanıcımız',
      userPhone,
      slug
    } = body;

    // Load SMTP configurations from environment
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const rawUser = process.env.SMTP_USER || 'account@cmx.com.tr';
    const pass = process.env.SMTP_PASS || 'ALi!@-BeRK*-20.23';
    const adminEmail = process.env.ADMIN_EMAIL || 'yachting@cmx.com.tr';

    // Ensure Hostinger auth uses account@cmx.com.tr if yachting is provided as user
    const authUser = rawUser === 'yachting@cmx.com.tr' ? 'account@cmx.com.tr' : rawUser;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: authUser, pass },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'https://satiliktekne.com';
    const adminLink = `${siteUrl}/tr/admin`;
    const listingLink = slug ? `${siteUrl}/tr/listings/${slug}` : siteUrl;

    const priceFormatted = price ? new Intl.NumberFormat('tr-TR').format(price) + ' ' + (currency || 'TL') : '-';
    const locationFormatted = [city, district].filter(Boolean).join(' / ') || '-';
    const brandModelFormatted = [brand, model].filter(Boolean).join(' ') || '-';

    // ─────────────────────────────────────────────────────────────
    // CASE 1: NEW LISTING SUBMITTED (ONAY BEKLİYOR)
    // ─────────────────────────────────────────────────────────────
    if (action === 'new_listing') {
      // 1. Email to Admin
      const adminMailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background: #0a1628; color: #ffffff; padding: 24px; text-align: center; }
            .badge { display: inline-block; background: #fef3c7; color: #92400e; font-weight: 700; font-size: 12px; padding: 4px 14px; border-radius: 20px; margin-top: 8px; letter-spacing: 0.5px; }
            .content { padding: 28px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
            .table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
            .table td.label { color: #64748b; width: 38%; }
            .table td.value { font-weight: 600; color: #0f172a; text-align: right; }
            .btn { display: inline-block; background: #0066ff; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.25); }
            .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin:0; font-size:22px;">⚓ satiliktekne.com</h2>
              <div class="badge">🟡 YENİ İLAN ONAY BEKLİYOR</div>
            </div>
            <div class="content">
              <h3 style="color:#0f172a; margin-top:0; font-size:18px;">${title || 'Başlıksız İlan'}</h3>
              <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 16px;">
                Platformda yeni bir ilan girişi yapıldı. İlan detayları aşağıda listelenmiştir. İlanı inceleyip onaylamak veya düzenlemek için admin panelini ziyaret edebilirsiniz.
              </p>
              <table class="table">
                <tr><td class="label">İlan Türü</td><td class="value">${type === 'sale' ? 'Satılık' : 'Kiralık'}</td></tr>
                <tr><td class="label">Kategori</td><td class="value">${category || '-'}</td></tr>
                <tr><td class="label">Marka / Model</td><td class="value">${brandModelFormatted}</td></tr>
                ${year ? `<tr><td class="label">Model Yılı</td><td class="value">${year}</td></tr>` : ''}
                <tr><td class="label">Fiyat</td><td class="value" style="color: #0066ff; font-size: 15px;">${priceFormatted}</td></tr>
                <tr><td class="label">Konum</td><td class="value">${locationFormatted}</td></tr>
                <tr><td class="label">İlan Sahibi</td><td class="value">${userName}</td></tr>
                ${userPhone ? `<tr><td class="label">Telefon</td><td class="value">${userPhone}</td></tr>` : ''}
                ${userEmail ? `<tr><td class="label">E-posta</td><td class="value">${userEmail}</td></tr>` : ''}
              </table>
              <div style="text-align: center; margin-top: 28px;">
                <a href="${adminLink}" class="btn">Admin Panelinde İncele ve Onayla</a>
              </div>
            </div>
            <div class="footer">
              Bu e-posta satiliktekne.com yönetim paneli bildirim sistemi tarafından otomatik gönderilmiştir.
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"satiliktekne.com" <${authUser}>`,
        replyTo: userEmail || adminEmail,
        to: adminEmail,
        subject: `🚤 Yeni İlan Onay Bekliyor: ${title || 'İlan'}`,
        html: adminMailHtml
      });
      console.log(`Admin notification email sent successfully to ${adminEmail} for: "${title}"`);

      // 2. Email to User (Submitter Confirmation)
      if (userEmail) {
        const userMailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
              .header { background: #0a1628; color: #ffffff; padding: 24px; text-align: center; }
              .content { padding: 28px; }
              .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 12px; padding: 4px 14px; border-radius: 20px; margin-top: 8px; }
              .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
              .table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
              .table td.label { color: #64748b; width: 38%; }
              .table td.value { font-weight: 600; color: #0f172a; text-align: right; }
              .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-top: 20px; font-size: 13.5px; color: #166534; line-height: 1.6; }
              .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin:0; font-size:22px;">⚓ satiliktekne.com</h2>
                <div class="badge">İLANINIZ ALINDI</div>
              </div>
              <div class="content">
                <h3 style="color:#0f172a; margin-top:0;">Sayın ${userName},</h3>
                <p style="color:#475569; font-size:14.5px; line-height:1.6;">
                  <strong>"${title}"</strong> başlıklı ilanınız başarıyla oluşturulmuş ve değerlendirilmek üzere editörlerimize iletilmiştir.
                </p>
                <div class="info-box">
                  ✅ <strong>Onay Süreci:</strong> Güvenli alışveriş standartlarımız gereğince ilanınız en kısa sürede kontrol edilerek onaylanacak ve satiliktekne.com üzerinde yayına alınacaktır. Yayına alındığında tarafınıza tekrar bilgilendirme yapılacaktır.
                </div>
                <table class="table">
                  <tr><td class="label">İlan Başlığı</td><td class="value">${title}</td></tr>
                  <tr><td class="label">Kategori</td><td class="value">${category || '-'}</td></tr>
                  <tr><td class="label">Marka / Model</td><td class="value">${brandModelFormatted}</td></tr>
                  <tr><td class="label">Fiyat</td><td class="value" style="color: #0066ff;">${priceFormatted}</td></tr>
                  <tr><td class="label">Konum</td><td class="value">${locationFormatted}</td></tr>
                </table>
              </div>
              <div class="footer">
                satiliktekne.com ailesini tercih ettiğiniz için teşekkür ederiz.<br>
                Sorularınız için bizimle <a href="mailto:${adminEmail}" style="color:#0066ff; text-decoration:none;">${adminEmail}</a> adresinden iletişime geçebilirsiniz.
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: `"satiliktekne.com" <${authUser}>`,
          replyTo: adminEmail,
          to: userEmail,
          subject: `⚓ İlanınız Başarıyla Alındı (Onay Sürecinde) - satiliktekne.com`,
          html: userMailHtml
        });
        console.log(`User confirmation email sent successfully to ${userEmail}`);
      }

      return NextResponse.json({ success: true });
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 2: LISTING APPROVED (ONAYLANDI BİLDİRİMİ)
    // ─────────────────────────────────────────────────────────────
    if (action === 'listing_approved' && userEmail) {
      const approvedMailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background: #059669; color: #ffffff; padding: 24px; text-align: center; }
            .badge { display: inline-block; background: #d1fae5; color: #065f46; font-weight: 700; font-size: 12px; padding: 4px 14px; border-radius: 20px; margin-top: 8px; }
            .content { padding: 28px; text-align: center; }
            .btn { display: inline-block; background: #0066ff; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 24px; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.25); }
            .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin:0; font-size:22px;">⚓ satiliktekne.com</h2>
              <div class="badge">🎉 İLANINIZ YAYINDA!</div>
            </div>
            <div class="content">
              <h3 style="color:#0f172a; margin-top:0;">Sayın ${userName},</h3>
              <p style="color:#475569; font-size:15px; line-height:1.6; margin:0 0 16px;">
                Harika bir haber! <strong>"${title}"</strong> başlıklı ilanınız editörlerimiz tarafından incelenmiş ve onaylanarak sitemizde yayına alınmıştır.
              </p>
              <p style="color:#64748b; font-size:14px; margin-bottom:20px;">
                İlanınız artık Türkiye genelinde binlerce potansiyel alıcı tarafından görüntülenebilir.
              </p>
              <a href="${listingLink}" class="btn">İlanınızı Sitede Görüntüleyin</a>
            </div>
            <div class="footer">
              satiliktekne.com ekibi olarak bol kazançlı ve keyifli bir satış dileriz!
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"satiliktekne.com" <${authUser}>`,
        replyTo: adminEmail,
        to: userEmail,
        subject: `🎉 Tebrikler! İlanınız Onaylandı ve Yayında - satiliktekne.com`,
        html: approvedMailHtml
      });
      console.log(`Approval email sent successfully to ${userEmail} for listing: "${title}"`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error sending notify email:', err);
    return NextResponse.json({ error: err.message || 'Error sending email' }, { status: 500 });
  }
}
