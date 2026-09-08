/**
 * Database Terapis & Sentra Reposisi Nusantara
 * Model data skalabel untuk 50+ praktisi di berbagai kota.
 */

const THERAPISTS_DATA = [
  {
    id: "urc-ungaran",
    brand: "Ungaran Reposisi Center",
    shortCode: "URC",
    practitioner: "Master Terapis URC",
    association: "SATRIA • Komunitas Seduluran Terapis Recovery Indonesia & Asosiasi Reposisi Tulang Sendi (UAR)",
    city: "Ungaran / Kab. Semarang",
    district: "Ungaran Timur (Beji)",
    province: "Jawa Tengah",
    regionKey: "semarang",
    categoryTags: ["kretek", "sport-massage", "akupunktur", "bekam"],
    avatar: "public/images/urc-terapi-1.jpg",
    actionPhotos: [
      {
        url: "public/images/urc-terapi-1.jpg",
        caption: "Manipulasi Sendi Kaki & Panggul (Koreksi Dislokasi & Pelvic Alignment)"
      },
      {
        url: "public/images/urc-terapi-3.jpg",
        caption: "Penyelarasan Ruas Tulang Belakang (Lumbal Adjustment untuk Syaraf Kejepit)"
      },
      {
        url: "public/images/urc-terapi-4.png",
        caption: "Smart Massage & Pemulihan Ketegangan Otot Torakal (UAR Reposisi)"
      },
      {
        url: "public/images/urc-terapi-2.jpg",
        caption: "Pemeriksaan Biomekanika Tubuh & Evaluasi Rentang Gerak"
      }
    ],
    priceRange: "Rp 150.000 – Rp 250.000",
    priceNote: "Sesuai kombinasi tindakan (Reposisi + Massage / Akupunktur / Bekam)",
    address: "Serasi VIII/D 89, Pondok Babadan Baru, Beji, Ungaran Timur, Kab. Semarang, Jawa Tengah",
    landmark: "Pondok Babadan Baru Blok D No. 89",
    phone: "0821-3892-1941",
    waNumber: "6282138921941",
    mapsUrl: "https://maps.app.goo.gl/UqWcTa5V3NcM3pCq6",
    motto: "Manipulasi Manual Reposisi Tulang Sendi untuk Pemulihan Ketegangan Otot, Pergeseran Ruas Tulang & Penekanan Syaraf.",
    overview: "Ungaran Reposisi Center (URC) adalah sentra rujukan terapi manual biomekanika sendi dan pemulihan muskuloskeletal terstandarisasi di kawasan Ungaran dan Semarang. Menggabungkan teknik reposisi sendi presisi, sport massage intensif untuk atlet dan masyarakat, akupunktur medis & estetika, serta bekam higienis.",
    primarySpecialties: [
      "Reposisi Tulang & Sendi",
      "Sport Massage (Deep Tissue)",
      "Akupunktur Medis & Estetika",
      "Bekam Medis"
    ],
    servicesDetailed: [
      {
        title: "🦴 Reposisi Tulang & Sendi (Spine & Joint Realignment)",
        desc: "Koreksi dislokasi mikro pada sendi bahu, panggul, lutut, dan ruas tulang belakang yang menyebabkan penekanan syaraf."
      },
      {
        title: "🏃 Sport Massage & Smart Massage",
        desc: "Pelepasan ketegangan otot dalam (deep tissue release) untuk mengatasi spasme, perlengketan fasia, dan cedera otot akibat aktivitas berat atau olahraga."
      },
      {
        title: "✨ Akupunktur Estetika Wajah & Tubuh",
        desc: "Stimulasi titik meridian untuk meremajakan sel kulit, melancarkan aliran energi, dan mengencangkan otot wajah secara alami."
      },
      {
        title: "🎯 Akupunktur Medis",
        desc: "Penanganan gangguan saraf, sakit kepala menahun, peredaran darah tersumbat, dan nyeri sendi menggunakan jarum steril sekali pakai."
      },
      {
        title: "🩸 Bekam Medis Steril",
        desc: "Pengangkatan darah kotor, asam urat, dan toksin metabolisme tubuh dengan peralatan higienis sekali pakai."
      }
    ],
    complaintsDetailed: [
      "Syaraf Kejepit (HNP Pinggang & Leher)",
      "Kekakuan Otot Berat & Spasme Punggung",
      "Keterbatasan Rentang Gerak Sendi",
      "Masalah Sendi Bahu (Frozen Shoulder), Lutut & Engkel",
      "Cedera Olahraga & Pemulihan Fisik Pasca Cedera",
      "Pergeseran Panggul & Ruas Tulang Belakang"
    ],
    operatingHours: "Senin – Minggu (08.00 – 20.00 WIB) • Dengan Reservasi Terlebih Dahulu"
  },
  {
    id: "andi-bogor",
    brand: "Pusat Kretek Holistic",
    shortCode: "PKH",
    practitioner: "Pak Andi",
    association: "SATRIA (Seduluran, Berkarya, Berbagi) & Praktisi Terapi Holistik Terpadu",
    city: "Bojong Kulur / Kab. Bogor",
    district: "Gunung Putri (Bojong Kulur)",
    province: "Jawa Barat",
    regionKey: "bogor",
    categoryTags: ["kretek", "bio-elektrik", "akupunktur", "bekam"],
    avatar: "public/images/owner-andi.png",
    actionPhotos: [
      {
        url: "public/images/owner-andi.png",
        caption: "Pak Andi - Praktisi Utama Pusat Kretek Holistic Bojong Kulur"
      }
    ],
    priceRange: "Ramah & Terjangkau",
    priceNote: "Konsultasi awal & tindakan disesuaikan kondisi pasien",
    address: "Jalan Puri Delta, RT.2/RW.8, No. 29 Kampung Lembur-BojongKulur (Rumah cat hijau), KAB. BOGOR, GUNUNG PUTRI, JAWA BARAT, ID, 16969",
    landmark: "Rumah Cat Hijau No. 29 di Kampung Lembur - Bojong Kulur",
    phone: "0818-1810-0534",
    waNumber: "6281818100534",
    mapsUrl: "https://maps.app.goo.gl/LiYd9pJ9hkh8bPaG6",
    motto: "Seduluran, Berkarya, Berbagi — Memulihkan keselarasan sistem syaraf, otot, dan struktur tulang dengan niat tulus membantu sesama.",
    overview: "Pusat Kretek Holistic dikelola langsung oleh Pak Andi dengan jam terbang tinggi menangani ratusan pasien muskuloskeletal. Mengutamakan pendekatan holistik 4-in-1 yang menyasar akar masalah, bukan sekadar menghilangkan rasa sakit sementara.",
    primarySpecialties: [
      "Pijat Kretek (Bone Setting)",
      "Bio Elektrik Stimulator",
      "Akupunktur Medis",
      "Bekam Medis & Sunnah"
    ],
    servicesDetailed: [
      {
        title: "🦴 Pijat Kretek (Holistic Bone Setting)",
        desc: "Teknik reposisi struktur tulang belakang dan sendi panggul secara presisi untuk membebaskan jepitan saraf tanpa rasa sakit berlebih."
      },
      {
        title: "⚡ Bio Elektrik Stimulator Saraf",
        desc: "Penyaluran arus mikro biologis untuk mereaktivasi saraf motorik dan sensorik yang melemah atau lumpuh pasca stroke."
      },
      {
        title: "🎯 Akupunktur Medis Meridian",
        desc: "Penyeimbangan fungsi organ tubuh, mengatasi asam lambung (GERD), melancarkan sirkulasi pembuluh darah otak (vertigo/migrain)."
      },
      {
        title: "🩸 Bekam Medis & Sunnah",
        desc: "Detoksifikasi darah kotor, asam urat, dan penumpukan racun metabolik dengan standar higienis steril sekali pakai."
      }
    ],
    complaintsDetailed: [
      "Pemulihan Pasca Stroke (Anggota Gerak Kaku/Lemas)",
      "Syaraf Kejepit (HNP Servikal & Lumbal)",
      "Keluhan Tulang & Postur Miring (Skoliosis/Panggul)",
      "Keluhan Otot dan Sendi Kaku",
      "Vertigo, Migrain & Sakit Kepala Berat",
      "GERD & Asam Lambung Menahun"
    ],
    operatingHours: "Buka Setiap Hari (Sesuai Reservasi Janji Temu WhatsApp)"
  }
];

// Helper functions for dynamic UI
function getAllTherapists() {
  return THERAPISTS_DATA;
}

function getTherapistById(id) {
  return THERAPISTS_DATA.find(t => t.id === id) || THERAPISTS_DATA[0];
}
