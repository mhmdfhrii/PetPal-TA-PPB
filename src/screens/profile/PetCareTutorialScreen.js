import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F8F8F8',
  border: '#EEEEEE',
  gray: '#777777',
  lightGray: '#F3F4F6',
  cardBg: '#FFFFFF',
  text: '#222222',
  youtube: '#FF0000',
  tiktok: '#000000',
  tintRed: '#FFF1F2',
  green: '#10B981',
};

// ========================================
// DATA TUTORIAL CARA MERAWAT HEWAN
// ========================================
const TUTORIAL_DATA = [
  {
    id: 'cat-care',
    category: 'Cat',
    categoryName: 'Kucing',
    categoryIcon: 'cat',
    title: 'Panduan Lengkap Cara Merawat Kucing',
    readTime: '5 menit baca',
    description:
      'Kucing membutuhkan perhatian khusus pada nutrisi protein hewani, kebersihan kotak pasir harian, serta stimulasi mental untuk menjaga kebahagiaan mereka.',
    steps: [
      {
        number: '1',
        title: 'Nutrisi & Air Bersih',
        desc: 'Berikan makanan khusus kucing berkualitas tinggi (dry food / wet food) kaya protein hewani dan taurin. Sediakan air bersih mengalir setiap saat (water fountain sangat dianjurkan). Hindari memberikan susu sapi karena mayoritas kucing intoleran laktosa.',
      },
      {
        number: '2',
        title: 'Kebersihan Litter Box (Kotak Pasir)',
        desc: 'Bersihkan kotoran pada litter box minimal 1-2 kali sehari dan ganti pasir secara menyeluruh setiap 1-2 minggu. Gunakan pasir yang nyaman dan letakkan di tempat yang tenang agar kucing tidak stres.',
      },
      {
        number: '3',
        title: 'Grooming & Sisir Bulu',
        desc: 'Sisir bulu kucing secara rutin (terutama ras berbulu panjang seperti Persian/Anggora) 2-3 kali seminggu untuk mencegah hairball dan bulu menggumpal. Potong ujung kuku setiap 2-3 minggu sekali.',
      },
      {
        number: '4',
        title: 'Vaksinasi & Pemeriksaan Berkala',
        desc: 'Lakukan vaksinasi inti (FVRCP & Rabies) saat berusia 2-3 bulan, dilanjutkan booster tahunan. Berikan obat cacing dan obat kutu tetes secara teratur sesuai anjuran dokter hewan.',
      },
      {
        number: '5',
        title: 'Mainan & Waktu Bermain',
        desc: 'Sediakan scratching post (tiang garukan) agar kucing tidak merusak perabotan. Luangkan waktu 15-20 menit per hari untuk bermain menggunakan teaser wand atau laser mainan guna melatih naluri berburu.',
      },
    ],
    tips: [
      'Jangan pernah memandikan kucing terlalu sering; cukup 1-2 bulan sekali jika kotor.',
      'Jauhkan tanaman beracun seperti lili, lidah buaya, dan monstera dari jangkauan kucing.',
      'Perhatikan tanda-tanda stres: tidak mau makan, buang air sembarangan, atau menyendiri.',
    ],
  },
  {
    id: 'dog-care',
    category: 'Dog',
    categoryName: 'Anjing',
    categoryIcon: 'dog',
    title: 'Panduan Praktis Cara Merawat Anjing',
    readTime: '6 menit baca',
    description:
      'Anjing adalah hewan sosial yang memerlukan aktivitas fisik teratur, makanan bergizi, pelatihan dasar, dan komitmen waktu harian dari pemiliknya.',
    steps: [
      {
        number: '1',
        title: 'Pola Makan Seimbang & Tepat Waktu',
        desc: 'Beri pakan sesuai usia, ukuran, dan tingkat aktivitas fisik anjing. Beri makan 2 kali sehari pada jam yang sama. Hindari makanan berbahaya bagi anjing seperti cokelat, anggur, kismis, bawang, dan pemanis xylitol.',
      },
      {
        number: '2',
        title: 'Aktivitas Fisik & Jalan Santai Harian',
        desc: 'Ajak anjing berjalan-jalan atau berolahraga minimal 30-60 menit setiap hari. Olahraga membantu menjaga kesehatan kardiovaskular serta mencegah stres dan perilaku destruktif di rumah.',
      },
      {
        number: '3',
        title: 'Mandi & Perawatan Kebersihan',
        desc: 'Mandikan anjing 2-4 minggu sekali menggunakan sampo khusus anjing ber-pH seimbang. Bersihkan lipatan telinga, sikat gigi anjing 2-3 kali seminggu, dan potong kuku saat mulai menyentuh lantai.',
      },
      {
        number: '4',
        title: 'Sosialisasi & Latihan Ketaatan Dasar',
        desc: 'Latih perintah dasar sejak dini (sit, stay, come, down) menggunakan metode positive reinforcement (pemberian camilan dan pujian). Kenalkan anjing pada orang dan suara baru agar tidak penakut/agresif.',
      },
      {
        number: '5',
        title: 'Jadwal Medis & Vaksin Lengkap',
        desc: 'Pastikan anjing menerima vaksin DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) serta vaksin Rabies. Berikan pencegahan cacing hati (heartworm) dan kutu secara rutin.',
      },
    ],
    tips: [
      'Gunakan tali kekang (leash) yang nyaman saat membawa anjing keluar ruangan.',
      'Sediakan ruang istirahat yang sejuk dan terlindung dari cuaca panas ekstrem.',
      'Bawa segera ke klinik dokter hewan jika anjing lesu, muntah berulang, atau tidak mau minum.',
    ],
  },
  {
    id: 'rabbit-care',
    category: 'Rabbit',
    categoryName: 'Kelinci',
    categoryIcon: 'rabbit',
    title: 'Panduan Perawatan Kelinci Sehat & Bahagia',
    readTime: '4 menit baca',
    description:
      'Kelinci memiliki sistem pencernaan sensitif yang sangat bergantung pada serat hay rumput kering dan membutuhkan penanganan lembut tanpa mengangkat telinganya.',
    steps: [
      {
        number: '1',
        title: 'Diet Utama: 80% Hay Rumput Kering',
        desc: 'Sediakan Timothy Hay atau rumput kering sejenis dalam jumlah tak terbatas setiap hari. Serat hay sangat penting untuk pencernaan dan mengikis gigi kelinci yang terus tumbuh seumur hidupnya.',
      },
      {
        number: '2',
        title: 'Sayuran Hijau Segar & Pelet Terukur',
        desc: 'Berikan sayuran hijau segar seperti selada romaine, peterseli, bok choy, dan kemangi. Berikan pelet kelinci bermutu tinggi dalam takaran kecil (sekitar 1/8 cangkir per hari per 2 kg berat badan).',
      },
      {
        number: '3',
        title: 'Kandang Lapang & Ramah Kaki',
        desc: 'Hindari alas kandang dari kawat berjeruji karena dapat merusak telapak kaki kelinci (sore hocks). Sediakan kandang berukuran minimal 4 kali panjang tubuh kelinci dan sediakan litter box khusus kelinci.',
      },
      {
        number: '4',
        title: 'Teknik Memegang yang Benar',
        desc: 'JANGAN PERNAH mengangkat kelinci pada telinganya! Selalu topang bagian dada dan bokong/pantatnya dengan erat namun lembut agar tulang belakangnya terlindungi.',
      },
      {
        number: '5',
        title: 'Lingkungan Aman Bebas Gigitan Kabel',
        desc: 'Kelinci gemar mengunyah benda asing. Bungkus kabel listrik dan simpan barang-barang plastik/karet dari area jelajah kelinci untuk menghindari penyumbatan usus (GI stasis).',
      },
    ],
    tips: [
      'Kelinci tidak boleh dimandikan dengan air basah karena rentan mengalami hipotermia dan syok.',
      'Sediakan kayu apel atau mainan gigitan khusus kelinci agar gigi tidak overgrowing.',
      'Jika kelinci berhenti makan atau tidak mengeluarkan kotoran selama 12 jam, segera ke dokter hewan.',
    ],
  },
  {
    id: 'bird-care',
    category: 'Bird',
    categoryName: 'Burung',
    categoryIcon: 'bird',
    title: 'Panduan Perawatan Harian Burung Peliharaan',
    readTime: '4 menit baca',
    description:
      'Burung membutuhkan sangkar yang higienis, pakan biji bernutrisi, paparan sinar matahari pagi, dan stimulasi lingkungan agar suaranya merdu dan bulunya berkilau.',
    steps: [
      {
        number: '1',
        title: 'Variasi Pakan Biji & Nutrisi Segar',
        desc: 'Kombinasikan campuran biji berkualitas dengan pelet khusus burung serta potongan sayur dan buah segar (apel tanpa biji, wortel, pepaya). Hindari alpukat, cokelat, dan kafein yang beracun bagi burung.',
      },
      {
        number: '2',
        title: 'Sanitasi Sangkar & Air Minum Harian',
        desc: 'Ganti air minum dan bersihkan wadah pakan setiap hari. Bersihkan tatakan kotoran sangkar setiap 1-2 hari untuk mencegah tumbuhnya jamur dan bakteri berbahaya.',
      },
      {
        number: '3',
        title: 'Penjemuran Sinar Matahari Pagi',
        desc: 'Jemur burung di tempat berangin teduh pada pukul 07.00 - 08.30 selama 15-30 menit. Sinar matahari pagi membantu pembentukan vitamin D3 alami untuk penyerapan kalsium.',
      },
      {
        number: '4',
        title: 'Tenggeran Beragam Ukuran & Mainan',
        desc: 'Gunakan kayu tenggeran alami dengan diameter bervariasi agar otot telapak kaki burung terlatih. Sediakan cermin kecil, lonceng, atau ayunan agar burung tidak merasa kesepian.',
      },
    ],
    tips: [
      'Letakkan sangkar di ruangan berventilasi baik, jauh dari asap dapur atau rokok.',
      'Tutup sangkar dengan kain tipis (krodong) saat malam hari agar burung dapat tidur nyenyak.',
      'Periksa apakah bulu burung mengembang (puffed-up) terus-menerus, yang menandakan burung sakit atau kedinginan.',
    ],
  },
];

