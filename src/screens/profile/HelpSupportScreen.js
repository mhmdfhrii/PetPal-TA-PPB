import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F8F8F8',
  border: '#EEEEEE',
  gray: '#888888',
  lightRed: '#FFF0F0',
  text: '#222222',
};

// ========================================
// PANDUAN APLIKASI
// ========================================

const GUIDES = [
  {
    id: 'search',
    title: 'Cara Mencari Hewan Peliharaan',
    icon: 'magnify',
    description:
      'Gunakan kolom pencarian di halaman Home atau katalog Animals. Anda dapat mencari berdasarkan nama hewan, ras, maupun kategori (Anjing, Kucing, Kelinci, Burung). Anda juga dapat menggunakan tombol filter pada search bar untuk menyaring kategori hewan dan lokasi shelter.',
  },
  {
    id: 'shelter',
    title: 'Melihat Profil & Hewan di Shelter',
    icon: 'home-heart',
    description:
      'Buka tab Shelters untuk melihat seluruh mitra shelter penampungan hewan. Tekan pada kartu shelter untuk melihat informasi alamat lengkap, nomor kontak pengelola, deskripsi fasilitas, serta daftar hewan yang saat ini dirawat di shelter tersebut.',
  },
  {
    id: 'adopt',
    title: 'Alur & Cara Mengajukan Adopsi',
    icon: 'clipboard-text-outline',
    description:
      'Pilih hewan yang ingin Anda adopsi pada detail hewan, lalu tekan tombol "Adopt Now" (Formulir Adopsi). Isi nomor telepon aktif, alamat domisili, dan alasan Anda ingin mengadopsi. Pastikan Anda telah siap memberikan komitmen dan tempat tinggal yang aman bagi hewan.',
  },
  {
    id: 'status',
    title: 'Memahami Status Pengajuan Adopsi',
    icon: 'clock-outline',
    description:
      'Anda dapat memantau status adopsi melalui menu Profil → Riwayat Pengajuan Saya:\n• Menunggu (Pending): Permohonan sedang ditinjau oleh administrator/shelter.\n• Diterima (Approved): Pengajuan Anda disetujui, pihak shelter akan menghubungi Anda untuk proses serah terima hewan.\n• Ditolak (Rejected): Permohonan belum memenuhi kriteria kualifikasi adopsi saat ini.',
  },
  {
    id: 'account',
    title: 'Pengelolaan Akun & Profil',
    icon: 'account-cog-outline',
    description:
      'Di halaman Profil, Anda dapat mengetuk foto profil untuk mengganti foto menggunakan kamera atau galeri perangkat. Tekan "Edit Profile" untuk memperbarui nama lengkap, nomor telepon, dan alamat tempat tinggal.',
  },
];

// ========================================
// FAQ (FREQUENTLY ASKED QUESTIONS)
// ========================================

const FAQS = [
  {
    id: 'faq1',
    question: 'Apakah proses adopsi di PetPal berbayar?',
    answer:
      'Aplikasi PetPal tidak memungut biaya adopsi aplikasi. Beberapa shelter mungkin memiliki kebijakan biaya administrasi medis atau vaksinasi sukarela yang langsung dikoordinasikan dengan shelter terkait.',
  },
  {
    id: 'faq2',
    question: 'Berapa lama proses verifikasi pengajuan adopsi?',
    answer:
      'Verifikasi umumnya memakan waktu 1 hingga 3 hari kerja tergantung ketersediaan tim peninjau shelter. Anda dapat mengecek status pengajuan secara berkala di menu Riwayat Pengajuan.',
  },
  {
    id: 'faq3',
    question: 'Bisakah saya mengunjungi shelter sebelum mengadopsi?',
    answer:
      'Sangat disarankan! Silakan periksa alamat dan kontak resmi shelter pada halaman Detail Shelter untuk membuat janji temu dan berkenalan langsung dengan hewan pilihan Anda.',
  },
  {
    id: 'faq4',
    question: 'Apa syarat utama untuk mengadopsi hewan?',
    answer:
      'Syarat utama adalah komitmen jangka panjang, tempat tinggal yang aman bagi hewan peliharaan, kesanggupan finansial untuk pakan dan perawatan kesehatan, serta persetujuan seluruh anggota keluarga di rumah.',
  },
  {
    id: 'faq5',
    question: 'Apakah saya bisa mendaftarkan hewan peliharaan untuk diadopsi orang lain?',
    answer:
      'Ya, pengguna dapat mengunggah hewan peliharaan yang membutuhkan rumah baru melalui tombol "Upload Your Pet" pada katalog Animals dengan menyertakan foto dan deskripsi yang jelas.',
  },
];

// ========================================
// KONTAK & LAYANAN BANTUAN
// Catatan: Informasi kontak di bawah ini merupakan struktur konfigurasi resmi
// yang dapat disesuaikan dengan saluran kontak pengelola aplikasi PetPal.
// ========================================

const SUPPORT_CONTACTS = {
  email: 'support@petpal.app',
  phone: '+62 812-3456-7890',
  operatingHours: 'Senin - Jumat, 09:00 - 17:00 WIB',
  address: 'Semarang, Jawa Tengah, Indonesia',
};

