export interface BlogPost {
  id: string;
  title: string;
  title_en?: string;
  tag: string;
  date: string;
  dateFormatted: string;
  dateFormattedEn: string;
  image: string;
  alt: string;
  content: string;
  content_en?: string;
}

export const BLOG_POSTS: Record<string, BlogPost> = {
  '1': {
    id: '1',
    title: 'Tekne Nasıl Satılır? 2026 Adım Adım Tekne Satış Rehberi',
    title_en: 'How to Sell a Boat? 2026 Step-by-Step Boat Sales Guide',
    tag: 'Rehber',
    date: '2026-06-05',
    dateFormatted: '5 Haziran 2026',
    dateFormattedEn: 'June 5, 2026',
    image: 'https://images.unsplash.com/photo-1495657809423-db624a2298dc?q=80&w=1189&auto=format&fit=crop',
    alt: 'Tekne Nasıl Satılır — Adım Adım Rehber',
    content: `
      <p>Teknenizi satmaya karar verdiniz ama nereden başlayacağınızı bilmiyor musunuz? Bu kapsamlı rehberimizde, tekne satış sürecinin tüm aşamalarını adım adım ele alıyoruz.</p>
      <h2>1. Doğru Fiyatlandırma</h2>
      <p>Teknenizin piyasa değerini belirlemek, satış sürecinin en kritik adımıdır. Benzer marka, model ve yıldaki teknelerin fiyatlarını araştırın. satiliktekne.com üzerinden güncel piyasa fiyatlarını kolayca karşılaştırabilirsiniz. Teknenizin durumu, bakım geçmişi, ekipmanları ve konumu fiyatı doğrudan etkiler.</p>
      <h2>2. Profesyonel Fotoğraf Çekimi</h2>
      <p>İlanınızın en önemli unsuru fotoğraflardır. Güneşli bir günde, teknenizi temizledikten sonra çekim yapın. Dış görünüm, kokpit, kabin, motor bölmesi ve detay karelerini mutlaka ekleyin. En az 8-10 fotoğraf yükleyin. Geniş açılı çekimler teknenin büyüklüğünü daha iyi gösterir.</p>
      <h2>3. Etkili İlan Yazımı</h2>
      <p>Başlıkta marka, model ve öne çıkan bir özellik belirtin. Açıklamada teknik özellikleri, bakım geçmişini, yapılan yenilemeleri ve ekipman listesini detaylı yazın. Dürüst olun — gizlenen sorunlar güveni sarsar ve satışı zorlaştırır.</p>
      <h2>4. satiliktekne.com'da Ücretsiz İlan Verin</h2>
      <p>satiliktekne.com'da ilan vermek tamamen ücretsizdir. Gelişmiş filtreleme sistemi sayesinde ilanınız doğru alıcılara ulaşır. 7 adımlı kolay ilan formumuzu kullanarak dakikalar içinde profesyonel bir ilan oluşturabilirsiniz.</p>
      <h2>5. Alıcı İletişimi ve Müzakere</h2>
      <p>Gelen sorulara hızlı ve detaylı cevap verin. Tekne gösterimi öncesi tekneyi temiz ve düzenli tutun. Fiyat müzakeresinde alt sınırınızı önceden belirleyin. Deneme sürüşü talep eden ciddi alıcılara öncelik verin.</p>
    `,
    content_en: `
      <p>Have you decided to sell your boat but do not know where to start? In this comprehensive guide, we cover all stages of the boat sales process step by step.</p>
      <h2>1. Accurate Pricing</h2>
      <p>Determining the market value of your boat is the most critical step in the sales process. Research the prices of boats of similar make, model, and year. You can easily compare current market prices on satiliktekne.com. The condition, maintenance history, equipment, and location of your boat directly affect the price.</p>
      <h2>2. Professional Photography</h2>
      <p>The most important element of your listing is the photos. Shoot on a sunny day after cleaning your boat. Be sure to include exterior, cockpit, cabin, engine compartment, and detail shots. Upload at least 8-10 photos. Wide-angle shots show the size of the boat better.</p>
      <h2>3. Effective Listing Description</h2>
      <p>Specify the brand, model, and a prominent feature in the title. Write technical specifications, maintenance history, upgrades, and equipment list in detail in the description. Be honest — hidden issues break trust and make selling difficult.</p>
      <h2>4. Post a Free Listing on satiliktekne.com</h2>
      <p>Listing on satiliktekne.com is completely free. Thanks to the advanced filtering system, your listing reaches the right buyers. You can create a professional listing in minutes using our easy 7-step form.</p>
      <h2>5. Buyer Communication and Negotiation</h2>
      <p>Give quick and detailed answers to incoming questions. Keep the boat clean and tidy before showings. Determine your lower limit in price negotiation beforehand. Give priority to serious buyers requesting a sea trial.</p>
    `
  },
  '2': {
    id: '2',
    title: 'satiliktekne.com Nedir? Türkiye\'nin En Kolay Tekne İlan Platformu',
    title_en: 'What is satiliktekne.com? Turkeys Easiest Boat Listing Platform',
    tag: 'Platform',
    date: '2026-06-03',
    dateFormatted: '3 Haziran 2026',
    dateFormattedEn: 'June 3, 2026',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1189&auto=format&fit=crop',
    alt: 'satiliktekne.com Nedir — Türkiye\'nin Denizci Platformu',
    content: `
      <p>satiliktekne.com, Türkiye'nin denizcilik sektörüne özel olarak tasarlanmış, modern ve kullanıcı dostu tekne alım-satım ve kiralama platformudur.</p>
      <h2>Neden satiliktekne.com?</h2>
      <p>Geleneksel ilan sitelerinden farklı olarak, satiliktekne.com tamamen deniz araçlarına odaklanmıştır. Motoryat, yelkenli, katamaran, sürat teknesi, bot, jet ski ve güverte teknesi — her türlü deniz aracı için özelleştirilmiş filtreleme ve arama sistemi sunar.</p>
      <h2>Ücretsiz İlan Verme</h2>
      <p>Platformumuzda ilan vermek tamamen ücretsizdir. 7 adımlık basit formumuzla dakikalar içinde profesyonel bir ilan oluşturabilirsiniz. Fotoğraf yükleme, detaylı teknik özellik girişi ve konum bilgisi ekleme — hepsi tek bir akışta.</p>
      <h2>Gelişmiş Filtreleme</h2>
      <p>Sahibinden ilham alan 13 farklı filtre ile aradığınız tekneyi anında bulun: kategori, marka, il, fiyat aralığı, para birimi, kimden, durum, takas durumu, model yılı, boy ve daha fazlası.</p>
      <h2>Airbnb Tarzı Görsel Deneyim</h2>
      <p>Her ilan, yatay kaydırmalı galeri, detaylı teknik spesifikasyon kartları ve kolay iletişim butonları ile zenginleştirilmiştir. Kiralık tekneler için tarih seçerek anlık fiyat hesaplaması yapabilirsiniz.</p>
      <h2>Güvenli ve Hızlı</h2>
      <p>Kullanıcı hesabı sistemi ile güvenli iletişim sağlanır. Supabase altyapısı ile verileriniz güvende, site ise ışık hızında çalışır.</p>
    `
  }
};
