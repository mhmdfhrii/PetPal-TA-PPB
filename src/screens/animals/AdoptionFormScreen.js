
import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { createAdoptionRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  primary: '#FF6268',
  background: '#FFFFFF',
  text: '#252525',
  secondary: '#777777',
  border: '#EEEEEE',
  inputBackground: '#F8F8F8',
  lightRed: '#FFF1F1',
};

export default function AdoptionFormScreen({ route, navigation }) {
  const { session, user } = useAuth();
  console.log('TOKEN:', session?.access_token);
  
  const animal = route.params?.animal;

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Mengambil identitas dari akun yang sedang login
  const applicantName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Pengguna';

  const applicantEmail = user?.email || '-';

  const handleSubmit = async () => {
    if (!session?.access_token) {
      Alert.alert(
        'Sesi Berakhir',
        'Silakan login kembali untuk mengajukan adopsi.'
      );
      return;
    }

    if (!animal?.id) {
      Alert.alert(
        'Terjadi Kesalahan',
        'Data hewan tidak ditemukan. Silakan kembali dan coba lagi.'
      );
      return;
    }

    if (!phone.trim() || !address.trim() || !reason.trim()) {
      Alert.alert(
        'Form Belum Lengkap',
        'Silakan lengkapi semua data terlebih dahulu.'
      );
      return;
    }

    if (phone.trim().length < 8) {
      Alert.alert(
        'Nomor Telepon Tidak Valid',
        'Masukkan nomor telepon yang benar.'
      );
      return;
    }

    try {
      setLoading(true);

      await createAdoptionRequest(
        {
          animal_id: animal.id,
          phone: phone.trim(),
          address: address.trim(),
          reason: reason.trim(),
        },
        session.access_token
      );

      Alert.alert(
        'Pengajuan Berhasil',
        'Pengajuan adopsi berhasil dikirim. Silakan tunggu konfirmasi dari administrator.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Adoption Submit Error:', error);

      Alert.alert(
        'Pengajuan Gagal',
        error.message || 'Terjadi kesalahan saat mengirim pengajuan.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Formulir Adopsi
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* INFORMASI HEWAN */}
          <View style={styles.animalCard}>
            {animal?.image_url ? (
              <Image
                source={{ uri: animal.image_url }}
                style={styles.animalImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>🐾</Text>
              </View>
            )}

            <View style={styles.animalInfo}>
              <Text style={styles.animalLabel}>
                Hewan yang akan diadopsi
              </Text>

              <Text style={styles.animalName}>
                {animal?.name || 'Nama Hewan'}
              </Text>

              <Text style={styles.animalDetail}>
                {animal?.breed || animal?.category || 'Informasi hewan'}
              </Text>

              {!!animal?.location && (
                <Text style={styles.animalLocation}>
                  📍 {animal.location}
                </Text>
              )}
            </View>
          </View>

          {/* INFORMASI PENGAJU */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Informasi Pengaju
            </Text>

            <Text style={styles.inputLabel}>
              Nama Lengkap
            </Text>

            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>
                {applicantName}
              </Text>
            </View>

            <Text style={styles.inputLabel}>
              Email
            </Text>

            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>
                {applicantEmail}
              </Text>
            </View>

            <Text style={styles.inputLabel}>
              Nomor Telepon <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Masukkan nomor telepon"
              placeholderTextColor="#AAAAAA"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={20}
            />

            <Text style={styles.inputLabel}>
              Alamat Lengkap <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Masukkan alamat tempat tinggal"
              placeholderTextColor="#AAAAAA"
              value={address}
              onChangeText={setAddress}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* ALASAN ADOPSI */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Alasan Adopsi
            </Text>

            <Text style={styles.inputLabel}>
              Mengapa ingin mengadopsi hewan ini?{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[styles.input, styles.reasonInput]}
              placeholder="Ceritakan alasan dan kesiapan kamu untuk merawat hewan ini..."
              placeholderTextColor="#AAAAAA"
              value={reason}
              onChangeText={setReason}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* INFORMASI */}
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>
              Informasi Penting
            </Text>

            <Text style={styles.noticeText}>
              Pastikan seluruh informasi yang kamu masukkan sudah benar.
              Pengajuan akan ditinjau oleh administrator sebelum
              mendapatkan keputusan.
            </Text>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                Kirim Pengajuan Adopsi
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Dengan mengirim pengajuan, kamu menyatakan bahwa informasi
            yang diberikan sudah benar.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 32,
    color: COLORS.text,
    lineHeight: 36,
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },

  headerSpacer: {
    width: 38,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 35,
  },

  animalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightRed,
    borderRadius: 16,
    padding: 12,
    marginBottom: 26,
    alignItems: 'center',
  },

  animalImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
  },

  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#FFE0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    fontSize: 35,
  },

  animalInfo: {
    flex: 1,
    marginLeft: 14,
  },

  animalLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    marginBottom: 5,
  },

  animalName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  animalDetail: {
    fontSize: 13,
    color: COLORS.secondary,
  },

  animalLocation: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 5,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 9,
  },

  required: {
    color: COLORS.primary,
  },

  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 18,
  },

  readOnlyInput: {
    backgroundColor: '#F1F1F1',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 18,
  },

  readOnlyText: {
    fontSize: 14,
    color: COLORS.secondary,
  },

  multilineInput: {
    minHeight: 100,
  },

  reasonInput: {
    minHeight: 130,
  },

  notice: {
    backgroundColor: COLORS.lightRed,
    padding: 15,
    borderRadius: 12,
    marginBottom: 22,
  },

  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 7,
  },

  noticeText: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.secondary,
  },

  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.7,
  },

  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  footerText: {
    fontSize: 11,
    color: COLORS.secondary,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 14,
  },
});