// ========================================
// DATA VIDEO TUTORIAL (YOUTUBE & TIKTOK)
// ========================================
const VIDEO_TUTORIALS = [
  {
    id: 'yt-cat-1',
    category: 'Cat',
    platform: 'YouTube',
    platformIcon: 'youtube',
    badgeColor: '#FF0000',
    title: 'Panduan Lengkap Merawat Kucing untuk Pemula',
    channel: 'Dokter Hewan & Pet Care Channel',
    duration: '8:45',
    thumbnail:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
    url: 'https://www.youtube.com/results?search_query=cara+merawat+kucing+pemula+lengkap',
    description:
      'Video komprehensif mengupas tuntas cara merawat kucing dari pemberian makan, vaksinasi, hingga grooming bulu.',
  },
  {
    id: 'tt-cat-1',
    category: 'Cat',
    platform: 'TikTok',
    platformIcon: 'music-note',
    badgeColor: '#111111',
    title: '5 Kesalahan Fatal Pemula Saat Memelihara Kucing',
    channel: '@kucingsehat.id • Pet Tips',
    duration: '0:58 (Shorts)',
    thumbnail:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600',
    url: 'https://www.tiktok.com/tag/catcare',
    description:
      'Video singkat dan padat mengenai hal-hal yang wajib dihindari dalam memelihara anabul kesayangan.',
  },
  {
    id: 'yt-dog-1',
    category: 'Dog',
    platform: 'YouTube',
    platformIcon: 'youtube',
    badgeColor: '#FF0000',
    title: 'Cara Melatih & Merawat Anak Anjing Bagi Pemula',
    channel: 'Dog Training & Care Academy',
    duration: '11:20',
    thumbnail:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
    url: 'https://www.youtube.com/results?search_query=cara+merawat+anjing+pemula+lengkap',
    description:
      'Pelajari rutinitas harian anak anjing, teknik potty training, dan cara memilih pakan yang tepat.',
  },
  {
    id: 'tt-dog-1',
    category: 'Dog',
    platform: 'TikTok',
    platformIcon: 'music-note',
    badgeColor: '#111111',
    title: 'Makanan Manusia yang Sangat Berbahaya untuk Anjing',
    channel: '@vet.care.id • TikTok Tips',
    duration: '0:45 (Shorts)',
    thumbnail:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
    url: 'https://www.tiktok.com/tag/dogtraining',
    description:
      'Daftar makanan sehari-hari yang beracun bagi anjing serta pertolongan pertama darurat.',
  },
  {
    id: 'yt-rabbit-1',
    category: 'Rabbit',
    platform: 'YouTube',
    platformIcon: 'youtube',
    badgeColor: '#FF0000',
    title: 'Tutorial Merawat Kelinci Agar Sehat, Jinak & Tidak Bau',
    channel: 'Bunny Lovers Indonesia',
    duration: '7:15',
    thumbnail:
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600',
    url: 'https://www.youtube.com/results?search_query=cara+merawat+kelinci+agar+sehat+dan+tidak+bau',
    description:
      'Trik menjaga kebersihan kandang kelinci, jenis rumput hay terbaik, dan cara membuat kelinci jinak.',
  },
  {
    id: 'yt-bird-1',
    category: 'Bird',
    platform: 'YouTube',
    platformIcon: 'youtube',
    badgeColor: '#FF0000',
    title: 'Tips Perawatan Harian Burung Kicau & Hias Pemula',
    channel: 'Avian Pet Care Channel',
    duration: '9:30',
    thumbnail:
      'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600',
    url: 'https://www.youtube.com/results?search_query=cara+merawat+burung+kicau+pemula',
    description:
      'Cara menjemur, memandikan, dan memilih formula pakan biji terbaik agar burung selalu sehat dan rajin berkicau.',
  },
  {
    id: 'tt-general-1',
    category: 'All',
    platform: 'TikTok',
    platformIcon: 'music-note',
    badgeColor: '#111111',
    title: 'Tanda Hewan Peliharaan Sedang Butuh Bantuan Dokter',
    channel: '@dokterhewan.id • TikTok Edu',
    duration: '1:12 (Shorts)',
    thumbnail:
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600',
    url: 'https://www.tiktok.com/tag/pettips',
    description:
      'Kenali bahasa tubuh dan gejala klinis saat anabul mengalami rasa sakit yang tidak mereka tunjukkan langsung.',
  },
];

