import { FieldChecklist } from '../types';

export const FIELD_CHECKLISTS_DATA: FieldChecklist[] = [
  {
    id: 'chk-iskele',
    title: 'Ön Yapımlı Cephe İskelesi Güvenlik Kontrol Listesi',
    category: 'Yapı & Yüksekte Çalışma',
    description: 'TS EN 12810 ve Yapı İşlerinde İSG Yönetmeliği uyarınca cephe iskelelerinin saha denetim formu.',
    items: [
      {
        id: 'isk-1',
        text: 'İskele taban plakaları ve ahşap kalas altlıkları sağlam zemine tam oturmuş mu?',
        standardRef: 'TS EN 12810-1',
        status: 'unselected',
      },
      {
        id: 'isk-2',
        text: 'İskele her çalışma platformunda ana korkuluk (100 cm), ara korkuluk (45-50 cm) ve tekmelik/topuk levhası (min 15 cm) ile donatılmış mı?',
        standardRef: 'Yapı İşlerinde İSG Yön. EK-4',
        status: 'unselected',
      },
      {
        id: 'isk-3',
        text: 'Platformlar arasında boşluk veya takılma tehlikesi oluşturacak kot farkı var mı?',
        standardRef: 'TS EN 12811-1',
        status: 'unselected',
      },
      {
        id: 'isk-4',
        text: 'İskelenin binaya ankraj (bağlantı) elemanları statik hesaba uygun sıklıkta yapılmış mı?',
        standardRef: 'TS EN 12810',
        status: 'unselected',
      },
      {
        id: 'isk-5',
        text: 'İskele üzerinde Yeşil Güvenlik Etiketi (Kullanıma Uygun) asılı mı ve 6 aylık periyodik kontrolü güncel mi?',
        standardRef: 'İş Ekipmanları Yön.',
        status: 'unselected',
      },
    ],
  },
  {
    id: 'chk-elektrik',
    title: 'Şantiye & İşyeri Elektrik Tesisatı Denetim Formu',
    category: 'Elektrik Güvenliği',
    description: '30 mA kaçak akım röleleri, topraklama, panolar ve kablo hatlarının denetimi.',
    items: [
      {
        id: 'elk-1',
        text: 'Tüm elektrik tali dağıtım panolarında 30 mA insan koruma Kaçak Akım Rölesi (KAR) çalışır durumda mı ve periyodik test ediliyor mu?',
        standardRef: 'Elektrik İç Tesisleri Yön.',
        status: 'unselected',
      },
      {
        id: 'elk-2',
        text: 'Panoların önünde yalıtkan paspas/izole halı ve kilitli kapak mevcut mu?',
        standardRef: 'İSG Tüzüğü Md. 274',
        status: 'unselected',
      },
      {
        id: 'elk-3',
        text: 'Seyyar kablolar zemin seviyesinden askıya alınmış veya ezilmeye karşı koruma muhafazası içine yerleştirilmiş mi?',
        standardRef: 'Yapı İSG Yön.',
        status: 'unselected',
      },
      {
        id: 'elk-4',
        text: 'Yıllık topraklama ölçümü ve paratoner periyodik kontrol raporu mevcut mu?',
        standardRef: 'Elektrik Tesislerinde Topraklamalar Yön.',
        status: 'unselected',
      },
    ],
  },
  {
    id: 'chk-yangin',
    title: 'İşyeri Yangın Güvenliği & Acil Durum Kontrol Listesi',
    category: 'Yangın ve Acil Durum',
    description: 'Yangın söndürme tüpleri, kaçış yolları, acil aydınlatmalar ve yangın dolapları.',
    items: [
      {
        id: 'yng-1',
        text: 'Yangın söndürme cihazlarının (YSC) yıllık periyodik kontrolleri yapılmış ve manometre ibresi yeşil alanda mı?',
        standardRef: 'BYKHY Madde 99',
        status: 'unselected',
      },
      {
        id: 'yng-2',
        text: 'Acil çıkış kapıları ve kaçış koridorları önünde malzeme yığılması engellenmiş, kilitlenmeden dışa doğru açılır vaziyette mi?',
        standardRef: 'BYKHY Madde 25',
        status: 'unselected',
      },
      {
        id: 'yng-3',
        text: 'Elektrik kesintisinde otomatik devreye giren acil yönlendirme ve aydınlatma armatürleri çalışır durumda mı?',
        standardRef: 'BYKHY Madde 72',
        status: 'unselected',
      },
      {
        id: 'yng-4',
        text: 'Yıllık acil durum yangın ve tahliye tatbikatı yapılmış ve raporlanmış mı?',
        standardRef: 'Acil Durumlar Yön. Md. 13',
        status: 'unselected',
      },
    ],
  },
  {
    id: 'chk-kapali-alan',
    title: 'Kapalı ve Kısıtlı Alana Giriş İzin Belgesi & Kontrolü',
    category: 'Özel Riskli İşler',
    description: 'Tank, kuyu, silo, kanalizasyon ve menfez gibi alanlara güvenli giriş prosedürü.',
    items: [
      {
        id: 'kpl-1',
        text: 'Giriş öncesinde kalibre edilmiş gaz ölçüm cihazıyla Oksijen (O2: %19.5-23.5), Patlayıcı Gaz (LEL <%10), CO ve H2S ölçümü yapıldı mı?',
        standardRef: 'OSHA 1910.146 / İSG Standartları',
        status: 'unselected',
      },
      {
        id: 'kpl-2',
        text: 'Çalışma İzni (Permit-to-Work) formu dolduruldu ve sorumlu İGU / Saha Mühendisi tarafından onaylandı mı?',
        standardRef: 'Risk Yönetimi Prosedürü',
        status: 'unselected',
      },
      {
        id: 'kpl-3',
        text: 'Giriş ağzında acil kurtarma için tripod (üçayak), kurtarma vinci ve dışarıda gözlemci nöbetçi bekletiliyor mu?',
        standardRef: 'Kapalı Alan Güvenlik Rehberi',
        status: 'unselected',
      },
      {
        id: 'kpl-4',
        text: 'Cebri havalandırma (blower/fan) çalıştırılarak sürekli temiz hava akışı sağlanıyor mu?',
        standardRef: 'İSG Mevzuatı',
        status: 'unselected',
      },
    ],
  },
];
