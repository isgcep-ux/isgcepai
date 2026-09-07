import { RegulationItem } from '../types';

export const REGULATIONS_DATA: RegulationItem[] = [
  {
    id: 'reg-6331',
    title: '6331 Sayılı İş Sağlığı ve Güvenliği Kanunu',
    shortCode: '6331 İSGK',
    category: 'Temel Kanun',
    officialDate: '30.06.2012 / R.G. 28339',
    summary: 'Kamu ve özel sektör ayrımı gözetmeksizin tüm çalışanları ve çırakları kapsayan, proaktif risk değerlendirmesi yaklaşımını getiren Türkiye\'nin ana İSG yasasıdır.',
    keyArticles: [
      {
        articleNo: 'Madde 4',
        title: 'İşverenin Genel Yükümlülüğü',
        content: 'İşveren, çalışanların işle ilgili sağlık ve güvenliğini sağlamakla yükümlüdür. Mesleki risklerin önlenmesi, eğitim ve bilgi verilmesi, risk değerlendirmesi yapılması ve her türlü tedbirin alınması esastır.',
      },
      {
        articleNo: 'Madde 10',
        title: 'Risk Değerlendirmesi, Kontrol, Ölçüm ve Araştırma',
        content: 'İşveren, iş sağlığı ve güvenliği yönünden çalışma ortamına ve çalışanların maruz kaldığı risklerin belirlenmesine yönelik gerekli kontrol, ölçüm, inceleme ve araştırmaları yaptırır.',
      },
      {
        articleNo: 'Madde 13',
        title: 'Çalışmaktan Kaçınma Hakkı',
        content: 'Ciddi ve yakın tehlike ile karşı karşıya kalan çalışanlar kurula, kurulun bulunmadığı işyerlerinde ise işverene başvurarak durumun tespit edilmesini ve gerekli tedbirlerin alınmasını talep edebilir. Tedbir alınıncaya kadar çalışmaktan kaçınabilirler.',
      },
      {
        articleNo: 'Madde 14',
        title: 'İş Kazası ve Meslek Hastalıklarının Bildirimi',
        content: 'İşveren, bütün iş kazalarının ve meslek hastalıklarının kaydını tutar, gerekli incelemeleri yapar. Kazadan sonraki 3 iş günü içinde SGK\'ya bildirir.',
      },
      {
        articleNo: 'Madde 22',
        title: 'İş Sağlığı ve Güvenliği Kurulu',
        content: '50 ve daha fazla çalışanın bulunduğu ve 6 aydan fazla süren sürekli işlerin yapıldığı işyerlerinde işveren, iş sağlığı ve güvenliği ile ilgili çalışmalarda bulunmak üzere kurul oluşturur.',
      },
    ],
    penaltyInfo: 'Risk değerlendirmesi yaptırmama: 2025 yılı ceza tutarı tehlike sınıfı ve çalışan sayısına göre 40.000 TL - 120.000 TL arası. Takip eden her ay için devam eden ceza uygulanır.',
  },
  {
    id: 'reg-4857',
    title: '4857 Sayılı İş Kanunu',
    shortCode: '4857 İK',
    category: 'İş Hukuku',
    officialDate: '10.06.2003 / R.G. 25134',
    summary: 'İşçi ve işveren arasındaki çalışma ilişkilerini, haftalık çalışma sürelerini, fazla çalışma, yıllık ücretli izinler ve fesih haklarını düzenler.',
    keyArticles: [
      {
        articleNo: 'Madde 63',
        title: 'Çalışma Süresi',
        content: 'Genel bakımdan çalışma süresi haftada en çok kırkbeş saattir. Aksi kararlaştırılmamışsa bu süre, işyerlerinde haftanın çalışılan günlerine eşit ölçüde bölünerek uygulanır.',
      },
      {
        articleNo: 'Madde 68',
        title: 'Ara Dinlenmesi',
        content: '4 saat veya daha kısa süreli işlerde 15 dakika, 4 saatten fazla ve 7.5 saate kadar olan işlerde yarım saat, 7.5 saatten fazla süren işlerde en az 1 saat ara dinlenmesi verilir. Bu süreler çalışma süresinden sayılmaz.',
      },
      {
        articleNo: 'Madde 69',
        title: 'Gece Çalışması',
        content: 'Çalışma hayatında gece en geç saat 20.00\'de başlayarak en erken 06.00\'ya kadar geçen ve en fazla 11 saat süren dönemdir. Çalışanların gece çalışmaları 7.5 saati geçemez (Turizm, özel güvenlik, sağlık ve sanayiden sayılmayan işler hariç).',
      },
    ],
    penaltyInfo: 'Fazla çalışma ve ara dinlenmesi kurallarına uymama cezası her çalışan için ayrı idari para cezası gerektirir.',
  },
  {
    id: 'reg-risk',
    title: 'İş Sağlığı ve Güvenliği Risk Değerlendirmesi Yönetmeliği',
    shortCode: 'Risk Değ. Yön.',
    category: 'Yönetmelik',
    officialDate: '29.12.2012 / R.G. 28512',
    summary: 'İşyerlerinde var olan ya da dışarıdan gelebilecek tehlikelerin belirlenmesi, risklerin derecelendirilmesi ve kontrol tedbirlerinin belirlenmesi adımlarını şart koşar.',
    keyArticles: [
      {
        articleNo: 'Madde 6',
        title: 'Risk Değerlendirmesi Ekibi',
        content: 'Ekipte; işveren veya vekili, İGU ve işyeri hekimi, çalışan temsilcileri, destek elemanları ve işyerindeki bütün birimleri temsil eden çalışanlar yer alır.',
      },
      {
        articleNo: 'Madde 7',
        title: 'Risk Kontrol Adımları',
        content: '1. Planlama, 2. Risk kontrol tedbirlerinin kararlaştırılması (Yok etme, İkame, Toplu Korunma, Kişisel Korunma), 3. Tedbirlerin uygulanması, 4. Uygulamaların izlenmesi.',
      },
    ],
    penaltyInfo: 'Risk değerlendirmesi ekibi oluşturulmaması ve geçerli bir risk analizi bulunmaması iş durdurma sebebi dahi olabilir.',
  },
  {
    id: 'reg-ekipman',
    title: 'İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği',
    shortCode: 'İş Ekipmanı Yön.',
    category: 'Teknik Yönetmelik',
    officialDate: '25.04.2013 / R.G. 28628',
    summary: 'İşyerinde kullanılan her türlü makine, alet, tesis ve tesisatın asgari güvenlik şartlarını, periyodik kontrol sürelerini ve EKİPNET kayıt zorunluluğunu düzenler.',
    keyArticles: [
      {
        articleNo: 'EK-III',
        title: 'Bakım, Onarım ve Periyodik Kontroller',
        content: 'Basınçlı kaplar ve kaldırma araçları yılda en az 1 kez, yapı iskeleleri 6 ayda 1 kez, elektrik tesisatı, topraklama ve yangın tesisatı yılda en az 1 kez akredite uzmanlarca kontrol edilir.',
      },
    ],
    penaltyInfo: 'Periyodik kontrolü yapılmamış iş ekipmanının kullanımında meydana gelen kazalarda ağır cezai ve hukuki sorumluluk doğar.',
  },
  {
    id: 'reg-kkd',
    title: 'Kişisel Koruyucu Donanımların İşyerlerinde Kullanılması Hakkında Yönetmelik',
    shortCode: 'KKD Yönetmeliği',
    category: 'Korunma Standartları',
    officialDate: '02.07.2013 / R.G. 28695',
    summary: 'Toplu korunma önlemlerinin yetersiz kaldığı durumlarda CE işaretli KKD temini, ücretsiz dağıtımı, kullanımı ve çalışanların eğitimi kurallarını içerir.',
    keyArticles: [
      {
        articleNo: 'Madde 5',
        title: 'Genel Kural',
        content: 'Toplu korunma önlemleri, kişisel korunma önlemlerine her zaman önceliklidir. KKD ancak teknik tedbirlerin yetersiz kaldığı hallerde son savunma hattı olarak kullanılır.',
      },
    ],
  },
];
