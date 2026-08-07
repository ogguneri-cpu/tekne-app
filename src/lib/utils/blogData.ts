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
    image: '/assets/blog-1.jpg',
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
    image: '/assets/blog-satiliktekne-nedir.jpg',
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
    `,
    content_en: `
      <p>satiliktekne.com is Turkey's modern and user-friendly boat buying-selling and renting platform, designed specifically for the marine sector.</p>
      <h2>Why satiliktekne.com?</h2>
      <p>Unlike traditional listing sites, satiliktekne.com is fully focused on marine vehicles. It offers a customized search and filtering system for motor yachts, sailboats, catamarans, speedboats, ribs, jet skis, and deck boats.</p>
      <h2>Post Free Listings</h2>
      <p>Posting listings on our platform is completely free. With our simple 7-step form, you can create a professional listing in minutes.</p>
    `
  },
  '3': {
    id: '3',
    title: 'İkinci El Tekne Fiyatları 2026: Güncel Piyasa Analizi ve Fiyat Listesi',
    title_en: 'Second Hand Boat Prices 2026: Current Market Analysis and Price List',
    tag: 'Fiyat Rehberi',
    date: '2026-06-01',
    dateFormatted: '1 Haziran 2026',
    dateFormattedEn: 'June 1, 2026',
    image: '/assets/blog-3.jpg',
    alt: 'İkinci El Tekne Fiyatları 2026 Güncel Liste',
    content: `
      <p>2026 yılında Türkiye'de ikinci el tekne piyasası hareketli bir dönemden geçiyor. İşte segmentlere göre güncel fiyat aralıkları ve piyasa trendleri.</p>
      <h2>Motoryat Fiyatları (30-55 fit)</h2>
      <p>2020-2024 model yılı aralığında ikinci el motoryatlar 8.000.000 TL ile 45.000.000 TL arasında fiyatlanıyor. Azimut, Sunseeker, Princess ve Ferretti gibi premium markalar değer kaybına en dirençli modeller olarak öne çıkıyor. EUR bazlı ilanlar genellikle 200.000-1.500.000 EUR aralığında.</p>
      <h2>Yelkenli Fiyatları (35-50 fit)</h2>
      <p>Beneteau Oceanis, Bavaria ve Jeanneau Sun Odyssey serisi yelkenliler 6.000.000-18.000.000 TL aralığında. Yarış donanımlı modeller standart versiyonlara göre %15-25 daha yüksek fiyatlanıyor.</p>
      <h2>Katamaran Fiyatları</h2>
      <p>Lagoon ve Fountaine Pajot başta olmak üzere katamaran segmenti 2026'da en çok değer kazanan segment. 2022-2024 model katamaranlar 600.000-1.200.000 EUR aralığında işlem görüyor.</p>
      <h2>Sürat Teknesi ve Bot Fiyatları</h2>
      <p>8-10 metre aralığındaki sürat tekneleri 2.000.000-10.000.000 TL, balıkçı botları ise 500.000-5.000.000 TL aralığında. Dıştan takma motorlu modeller bakım maliyeti avantajı ile tercih ediliyor.</p>
    `,
    content_en: `
      <p>The second-hand boat market in Turkey in 2026 is going through a dynamic phase. Here are the current price ranges and trends by segment.</p>
      <h2>Motor Yacht Prices (30-55 ft)</h2>
      <p>Second-hand motor yachts in the 2020-2024 model range are priced between 8M TRY and 45M TRY. Premium brands like Azimut, Sunseeker, Princess, and Ferretti stand out as most resilient.</p>
    `
  },
  '4': {
    id: '4',
    title: 'Azimut Grande 36M Tanıtıldı: Karbon Fiber Gövde ve Hibrit Motor Sistemi',
    title_en: 'Azimut Grande 36M Introduced: Carbon Fiber Hull and Hybrid Engine System',
    tag: 'Yeni Model',
    date: '2026-05-28',
    dateFormatted: '28 Mayıs 2026',
    dateFormattedEn: 'May 28, 2026',
    image: '/assets/blog-4.jpg',
    alt: 'Azimut Yeni Grande 36M Tanıtıldı',
    content: `
      <p>İtalyan lüks yat üreticisi Azimut, Cannes Yachting Festival 2026'da yeni amiral gemisi Grande 36M'i dünya ile tanıştırdı. İşte bu muhteşem yatın detayları.</p>
      <h2>Karbon Fiber Üst Yapı</h2>
      <p>Grande 36M, Azimut'un ilk tam karbon fiber üst yapıya sahip modeli. Bu teknoloji sayesinde yatın toplam ağırlığı %18 azaltılırken, yapısal dayanıklılık artırıldı. Sonuç: daha az yakıt tüketimi ve daha yüksek sürat.</p>
      <h2>Volvo Penta Hibrit Propülsiyon</h2>
      <p>IPS 1350 hibrit sistem, tam elektrikli modda 8 knot hızla 3 saate kadar seyir imkânı sunuyor. Limanlarda ve koylarda sıfır emisyon, açık denizde ise 2.400 HP toplam güç ile 24 knot maksimum hız.</p>
      <h2>İç Mekân Tasarımı</h2>
      <p>Achille Salvagni imzalı iç tasarım, İtalyan el sanatları ile modern minimalizmi buluşturuyor. 4 misafir kabini, ayrı mürettebat bölümü, flybridge'de jakuzi ve alfresco yemek alanı standart donanım.</p>
    `,
    content_en: `
      <p>Italian luxury yacht builder Azimut introduced its new flagship Grande 36M at the Cannes Yachting Festival 2026. Here are the details of this magnificent yacht.</p>
    `
  },
  '5': {
    id: '5',
    title: 'Elektrikli Tekne Devrimi: 2026\'da Denizlerde Sessiz Motorlar Dönemi Başlıyor',
    title_en: 'Electric Boat Revolution: The Era of Silent Engines Begins in 2026',
    tag: 'Teknoloji',
    date: '2026-05-22',
    dateFormatted: '22 Mayıs 2026',
    dateFormattedEn: 'May 22, 2026',
    image: '/assets/blog-5.jpg',
    alt: 'Elektrikli Tekne Teknolojisi 2026 Gelişmeleri',
    content: `
      <p>Otomotiv sektöründeki elektrikli araç devrimi artık denizlere taşınıyor. 2026 yılı, elektrikli teknelerin ana akım haline gelmeye başladığı bir dönüm noktası.</p>
      <h2>Foil Teknolojisi: Su Üstünde Uçmak</h2>
      <p>İsveçli Candela'nın C-8 modeli, hidrofoil teknolojisi ile su yüzeyinin 50 cm üzerinde seyrediyor. Bu sayede dalga direnci %80 azalıyor, enerji verimliliği dramatik şekilde artıyor. Tek şarjla 2 saat, 25 knot hızda seyir mümkün.</p>
      <h2>Katı Hal Bataryaları</h2>
      <p>Toyota Marine ve CATL'nin geliştirdiği denizcilik sınıfı katı hal bataryalar, lityum-iyon teknolojisine göre %40 daha fazla enerji yoğunluğu sunuyor. Yangın riski neredeyse sıfır, ömür ise 5.000+ şarj döngüsü.</p>
    `,
    content_en: `
      <p>The electric vehicle revolution in the automotive industry is now moving to the seas. 2026 is a turning point where electric boats start going mainstream.</p>
    `
  },
  '6': {
    id: '6',
    title: 'SailGP Canlı İzle: 2026 Takvimi ve Canada Sail Grand Prix Rehberi',
    title_en: 'Watch SailGP Live: 2026 Calendar and Canada Sail Grand Prix Guide',
    tag: 'Yelken Yarışı',
    date: '2026-06-08',
    dateFormatted: '8 Haziran 2026',
    dateFormattedEn: 'June 8, 2026',
    image: '/assets/blog-6.jpg',
    alt: 'SailGP Canlı İzle — 2026 Takvimi ve Canada Sail Grand Prix Rehberi',
    content: `
      <p>Dünyanın en hızlı ve en heyecan verici yelken yarışı serisi olan SailGP, 20-21 Haziran 2026 tarihlerinde Kanada'nın Halifax limanında nefes kesen bir etapla kaldığı yerden devam ediyor.</p>
      <h2>Canada Sail Grand Prix Türkiye'den Nasıl İzlenir?</h2>
      <p><strong>Ücretsiz YouTube ve Facebook Canlı Yayınları:</strong> Türkiye'de herhangi bir coğrafi kısıtlama (geo-block) bulunmadığı için Halifax etabını resmi SailGP kanallarından canlı izleyebilirsiniz.</p>
    `,
    content_en: `
      <p>The world's fastest and most exciting sailing series, SailGP, continues with its thrilling Canada Sail Grand Prix on June 20-21, 2026.</p>
    `
  }
};

