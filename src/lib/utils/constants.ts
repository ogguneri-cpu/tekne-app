import { Listing } from '@/components/listings/ListingCard';

export const DEMO_DATA: Listing[] = [
  {
    id: '1',
    user_id: 'cmx-user',
    status: 'approved',
    title: 'GRAND SOLEIL 40 | 12 METRE YELKENLİ',
    title_en: 'GRAND SOLEIL 40 | 12 METER SAILBOAT',
    slug: 'grand-soleil-40-12-metre-yelkenli',
    description: 'Grand Soleil 40, İtalyan el işçiliğinin ve yarış performansının mükemmel birleşimi olan 12 metrelik bir yelkenli yattır. 2003 model, fiberglas gövdeli bu tekne 40 HP dizel motor ile donatılmıştır. 3 kamaralı geniş iç hacmi ile uzun seyirler için idealdir. Motor çalışma saati 2.587, İngiltere bandıralı, şu an çekekte bakımda olup denize hazır hale getirilmektedir. Tam yelken donanımı, bakımlı güverte ekipmanları ve konforlu yaşam alanları ile mavi yolculuk ve hafta sonu kaçamakları için biçilmiş kaftandır.',
    description_en: 'Grand Soleil 40 is a 12-meter sailing yacht that represents the perfect combination of Italian craftsmanship and racing performance. This 2003 model with fiberglass hull is equipped with a 40 HP diesel engine. With its large 3-cabin interior volume, it is ideal for long cruises. Engine hours 2,587, UK flagged, currently under maintenance on dry dock, preparing to be ready for the sea. With full sailing equipment, well-maintained deck gear and comfortable living spaces, it is cut out for blue voyages and weekend getaways.',
    category: 'yelkenli',
    brand: 'Grand Soleil',
    model: '40',
    type: 'sale',
    sale_price: 5000000,
    currency: 'TRY',
    location_il: 'İstanbul',
    location_ilce: 'Tuzla',
    year: 2003,
    length_meters: 12.1,
    condition: 'ikinci_el',
    is_swap: true,
    images: [
      '/assets/listings/grand-soleil-40/gs40-01.jpg',
      '/assets/listings/grand-soleil-40/gs40-02.jpg',
      '/assets/listings/grand-soleil-40/gs40-03.jpg',
      '/assets/listings/grand-soleil-40/gs40-04.jpg',
      '/assets/listings/grand-soleil-40/gs40-05.jpg'
    ]
  },
  {
    id: '2',
    user_id: 'cmx-user',
    status: 'approved',
    title: 'Dufour 325 — BEYLİKDÜZÜ WEST MARİNADA YERİ İLE',
    title_en: 'Dufour 325 — WITH ITS BERTH IN BEYLIKDUZU WEST MARINA',
    slug: 'dufour-325-beylikduzu-west-marinada-yeri-ile',
    description: 'Dufour 325, Fransız mühendisliğinin zarif çizgileri ile konforlu bir cruiser yelkenlidir. 2006 model, 9.9 metre boyunda, fiberglas gövdeli bu tekne Beylikdüzü West Marina\'da marina yeri ile birlikte satılıktadır. 20 HP dizel motor, 1.150 saat çalışma ile bakımlı durumdadır. 2 kamaralı iç mekânı ile hafta sonu kaçamakları ve kısa seyirler için ideal boyuttadır. Marina yeri dahil olması büyük avantaj sağlamaktadır. Polonya bandıralı, denizde yüzer vaziyettedir.',
    description_en: 'Dufour 325 is a comfortable cruiser sailboat with the elegant lines of French engineering. This 2006 model, 9.9 meters long, fiberglass hull boat is for sale together with its berth in Beylikduzu West Marina. The 20 HP diesel engine is in well-maintained condition with 1,150 hours of operation. With its 2-cabin interior, it is the ideal size for weekend getaways and short cruises. Including the marina berth provides a great advantage. Polish flagged, floating in the sea.',
    category: 'yelkenli',
    brand: 'Dufour',
    model: '325',
    type: 'sale',
    sale_price: 3100000,
    currency: 'TRY',
    location_il: 'İstanbul',
    location_ilce: 'Beylikdüzü',
    year: 2006,
    length_meters: 9.9,
    condition: 'ikinci_el',
    is_swap: true,
    images: [
      '/assets/listings/dufour-325/df325-01.jpg',
      '/assets/listings/dufour-325/df325-02.jpg',
      '/assets/listings/dufour-325/df325-03.jpg',
      '/assets/listings/dufour-325/df325-04.jpg',
      '/assets/listings/dufour-325/df325-05.jpg'
    ]
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: '🚢', value: '' },
  { id: 'motoryat', label: 'Motoryat', icon: '🚤', value: 'motoryat' },
  { id: 'yelkenli', label: 'Yelkenli', icon: '⛵', value: 'yelkenli' },
  { id: 'katamaran', label: 'Katamaran', icon: '🛥️', value: 'katamaran' },
  { id: 'surat_teknesi', label: 'Sürat Teknesi', icon: '💨', value: 'surat_teknesi' },
  { id: 'bot', label: 'Bot', icon: '🚣', value: 'bot' },
  { id: 'jet_ski', label: 'Jet Ski', icon: '🏄', value: 'jet_ski' },
  { id: 'guverte_teknesi', label: 'Güverte Teknesi', icon: '🛳️', value: 'guverte_teknesi' },
  { id: 'gulet', label: 'Gulet', icon: '⚓', value: 'gulet' },
  { id: 'diger', label: 'Diğer', icon: '🛶', value: 'diger' }
];
