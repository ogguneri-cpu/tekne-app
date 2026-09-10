import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Helper to normalize subject titles and prevent SUBJ_ALL_CAPS spam penalties
function formatSubjectTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  const upperCount = (rawTitle.match(/[A-ZĞÜŞİÖÇ]/g) || []).length;
  const alphaCount = (rawTitle.match(/[a-zA-ZğüşıöçĞÜŞİÖÇ]/g) || []).length;
  if (alphaCount > 4 && upperCount / alphaCount > 0.6) {
    return rawTitle
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1))
      .join(' ');
  }
  return rawTitle;
}

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
    const profileLink = `${siteUrl}/tr/profile`;

    const priceFormatted = price ? new Intl.NumberFormat('tr-TR').format(price) + ' ' + (currency || 'TL') : '-';
    const locationFormatted = [city, district].filter(Boolean).join(' / ') || '-';
    const brandModelFormatted = [brand, model].filter(Boolean).join(' ') || '-';
    const subjectTitle = formatSubjectTitle(title);

    // Logo embedding: use CID attachment if local file exists, otherwise fallback to remote URL
    const logoPath = path.join(process.cwd(), 'public/assets/logo.png');
    const hasLocalLogo = fs.existsSync(logoPath);
    const logoSrc = hasLocalLogo ? 'cid:site-logo' : `${siteUrl}/assets/logo.png`;
    const attachments = hasLocalLogo
      ? [{ filename: 'logo.png', path: logoPath, cid: 'site-logo' }]
      : [];

    const commonHeaders = {
      'X-Mailer': 'satiliktekne.com Notification System',
      'X-Priority': '3',
      'Precedence': 'bulk',
      'Auto-Submitted': 'auto-generated'
    };

    // ─────────────────────────────────────────────────────────────
    // CASE 1: NEW LISTING SUBMITTED (ONAY BEKLİYOR)
    // ─────────────────────────────────────────────────────────────
    if (action === 'new_listing') {
      // 1. Email to Admin (yachting@cmx.com.tr)
      const adminText = `satiliktekne.com - Yeni İlan Onay Bekliyor

Platformda yeni bir ilan girişi yapıldı.

İlan Başlığı: ${title || 'Başlıksız İlan'}
İlan Türü: ${type === 'sale' ? 'Satılık' : 'Kiralık'}
Kategori: ${category || '-'}
Marka / Model: ${brandModelFormatted}
${year ? `Model Yılı: ${year}\n` : ''}Fiyat: ${priceFormatted}
Konum: ${locationFormatted}
İlan Sahibi: ${userName}
${userPhone ? `Telefon: ${userPhone}\n` : ''}${userEmail ? `E-posta: ${userEmail}\n` : ''}
Admin Panelinde İncele ve Onayla:
${adminLink}

--
Bu e-posta satiliktekne.com yönetim paneli bildirim sistemi tarafından otomatik gönderilmiştir.
`;

      const adminMailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 16px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .badge { display: inline-block; background: #fef3c7; color: #92400e; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; border: 1px solid #fde68a; white-space: nowrap; }
            .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
            .table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
            .table td.label { color: #64748b; width: 38%; }
            .table td.value { font-weight: 600; color: #0f172a; text-align: right; }
            .btn { display: inline-block; background: #0066ff; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.25); }
            .footer { margin-top: 24px; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Top Header: Logo on left (aligned with text below), 'Yeni İlan Onay Bekliyor' on right -->
            <table class="header-table">
              <tr>
                <td style="vertical-align: middle; text-align: left; padding: 0;">
                  <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                    <img src="${logoSrc}" alt="satiliktekne.com" style="height: 38px; width: auto; max-width: 200px; display: block; border: 0;" />
                  </a>
                </td>
                <td style="vertical-align: middle; text-align: right; padding: 0;">
                  <span class="badge">Yeni İlan Onay Bekliyor</span>
                </td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0 24px;">

            <h3 style="color:#0f172a; margin-top:0; margin-bottom:8px; font-size:20px; font-weight:800; line-height:1.3;">
              ${title || 'Başlıksız İlan'}
            </h3>
            <p style="color:#475569; font-size:14.5px; line-height:1.6; margin:0 0 20px;">
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

            <div class="footer">
              Bu e-posta satiliktekne.com yönetim paneli bildirim sistemi tarafından otomatik gönderilmiştir.
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"satiliktekne.com" <${authUser}>`,
        replyTo: adminEmail,
        to: adminEmail,
        subject: `[satiliktekne.com] Yeni İlan Onay Bekliyor: ${subjectTitle || 'İlan'}`,
        text: adminText,
        html: adminMailHtml,
        headers: commonHeaders,
        attachments
      });
      console.log(`Admin notification email sent successfully to ${adminEmail} for: "${title}"`);

      // 2. Email to User (Submitter Confirmation)
      if (userEmail) {
        const userText = `satiliktekne.com - İlanınız Alındı

Sayın ${userName},

"${title}" başlıklı ilanınız başarıyla oluşturulmuş ve değerlendirilmek üzere editörlerimize iletilmiştir.

İlan Özeti:
- İlan Başlığı: ${title}
- İlan Türü: ${type === 'sale' ? 'Satılık' : 'Kiralık'}
- Kategori: ${category || '-'}
- Marka / Model: ${brandModelFormatted}
${year ? `- Model Yılı: ${year}\n` : ''}- Fiyat: ${priceFormatted}
- Konum: ${locationFormatted}

İlanınız editörlerimiz tarafından incelendikten sonra en kısa sürede onaylanarak yayına alınacaktır. Yayına alındığında tarafınıza tekrar bilgilendirme yapılacaktır.

Sorularınız için bizimle ${adminEmail} adresinden iletişime geçebilirsiniz.

satiliktekne.com ekibi
`;

        const userMailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 16px; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
              .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; border: 1px solid #bfdbfe; white-space: nowrap; }
              .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
              .table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
              .table td.label { color: #64748b; width: 38%; }
              .table td.value { font-weight: 600; color: #0f172a; text-align: right; }
              .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 14px; color: #166534; line-height: 1.6; }
              .footer { margin-top: 24px; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
            </style>
          </head>
          <body>
            <div class="container">
              <!-- Top Header: Logo on left (aligned with text below), 'İlanınız Alındı' on right -->
              <table class="header-table">
                <tr>
                  <td style="vertical-align: middle; text-align: left; padding: 0;">
                    <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${logoSrc}" alt="satiliktekne.com" style="height: 38px; width: auto; max-width: 200px; display: block; border: 0;" />
                    </a>
                  </td>
                  <td style="vertical-align: middle; text-align: right; padding: 0;">
                    <span class="badge">İlanınız Alındı</span>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0 24px;">

              <h3 style="color:#0f172a; margin-top:0; margin-bottom:8px; font-size:18px; font-weight:800;">
                Sayın ${userName},
              </h3>
              <p style="color:#475569; font-size:14.5px; line-height:1.6; margin:0 0 16px;">
                <strong>"${title}"</strong> başlıklı ilanınız başarıyla oluşturulmuş ve değerlendirilmek üzere editörlerimize iletilmiştir.
              </p>

              <div class="info-box">
                ✅ <strong>Onay Süreci:</strong> Güvenli alışveriş standartlarımız gereğince ilanınız en kısa sürede kontrol edilerek onaylanacak ve satiliktekne.com üzerinde yayına alınacaktır. Yayına alındığında tarafınıza tekrar e-posta ile bilgilendirme yapılacaktır.
              </div>

              <table class="table">
                <tr><td class="label">İlan Başlığı</td><td class="value">${title}</td></tr>
                <tr><td class="label">İlan Türü</td><td class="value">${type === 'sale' ? 'Satılık' : 'Kiralık'}</td></tr>
                <tr><td class="label">Kategori</td><td class="value">${category || '-'}</td></tr>
                <tr><td class="label">Marka / Model</td><td class="value">${brandModelFormatted}</td></tr>
                ${year ? `<tr><td class="label">Model Yılı</td><td class="value">${year}</td></tr>` : ''}
                <tr><td class="label">Fiyat</td><td class="value" style="color: #0066ff; font-size: 15px;">${priceFormatted}</td></tr>
                <tr><td class="label">Konum</td><td class="value">${locationFormatted}</td></tr>
              </table>

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
          subject: `[satiliktekne.com] İlanınız Alındı (Onay Sürecinde): ${subjectTitle || 'İlan'}`,
          text: userText,
          html: userMailHtml,
          headers: commonHeaders,
          attachments
        });
        console.log(`User confirmation email sent successfully to ${userEmail}`);
      }

      return NextResponse.json({ success: true });
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 2: LISTING APPROVED (ONAYLANDI - ENERJİK & İLANI GÖR BUTONU)
    // ─────────────────────────────────────────────────────────────
    if (action === 'listing_approved' && userEmail) {
      const approvedText = `satiliktekne.com - Tebrikler, İlanınız Yayında!

Sayın ${userName},

Harika bir haber! "${title}" başlıklı ilanınız editörlerimiz tarafından incelendi ve başarıyla yayına alındı!

İlanınız artık Türkiye genelindeki binlerce potansiyel alıcı ve tekne tutkunu tarafından görüntülenebilir.

İlanınızı görüntülemek için:
${listingLink}

satiliktekne.com ailesi olarak bol kazançlı ve keyifli bir satış süreci dileriz!
`;

      const approvedMailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 16px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .badge { display: inline-block; background: #ecfdf5; color: #047857; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; border: 1px solid #a7f3d0; white-space: nowrap; }
            .content { text-align: left; }
            .btn { display: inline-block; background: #0066ff; color: #ffffff !important; padding: 15px 36px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(0, 102, 255, 0.3); transition: background 0.2s ease; }
            .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; font-size: 14.5px; color: #166534; line-height: 1.65; }
            .footer { margin-top: 28px; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Top Header: Logo on left (aligned with text below), 'İlanınız Yayında' on right -->
            <table class="header-table">
              <tr>
                <td style="vertical-align: middle; text-align: left; padding: 0;">
                  <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                    <img src="${logoSrc}" alt="satiliktekne.com" style="height: 38px; width: auto; max-width: 200px; display: block; border: 0;" />
                  </a>
                </td>
                <td style="vertical-align: middle; text-align: right; padding: 0;">
                  <span class="badge">İlanınız Yayında</span>
                </td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0 24px;">

            <div class="content">
              <h2 style="color:#0f172a; margin-top:0; margin-bottom:12px; font-size:22px; font-weight:900; line-height:1.3;">
                Müjde! İlanınız Başarıyla Yayına Alındı 🚀
              </h2>

              <p style="color:#334155; font-size:15px; line-height:1.7; margin:0 0 16px;">
                Sayın <strong>${userName}</strong>,
              </p>

              <p style="color:#334155; font-size:15px; line-height:1.7; margin:0 0 16px;">
                <strong>"${title}"</strong> başlıklı ilanınız editörlerimiz tarafından incelendi, tüm standartları eksiksiz karşılayarak satiliktekne.com üzerinde yayına alındı!
              </p>

              <div class="success-box">
                🎉 <strong>İlanınız Artık Canlıda:</strong> İlanınız şu andan itibaren Türkiye genelinde binlerce tekne tutkunu ve potansiyel alıcı tarafından görüntülenebilir. Gelen teklifleri ve aramaları doğrudan telefonunuzdan veya profilinizden takip edebilirsiniz.
              </div>

              <div style="text-align: center; margin: 32px 0 16px;">
                <a href="${listingLink}" class="btn">İlanı Gör →</a>
              </div>
            </div>

            <div class="footer">
              satiliktekne.com ailesi olarak bol kazançlı ve keyifli bir satış süreci dileriz!
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"satiliktekne.com" <${authUser}>`,
        replyTo: adminEmail,
        to: userEmail,
        subject: `[satiliktekne.com] Harika Haber! İlanınız Yayında: ${subjectTitle || 'İlan'}`,
        text: approvedText,
        html: approvedMailHtml,
        headers: commonHeaders,
        attachments
      });
      console.log(`Approval email sent successfully to ${userEmail} for listing: "${title}"`);
      return NextResponse.json({ success: true });
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 3: LISTING REJECTED / NEEDS EDIT (POZİTİF DİL & 2 BUTON)
    // ─────────────────────────────────────────────────────────────
    if (action === 'listing_rejected' && userEmail) {
      const rejectedText = `satiliktekne.com - İlanınız Hakkında Bilgilendirme

Sayın ${userName},

"${title}" başlıklı ilanınız editörlerimiz tarafından incelenmiştir. İlanınızın potansiyel alıcılarla en etkili şekilde buluşabilmesi için birkaç detayda güncelleme yapılması gerekmektedir.

Olası Nedenler:
- Yüklenen fotoğrafların netliği, çözünürlüğü veya tekneye ait olup olmadığı,
- Tekne teknik özelliklerinde (marka, model, donanım veya boy) eksik/çelişkili bilgi bulunması,
- Fiyat veya iletişim bilgilerinde yazım hatası olması.

İlanınızı profilinizden kolayca düzenleyip yeniden onaya gönderebilirsiniz.

İlanlarıma Git: ${profileLink}
İletişime Geç: ${adminEmail}

satiliktekne.com Ekibi
`;

      const rejectedMailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 16px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .badge { display: inline-block; background: #fffbeb; color: #b45309; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; border: 1px solid #fde68a; white-space: nowrap; }
            .content { text-align: left; }
            .notice-box { background: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 18px 20px; margin: 20px 0; font-size: 14px; color: #854d0e; line-height: 1.7; }
            .notice-box ul { margin: 8px 0 0 18px; padding: 0; }
            .notice-box li { margin-bottom: 4px; }
            .btn-primary { display: inline-block; background: #0066ff; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.25); }
            .btn-secondary { display: inline-block; background: #f1f5f9; color: #1e293b !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; border: 1px solid #cbd5e1; }
            .footer { margin-top: 28px; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Top Header: Logo on left (aligned with text below), 'Düzenleme Gerekiyor' on right -->
            <table class="header-table">
              <tr>
                <td style="vertical-align: middle; text-align: left; padding: 0;">
                  <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                    <img src="${logoSrc}" alt="satiliktekne.com" style="height: 38px; width: auto; max-width: 200px; display: block; border: 0;" />
                  </a>
                </td>
                <td style="vertical-align: middle; text-align: right; padding: 0;">
                  <span class="badge">Düzenleme Gerekiyor</span>
                </td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0 24px;">

            <div class="content">
              <h2 style="color:#0f172a; margin-top:0; margin-bottom:12px; font-size:20px; font-weight:800; line-height:1.35;">
                İlanınızda Küçük Bir Güncelleme Gerekiyor
              </h2>

              <p style="color:#334155; font-size:15px; line-height:1.7; margin:0 0 16px;">
                Sayın <strong>${userName}</strong>,
              </p>

              <p style="color:#334155; font-size:15px; line-height:1.7; margin:0 0 16px;">
                <strong>"${title}"</strong> başlıklı ilanınız editörlerimiz tarafından incelenmiştir. İlanınızın en doğru ve etkili şekilde potansiyel alıcılarla buluşabilmesi için birkaç detayın güncellenmesi faydalı olacaktır.
              </p>

              <div class="notice-box">
                🔍 <strong>Olası Güncelleme Nedenleri:</strong>
                <ul>
                  <li>Fotoğrafların netliği, çözünürlüğü veya doğrudan tekneye ait olup olmadığı,</li>
                  <li>Tekne teknik özelliklerinde (marka, model, motor gücü veya boy) eksik ya da çelişkili bilgi bulunması,</li>
                  <li>Fiyat veya iletişim bilgilerinde kontrol edilmesi gereken bir yazım detayı olabilir.</li>
                </ul>
              </div>

              <p style="color:#475569; font-size:14.5px; line-height:1.7; margin:0 0 24px;">
                Profil sayfanıza giderek ilanınızı kolayca güncelleyebilir ve tek tıkla yeniden onayımıza sunabilirsiniz. Ekibimiz ilanınızı memnuniyetle yeniden inceleyip hızla yayına alacaktır.
              </p>

              <!-- Two Action Buttons side by side -->
              <table style="margin: 30px auto 16px; border-collapse: separate; border-spacing: 12px 0;">
                <tr>
                  <td>
                    <a href="${profileLink}" class="btn-primary">İlanlarıma Git →</a>
                  </td>
                  <td>
                    <a href="mailto:${adminEmail}" class="btn-secondary">İletişime Geç</a>
                  </td>
                </tr>
              </table>
            </div>

            <div class="footer">
              Her türlü sorunuz veya destek için bizimle <a href="mailto:${adminEmail}" style="color:#0066ff; text-decoration:none;">${adminEmail}</a> üzerinden her zaman iletişime geçebilirsiniz.<br>
              satiliktekne.com Destek Ekibi
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"satiliktekne.com" <${authUser}>`,
        replyTo: adminEmail,
        to: userEmail,
        subject: `[satiliktekne.com] İlanınız Hakkında Bilgilendirme: ${subjectTitle || 'İlan'}`,
        text: rejectedText,
        html: rejectedMailHtml,
        headers: commonHeaders,
        attachments
      });
      console.log(`Rejection/edit email sent successfully to ${userEmail} for listing: "${title}"`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error sending notify email:', err);
    return NextResponse.json({ error: err.message || 'Error sending email' }, { status: 500 });
  }
}
