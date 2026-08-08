import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listingId, oldPrice, newPrice, currency } = body;

    if (!listingId || !oldPrice || !newPrice || !currency) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Get Listing Details
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('title, slug, images')
      .eq('id', listingId)
      .maybeSingle();

    if (listingError || !listing) {
      console.error('Listing not found for price drop notification:', listingError);
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // 2. Get Users who favorited and want notification
    const { data: favorites, error: favError } = await supabaseAdmin
      .from('favorites')
      .select('user_id')
      .eq('listing_id', listingId)
      .eq('notify_price_change', true);

    if (favError || !favorites || favorites.length === 0) {
      console.log(`No users to notify for price drop on listing: ${listing.title}`);
      return NextResponse.json({ success: true, message: 'No users to notify' });
    }

    // 3. Load SMTP configurations
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER || 'yachting@cmx.com.tr';
    const pass = process.env.SMTP_PASS || 'ALi!@-BeRK*-20.23';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tekne-app.vercel.app';
    const listingUrl = `${siteUrl}/listings/${listing.slug}`;
    const imgUrl = (listing.images && listing.images.length > 0)
      ? listing.images[0]
      : `${siteUrl}/assets/logo.png`;

    const oldPriceFormatted = new Intl.NumberFormat('tr-TR').format(oldPrice) + ' ' + currency;
    const newPriceFormatted = new Intl.NumberFormat('tr-TR').format(newPrice) + ' ' + currency;

    // 4. Fetch emails and send notifications
    let sentCount = 0;
    for (const fav of favorites) {
      try {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(fav.user_id);
        if (userError || !userData?.user?.email) continue;

        const recipientEmail = userData.user.email;
        const recipientName = userData.user.user_metadata?.full_name || 'Değerli Üyemiz';

        const mailOptions = {
          from: `"satiliktekne.com" <${user}>`,
          to: recipientEmail,
          subject: `📉 Fiyat Düştü! ${listing.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Fiyat Düştü!</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  background-color: #f8fafc;
                  margin: 0;
                  padding: 0;
                }
                .wrapper {
                  width: 100%;
                  background-color: #f8fafc;
                  padding: 30px 20px;
                  box-sizing: border-box;
                }
                .container {
                  max-width: 560px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border: 1px solid #e2e8f0;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .header {
                  background-color: #0066ff;
                  padding: 24px;
                  text-align: center;
                }
                .logo {
                  height: 36px;
                  width: auto;
                }
                .content {
                  padding: 32px;
                  text-align: center;
                }
                .title {
                  font-size: 20px;
                  font-weight: 800;
                  color: #0f172a;
                  margin-top: 0;
                  margin-bottom: 12px;
                }
                .text {
                  font-size: 15px;
                  line-height: 1.6;
                  color: #475569;
                  margin-bottom: 24px;
                }
                .boat-card {
                  background-color: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  padding: 16px;
                  margin-bottom: 24px;
                  text-align: left;
                }
                .boat-img {
                  width: 100%;
                  height: auto;
                  max-height: 240px;
                  object-fit: cover;
                  border-radius: 8px;
                  margin-bottom: 12px;
                }
                .boat-title {
                  font-size: 16px;
                  font-weight: 700;
                  color: #0f172a;
                  margin: 0 0 12px 0;
                }
                .price-box {
                  display: flex;
                  align-items: center;
                  gap: 16px;
                  margin-bottom: 8px;
                }
                .old-price {
                  color: #94a3b8;
                  text-decoration: line-through;
                  font-size: 15px;
                }
                .new-price {
                  color: #10b981;
                  font-weight: 800;
                  font-size: 20px;
                }
                .btn {
                  display: inline-block;
                  background-color: #0066ff;
                  color: #ffffff !important;
                  text-decoration: none;
                  padding: 14px 28px;
                  border-radius: 10px;
                  font-size: 15px;
                  font-weight: 700;
                  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.15);
                }
                .footer {
                  background-color: #f8fafc;
                  padding: 20px;
                  text-align: center;
                  border-top: 1px solid #f1f5f9;
                  font-size: 12px;
                  color: #94a3b8;
                }
                .footer a {
                  color: #0066ff;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="container">
                  <div class="header">
                    <img class="logo" src="${siteUrl}/assets/logo.png" alt="satiliktekne.com">
                  </div>
                  <div class="content">
                    <h1 class="title">📉 Takip Ettiğiniz İlanda Fiyat Düştü!</h1>
                    <p class="text">
                      Sayın ${recipientName},<br>
                      Favorilerinizde bulunan aşağıdaki ilanda fiyat indirimi yapıldı. Kaçırmamanızı öneririz!
                    </p>
                    
                    <div class="boat-card">
                      <img class="boat-img" src="${imgUrl}" alt="${listing.title}">
                      <h3 class="boat-title">${listing.title}</h3>
                      <div class="price-box">
                        <span class="old-price">${oldPriceFormatted}</span>
                        <span style="color: #94a3b8; font-size: 18px;">➔</span>
                        <span class="new-price">${newPriceFormatted}</span>
                      </div>
                    </div>
                    
                    <a class="btn" href="${listingUrl}">İlanı İncele</a>
                  </div>
                  <div class="footer">
                    © 2026 <a href="${siteUrl}">satiliktekne.com</a>. Tüm hakları saklıdır.
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        };

        await transporter.sendMail(mailOptions);
        sentCount++;
      } catch (userErr) {
        console.error(`Failed to send price drop notification to user id: ${fav.user_id}`, userErr);
      }
    }

    console.log(`Successfully sent ${sentCount} price drop emails for: "${listing.title}"`);
    return NextResponse.json({ success: true, sentCount });
  } catch (err: any) {
    console.error('Error in notify-price-drop api:', err);
    return NextResponse.json({ error: err.message || 'Error processing request' }, { status: 500 });
  }
}