const CATEGORIES = [
  { id: 'All', name: 'Semua', icon: 'paw' },
  { id: 'Cat', name: 'Kucing', icon: 'cat' },
  { id: 'Dog', name: 'Anjing', icon: 'dog' },
  { id: 'Rabbit', name: 'Kelinci', icon: 'rabbit' },
  { id: 'Bird', name: 'Burung', icon: 'bird' },
];

export default function PetCareTutorialScreen({ route }) {
  const initialCat = route.params?.category || route.params?.initialCategory || 'All';
  const [selectedCategory, setSelectedCategory] = useState(
    initialCat === 'All' || ['Cat', 'Dog', 'Rabbit', 'Bird'].includes(initialCat)
      ? initialCat
      : 'All'
  );

  const [activePopupItem, setActivePopupItem] = useState(null);

  // Filter tutorial
  const filteredTutorials = TUTORIAL_DATA.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  // Filter video
  const filteredVideos = VIDEO_TUTORIALS.filter(
    (item) =>
      selectedCategory === 'All' ||
      item.category === 'All' ||
      item.category === selectedCategory
  );

  // Buka URL Video (YouTube / TikTok)
  const handleOpenVideo = async (video) => {
    try {
      const supported = await Linking.canOpenURL(video.url);
      if (supported) {
        await Linking.openURL(video.url);
      } else {
        await Linking.openURL(video.url);
      }
    } catch (err) {
      console.warn('Error opening video URL:', err);
      Alert.alert(
        'Tautan Video',
        `Membuka video di ${video.platform}:\n${video.url}`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Buka Browser',
            onPress: () => Linking.openURL(video.url).catch(() => {}),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BANNER HEADER */}
        <View style={styles.headerBanner}>
          <View style={styles.bannerBadge}>
            <Ionicons name="sparkles" size={14} color={COLORS.accent} />
            <Text style={styles.bannerBadgeText}>Pet Care Guide & Video</Text>
          </View>
          <Text style={styles.bannerTitle}>Tutorial Cara Merawat Hewan</Text>
          <Text style={styles.bannerSubtitle}>
            Pelajari panduan langkah demi langkah merawat hewan peliharaan Anda
            agar tetap sehat, bahagia, dan berumur panjang, lengkap dengan video
            edukasi YouTube & TikTok.
          </Text>
        </View>

        {/* CATEGORY SELECTOR */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionHeaderLabel}>Pilih Kategori Hewan:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.75}
                >
                  <MaterialCommunityIcons
                    name={cat.icon}
                    size={18}
                    color={isSelected ? '#FFFFFF' : COLORS.gray}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* =================================================== */}
        {/* SECTION 1: TUTORIAL LANGKAH-LANGKAH CARA MERAWAT    */}
        {/* =================================================== */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIconBadge}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={20}
                color={COLORS.accent}
              />
            </View>
            <View>
              <Text style={styles.sectionHeading}>Panduan & Langkah Perawatan</Text>
              <Text style={styles.sectionSubheading}>
                Tips harian untuk memastikan kesehatan dan kenyamanan hewan
              </Text>
            </View>
          </View>

          {filteredTutorials.map((tutorial) => (
            <View key={tutorial.id} style={styles.tutorialCard}>
              <View style={styles.tutorialHeader}>
                <View style={styles.tutorialCategoryBadge}>
                  <MaterialCommunityIcons
                    name={tutorial.categoryIcon}
                    size={16}
                    color={COLORS.accent}
                  />
                  <Text style={styles.tutorialCategoryText}>
                    {tutorial.categoryName}
                  </Text>
                </View>
                <View style={styles.readTimeBadge}>
                  <Ionicons name="time-outline" size={13} color={COLORS.gray} />
                  <Text style={styles.readTimeText}>{tutorial.readTime}</Text>
                </View>
              </View>

              <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
              <Text style={styles.tutorialDesc}>{tutorial.description}</Text>

              {/* LIST LANGKAH */}
              <View style={styles.stepList}>
                {tutorial.steps.map((step) => (
                  <View key={step.number} style={styles.stepItem}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>{step.number}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* TIPS TAMBAHAN */}
              {tutorial.tips && (
                <View style={styles.tipsBox}>
                  <View style={styles.tipsHeader}>
                    <Ionicons
                      name="bulb-outline"
                      size={18}
                      color={COLORS.accent}
                    />
                    <Text style={styles.tipsHeading}>Catatan Penting:</Text>
                  </View>
                  {tutorial.tips.map((tip, idx) => (
                    <View key={idx} style={styles.tipRow}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* TOMBOL RINGKASAN POPUP */}
              <TouchableOpacity
                style={styles.summaryBtn}
                onPress={() => setActivePopupItem(tutorial)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={COLORS.accent}
                />
                <Text style={styles.summaryBtnText}>
                  Buka Ringkasan Cepat (Pop-up)
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* =================================================== */}
        {/* SECTION 2: VIDEO TUTORIAL CARA MERAWAT              */}
        {/* (DILETAKKAN DI BAWAH TUTORIAL SESUAI REQUEST)       */}
        {/* =================================================== */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View
              style={[styles.sectionIconBadge, { backgroundColor: '#FFE4E6' }]}
            >
              <Ionicons name="play-circle" size={22} color={COLORS.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>
                Video Tutorial Perawatan
              </Text>
              <Text style={styles.sectionSubheading}>
                Tonton video visual di YouTube & TikTok langsung dari para ahli
              </Text>
            </View>
          </View>

          {filteredVideos.map((video) => (
            <View key={video.id} style={styles.videoCard}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleOpenVideo(video)}
                style={styles.thumbnailContainer}
              >
                <Image
                  source={{ uri: video.thumbnail }}
                  style={styles.videoThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.videoOverlay}>
                  <View style={styles.playButtonCircle}>
                    <Ionicons name="play" size={24} color="#FFFFFF" />
                  </View>
                </View>

                {/* BADGE PLATFORM */}
                <View
                  style={[
                    styles.platformBadge,
                    { backgroundColor: video.badgeColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={video.platformIcon}
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.platformBadgeText}>{video.platform}</Text>
                </View>

                {/* BADGE DURASI */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoChannel}>👤 {video.channel}</Text>
                <Text style={styles.videoDesc}>{video.description}</Text>

                <View style={styles.videoActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.watchButton,
                      video.platform === 'YouTube'
                        ? styles.watchButtonYT
                        : styles.watchButtonTT,
                    ]}
                    onPress={() => handleOpenVideo(video)}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name={video.platformIcon}
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.watchButtonText}>
                      Tonton di {video.platform}
                    </Text>
                    <Ionicons
                      name="open-outline"
                      size={14}
                      color="#FFFFFF"
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomNote}>
          <Ionicons name="heart" size={18} color={COLORS.accent} />
          <Text style={styles.bottomNoteText}>
            Sayangi hewan peliharaanmu dengan perawatan terbaik setiap hari.
          </Text>
        </View>
      </ScrollView>

      {/* =================================================== */}
      {/* POP-UP / MODAL DETAIL TUTORIAL                      */}
      {/* =================================================== */}
      <Modal
        visible={!!activePopupItem}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePopupItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <MaterialCommunityIcons
                  name={activePopupItem?.categoryIcon || 'paw'}
                  size={24}
                  color={COLORS.accent}
                />
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {activePopupItem?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActivePopupItem(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 18 }}
            >
              <Text style={styles.modalDesc}>
                {activePopupItem?.description}
              </Text>

              <Text style={styles.modalSectionLabel}>Langkah Utama:</Text>
              {activePopupItem?.steps?.map((step) => (
                <View key={step.number} style={styles.modalStepItem}>
                  <Text style={styles.modalStepNum}>{step.number}.</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalStepTitle}>{step.title}</Text>
                    <Text style={styles.modalStepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.modalOkBtn}
                onPress={() => setActivePopupItem(null)}
              >
                <Text style={styles.modalOkBtnText}>Tutup Ringkasan</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 35,
  },
  headerBanner: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0E1',
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E6',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    gap: 5,
  },
  bannerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 19,
  },
  categorySection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  sectionHeaderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
  },
  categoryContainer: {
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  sectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionSubheading: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  tutorialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tutorialCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  tutorialCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
  readTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  tutorialTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  tutorialDesc: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    marginBottom: 16,
  },
  stepList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 17,
  },
  tipsBox: {
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#FFE8D1',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tipsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C05621',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    gap: 6,
  },
  tipBullet: {
    fontSize: 12,
    color: '#C05621',
    fontWeight: '700',
  },
  tipText: {
    fontSize: 12,
    color: '#7B341E',
    flex: 1,
    lineHeight: 16,
  },
  summaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 14,
    gap: 6,
  },
  summaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnailContainer: {
    height: 180,
    backgroundColor: '#333333',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 98, 104, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  platformBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  platformBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  videoChannel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 6,
  },
  videoDesc: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 17,
    marginBottom: 14,
  },
  videoActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  watchButtonYT: {
    backgroundColor: '#E50914',
  },
  watchButtonTT: {
    backgroundColor: '#111111',
  },
  watchButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 30,
    gap: 8,
  },
  bottomNoteText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  modalStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  modalStepNum: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
  },
  modalStepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  modalStepDesc: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 16,
  },
  modalOkBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalOkBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