export default function HelpSupportScreen({ navigation }) {
  const [expandedGuide, setExpandedGuide] = useState('search');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleGuide = (id) => {
    setExpandedGuide((prev) => (prev === id ? null : id));
  };

  const toggleFaq = (id) => {
    setExpandedFaq((prev) => (prev === id ? null : id));
  };

  const handleEmailSupport = () => {
    const emailUrl = `mailto:${SUPPORT_CONTACTS.email}?subject=PetPal%20Support%20Inquiry`;
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert(
            'Kontak Email',
            `Silakan kirimkan email pertanyaan Anda ke: ${SUPPORT_CONTACTS.email}`
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'Kontak Email',
          `Silakan hubungi kami di: ${SUPPORT_CONTACTS.email}`
        );
      });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER BANNER */}
      <View style={styles.headerBanner}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="help-buoy" size={32} color={COLORS.accent} />
        </View>

        <Text style={styles.headerTitle}>Pusat Bantuan PetPal</Text>
        <Text style={styles.headerSubtitle}>
          Temukan panduan lengkap, informasi adopsi, dan jawaban pertanyaan Anda
        </Text>
      </View>

      {/* BAGIAN 1: PANDUAN PENGGUNAAN APLIKASI */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="book-outline" size={18} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>Panduan Penggunaan</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Pelajari langkah-langkah mudah memanfaatkan seluruh fitur PetPal:
        </Text>

        <View style={styles.cardContainer}>
          {GUIDES.map((guide) => {
            const isExpanded = expandedGuide === guide.id;

            return (
              <View key={guide.id} style={styles.accordionItem}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => toggleGuide(guide.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.accordionIconBox}>
                    <MaterialCommunityIcons
                      name={guide.icon}
                      size={20}
                      color={COLORS.accent}
                    />
                  </View>

                  <Text style={styles.accordionTitle}>{guide.title}</Text>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.accordionText}>
                      {guide.description}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* BAGIAN 2: FAQ */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="chatbubbles-outline" size={18} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>Pertanyaan yang Sering Diajukan (FAQ)</Text>
        </View>

        <View style={styles.cardContainer}>
          {FAQS.map((faq) => {
            const isExpanded = expandedFaq === faq.id;

            return (
              <View key={faq.id} style={styles.accordionItem}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqBadge}>
                    <Text style={styles.faqBadgeText}>Q</Text>
                  </View>

                  <Text style={styles.accordionTitle}>{faq.question}</Text>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.accordionText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* BAGIAN 3: KONTAK & LAYANAN PENGGUNA */}
      <View style={[styles.section, { marginBottom: 35 }]}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="call-outline" size={18} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>Hubungi Tim PetPal</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Butuh bantuan lebih lanjut atau ingin berkolaborasi sebagai mitra shelter?
        </Text>

        <View style={styles.contactCard}>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleEmailSupport}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconCircle}>
              <Ionicons name="mail" size={18} color={COLORS.accent} />
            </View>
            <View style={styles.contactTextBox}>
              <Text style={styles.contactLabel}>Email Dukungan</Text>
              <Text style={styles.contactValue}>{SUPPORT_CONTACTS.email}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={COLORS.gray} />
          </TouchableOpacity>

          <View style={styles.contactDivider} />

          <View style={styles.contactItem}>
            <View style={styles.contactIconCircle}>
              <Ionicons name="time" size={18} color={COLORS.accent} />
            </View>
            <View style={styles.contactTextBox}>
              <Text style={styles.contactLabel}>Jam Layanan Pengguna</Text>
              <Text style={styles.contactValue}>
                {SUPPORT_CONTACTS.operatingHours}
              </Text>
            </View>
          </View>

          <View style={styles.contactDivider} />

          <View style={styles.contactItem}>
            <View style={styles.contactIconCircle}>
              <Ionicons name="location" size={18} color={COLORS.accent} />
            </View>
            <View style={styles.contactTextBox}>
              <Text style={styles.contactLabel}>Wilayah Layanan</Text>
              <Text style={styles.contactValue}>{SUPPORT_CONTACTS.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.configNoticeCard}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#B7791F"
            style={{ marginTop: 1 }}
          />
          <Text style={styles.configNoticeText}>
            Informasi kontak resmi di atas dapat dikonfigurasi melalui konfigurasi
            aplikasi oleh pengembang atau pengelola sistem PetPal.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },

  headerBanner: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.lightRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },

  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  section: {
    marginTop: 18,
    paddingHorizontal: 18,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },

  sectionDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 12,
    marginTop: 2,
  },

  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },

  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },

  accordionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: COLORS.lightRed,
    alignItems: 'center',
    justifyContent: 'center',
  },

  faqBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightRed,
    alignItems: 'center',
    justifyContent: 'center',
  },

  faqBadgeText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 13,
  },

  accordionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
    backgroundColor: '#FFFAFA',
  },

  accordionText: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 19,
  },

  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 4,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },

  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightRed,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactTextBox: {
    flex: 1,
  },

  contactLabel: {
    fontSize: 11,
    color: COLORS.gray,
  },

  contactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },

  contactDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },

  configNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8EC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    padding: 12,
    marginTop: 12,
    gap: 8,
  },

  configNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#8A5D1A',
    lineHeight: 16,
  },
});
