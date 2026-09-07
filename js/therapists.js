/**
 * Database & Render Engine Terapis & Sentra Reposisi
 * Dirancang skalabel hingga 50+ terapis di seluruh Indonesia
 */

const THERAPISTS_DATA = [
  {
    id: "andi-bogor",
    brand: "Pusat Kretek Holistic",
    practitioner: "Pak Andi",
    role: "Praktisi Terapi Holistik, Bone Setting & Bio Elektrik",
    motto: "Seduluran, Berkarya, Berbagi — Mengembalikan keselarasan tubuh dan syaraf secara alami.",
    city: "Kab. Bogor",
    district: "Gunung Putri (Bojong Kulur)",
    province: "Jawa Barat",
    regionGroup: "jabodetabek",
    address: "Jalan Puri Delta, RT.2/RW.8, No. 29 Kampung Lembur-BojongKulur (Rumah cat hijau), KAB. BOGOR, GUNUNG PUTRI, JAWA BARAT, ID, 16969",
    landmark: "Rumah Cat Hijau No. 29",
    phone: "081818100534",
    waNumber: "6281818100534",
    priceRange: "Konsultasi & Terapi Ramah Terjangkau",
    badge: "Praktisi Utama",
    avatar: "public/images/owner-andi.png",
    gallery: [
      "public/images/owner-andi.png"
    ],
    mapsUrl: "https://maps.app.goo.gl/LiYd9pJ9hkh8bPaG6",
    services: [
      "Pijat Kretek (Bone Setting)",
      "Akupunktur Medis",
      "Bekam Medis & Sunnah",
      "Bio Elektrik"
    ],
    complaints: [
      "Stroke & Pasca Stroke",
      "Syaraf Kejepit (HNP)",
      "Keluhan Tulang & Postur",
      "Keluhan Otot dan Sendi",
      "Vertigo & Sakit Kepala Berat",
      "GERD & Asam Lambung",
      "Pegal Linu & Kaku Leher"
    ],
    experienceDetails: {
      philosophy: "Memulihkan keseimbangan alami tubuh dan jalur syaraf agar tubuh dapat menyembuhkan dirinya sendiri (Self-Healing Mechanism).",
      specialties: [
        {
          name: "🦴 Reposisi Tulang & Pijat Kretek",
          desc: "Deteksi dan reposisi subluksasi tulang belakang (servikal, torakal, lumbal) dan panggul untuk membebaskan jepitan saraf secara presisi."
        },
        {
          name: "⚡ Bio Elektrik Stimulator",
          desc: "Penyaluran mikro-arus biologis untuk meregenerasi sel saraf motorik yang melemah atau mati rasa pasca stroke."
        },
        {
          name: "🎯 Akupunktur Titik Meridian",
          desc: "Penusukan jarum steril guna menyeimbangkan asam lambung (GERD), melancarkan sirkulasi pembuluh darah otak (vertigo), dan meredakan nyeri."
        },
        {
          name: "🩸 Bekam Medis & Sunnah",
          desc: "Detoksifikasi darah kotor/stagnan dan racun metabolik dengan standar sterilisasi medis ketat."
        }
      ],
      trackRecord: [
        "Membantu pemulihan pasien stroke agar dapat kembali menggerakkan tangan dan kaki.",
        "Mengatasi nyeri syaraf kejepit menahun tanpa perlu tindakan operasi.",
        "Merapikan postur skoliosis dan panggul miring akibat salah postur."
      ]
    }
  },
  {
    id: "urc-ungaran",
    brand: "Ungaran Reposisi Center (URC)",
    practitioner: "Master Terapis URC",
    role: "Spesialis Manipulasi Manual, Reposisi Tulang Sendi & Sport Massage",
    motto: "Manipulasi Manual Reposisi Tulang Sendi untuk Pemulihan Ketegangan Otot, Pergeseran Ruas Tulang & Penekanan Syaraf.",
    city: "Kab. Semarang",
    district: "Ungaran Timur (Beji)",
    province: "Jawa Tengah",
    regionGroup: "jateng",
    address: "Serasi VIII/D 89, Pondok Babadan Baru, Beji, Ungaran Timur, Kab. Semarang, Jawa Tengah",
    landmark: "Pondok Babadan Baru Blok D 89",
    phone: "0821-3892-1941",
    waNumber: "6282138921941",
    priceRange: "Rp 150.000 - Rp 250.000",
    badge: "Sentra Terapi Ungaran",
    avatar: "public/images/urc-terapi-1.jpg",
    gallery: [
      "public/images/urc-terapi-1.jpg",
      "public/images/urc-terapi-2.jpg",
      "public/images/urc-terapi-3.jpg",
      "public/images/urc-terapi-4.png"
    ],
    mapsUrl: "https://maps.app.goo.gl/UqWcTa5V3NcM3pCq6",
    services: [
      "Reposisi Tulang & Sendi",
      "Bekam Medis",
      "Akupunktur Medis",
      "Sport Massage",
      "Akupunktur Estetika"
    ],
    complaints: [
      "Syaraf Kejepit (HNP)",
      "Kekakuan Otot Berat",
      "Keterbatasan Rentang Gerak",
      "Masalah Sendi & Pengapuran",
      "Cedera Olahraga (Sports Injury)",
      "Kelelahan Fisik Kronis"
    ],
    experienceDetails: {
      philosophy: "Menggabungkan manipulasi biomekanika sendi modern dengan terapi manual holistik dan sport massage untuk pemulihan mobilitas optimal.",
      specialties: [
        {
          name: "🦴 Reposisi Tulang & Sendi (Joint & Spine Realignment)",
          desc: "Teknik manipulasi manual presisi untuk mengoreksi pergeseran ruas tulang belakang dan persendian tubuh yang memicu penekanan syaraf."
        },
        {
          name: "🏃 Sport Massage & Pelepasan Otot Kaku",
          desc: "Teknik pemijatan khusus jaringan dalam (deep tissue) untuk atlet maupun masyarakat umum guna mengurai perlengketan fasia dan kekakuan otot ekstrem."
        },
        {
          name: "✨ Akupunktur Estetika & Kesehatan",
          desc: "Stimulasi titik jarum halus untuk mengencangkan otot wajah, melancarkan regenerasi kolagen, dan menyelaraskan kesehatan holistik tubuh."
        },
        {
          name: "🩸 Bekam & Akupunktur Medis",
          desc: "Terapi pembersihan darah toksik dan stimulasi meridian saraf untuk meredakan inflamasi serta melancarkan sirkulasi darah."
        }
      ],
      trackRecord: [
        "Menangani ratusan kasus kekakuan otot dan keterbatasan gerak pada atlet dan pekerja kantoran.",
        "Berpengalaman dalam mengoreksi dislokasi sendi bahu, lutut, panggul, dan ruas tulang pinggang.",
        "Telah tersertifikasi dalam perkumpulan asosiasi terapis manual dan reposisi tulang sendi."
      ]
    }
  }
];

// Helper to get all cities
function getAvailableCities() {
  const cities = new Set();
  THERAPISTS_DATA.forEach(t => cities.add(t.city));
  return Array.from(cities);
}

// Global active therapist for modal
window.activeTherapist = THERAPISTS_DATA[0];
