
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, signOut, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);

  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [tempAddress, setTempAddress] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Mengambil profil dari tabel public.profiles
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, phone, address, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        const metadata = user.user_metadata || {};

        const profileName =
          data?.full_name ||
          metadata.full_name ||
          metadata.name ||
          user.email?.split('@')[0] ||
          'PetPal User';

        const profileEmail = user.email || data?.email || '';
        const profilePhone =
          data?.phone || metadata.phone_number || '';
        const profileAddress = data?.address || '';

        if (isMounted) {
          setName(profileName);
          setEmail(profileEmail);
          setPhone(profilePhone);
          setAddress(profileAddress);
          setAvatarUrl(data?.avatar_url || null);

          setTempName(profileName);
          setTempEmail(profileEmail);
          setTempPhone(profilePhone);
          setTempAddress(profileAddress);
        }
      } catch (error) {
        console.error('Load Profile Error:', error.message);
        Alert.alert('Gagal', 'Tidak dapat mengambil data profil.');
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const openEditProfile = () => {
    setTempName(name);
    setTempEmail(email);
    setTempPhone(phone);
    setTempAddress(address);
    setEditModalVisible(true);
  };

  // Memilih foto dari kamera atau galeri
  const pickAvatar = async (source) => {
    try {
      let result;

      if (source === 'camera') {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Izin Kamera',
            'PetPal memerlukan izin kamera untuk mengambil foto profil.'
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
          base64: true,
        });
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Izin Galeri',
            'PetPal memerlukan izin galeri untuk memilih foto profil.'
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      }

      if (result.canceled || !result.assets?.length) return;

      const selectedImage = result.assets[0];

      if (!selectedImage.base64) {
        Alert.alert('Gagal', 'Foto tidak dapat diproses. Coba pilih foto lain.');
        return;
      }

      await uploadAvatar(selectedImage);
    } catch (error) {
      console.error('Pick Avatar Error:', error);
      Alert.alert(
        'Gagal',
        error.message || 'Tidak dapat mengambil foto.'
      );
    }
  };

  // Menampilkan pilihan kamera atau galeri
  const showAvatarOptions = () => {
    if (uploadingAvatar) return;

    Alert.alert('Foto Profil', 'Pilih sumber foto yang ingin digunakan.', [
      {
        text: 'Ambil Foto dengan Kamera',
        onPress: () => pickAvatar('camera'),
      },
      {
        text: 'Pilih dari Galeri',
        onPress: () => pickAvatar('gallery'),
      },
      {
        text: 'Batal',
        style: 'cancel',
      },
    ]);
  };

  // Upload foto profil ke Supabase Storage
  const uploadAvatar = async (image) => {
    if (!user?.id) {
      Alert.alert('Gagal', 'Kamu harus login terlebih dahulu.');
      return;
    }

    try {
      setUploadingAvatar(true);

      const mimeType = image.mimeType || 'image/jpeg';

      const extension =
        mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';

      const filePath = `${user.id}/${Date.now()}.${extension}`;

      const fileData = decode(image.base64);

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, fileData, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const newAvatarUrl = publicUrlData?.publicUrl;

      if (!newAvatarUrl) {
        throw new Error('URL foto profil tidak berhasil dibuat.');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            avatar_url: newAvatarUrl,
          },
          { onConflict: 'id' }
        );

      if (profileError) throw profileError;

      setAvatarUrl(newAvatarUrl);
      if (refreshProfile) {
        await refreshProfile(user.id);
      }

      Alert.alert('Berhasil', 'Foto profil berhasil diperbarui.');
    } catch (error) {
      console.error('Upload Avatar Error:', error);

      Alert.alert(
        'Upload Gagal',
        error.message || 'Terjadi kesalahan saat mengunggah foto profil.'
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Menyimpan profil ke tabel profiles dan metadata Auth
  const saveProfile = async () => {
    if (!tempName.trim() || !tempEmail.trim() || !tempPhone.trim()) {
      Alert.alert('Oops!', 'Nama, email, dan nomor telepon wajib diisi.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newEmail = tempEmail.trim().toLowerCase();

    if (!emailPattern.test(newEmail)) {
      Alert.alert('Oops!', 'Format email tidak valid.');
      return;
    }

    try {
      setSaving(true);

      const currentEmail = user?.email?.toLowerCase() || '';

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: tempName.trim(),
          phone_number: tempPhone.trim(),
        },
      });

      if (authError) throw authError;

      if (newEmail !== currentEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: newEmail,
        });

        if (emailError) throw emailError;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: tempName.trim(),
            email: currentEmail === newEmail ? newEmail : currentEmail,
            phone: tempPhone.trim(),
            address: tempAddress.trim(),
            avatar_url: avatarUrl,
          },
          { onConflict: 'id' }
        );

      if (profileError) throw profileError;

      setName(tempName.trim());
      setPhone(tempPhone.trim());
      setAddress(tempAddress.trim());

      if (refreshProfile) {
        await refreshProfile(user.id);
      }

      if (newEmail === currentEmail) {
        setEmail(newEmail);
        Alert.alert('Berhasil', 'Profil berhasil diperbarui.');
      } else {
        Alert.alert(
          'Konfirmasi Email',
          'Perubahan profil berhasil disimpan. Silakan periksa email baru kamu untuk menyelesaikan konfirmasi perubahan email.'
        );
      }

      setEditModalVisible(false);
    } catch (error) {
      console.error('Update Profile Error:', error);

      Alert.alert(
        'Gagal',
        error.message || 'Terjadi kesalahan saat memperbarui profil.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    const doLogout = async () => {
      try {
        setLoggingOut(true);
        await signOut();
      } catch (error) {
        console.error('Logout Error:', error);
        if (Platform.OS === 'web') {
          window.alert(error.message || 'Tidak dapat keluar dari akun.');
        } else {
          Alert.alert(
            'Logout Gagal',
            error.message || 'Tidak dapat keluar dari akun.'
          );
        }
      } finally {
        setLoggingOut(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' && window.confirm
          ? window.confirm('Apakah kamu yakin ingin keluar dari akun?')
          : true;
      if (confirmed) {
        doLogout();
      }
      return;
    }

    Alert.alert('Logout', 'Apakah kamu yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: doLogout,
      },
    ]);
  };

  const MenuItem = ({ icon, title, onPress, color = '#444444' }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIconContainer}>
          <MaterialCommunityIcons name={icon} size={21} color="#FF6268" />
        </View>

        <Text style={[styles.menuText, { color }]}>{title}</Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={23}
        color="#AAAAAA"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>
            Manage your personal information
          </Text>
        </View>

        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={showAvatarOptions}
            activeOpacity={0.8}
            disabled={loadingProfile || uploadingAvatar}
          >
            {uploadingAvatar ? (
              <ActivityIndicator color="#FF6268" size="large" />
            ) : avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={55}
                color="#FF6268"
              />
            )}

            <View style={styles.cameraIcon}>
              <MaterialCommunityIcons
                name="camera"
                size={15}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          <Text style={styles.changePhotoText}>
            {uploadingAvatar ? 'Uploading photo...' : 'Tap photo to change'}
          </Text>

          {loadingProfile ? (
            <ActivityIndicator color="#FF6268" />
          ) : (
            <>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
            </>
          )}

          <TouchableOpacity
            style={styles.editButton}
            onPress={openEditProfile}
            activeOpacity={0.8}
            disabled={loadingProfile}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="email-outline"
                size={21}
                color="#FF6268"
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email || '-'}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={21}
                color="#FF6268"
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{phone || '-'}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={21}
                color="#FF6268"
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{address || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="heart-outline"
              title="My Favorites"
              onPress={() => navigation.navigate('Favorites')}
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="clipboard-list-outline"
              title="My Adoption Requests"
              onPress={() => navigation.navigate('AdoptionRequests')}
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="account-edit-outline"
              title="Edit Profile"
              onPress={openEditProfile}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="book-open-page-variant-outline"
              title="Tutorial Cara Merawat Hewan"
              onPress={() => navigation.navigate('PetCareTutorial')}
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="information-outline"
              title="About PetPal"
              onPress={() => navigation.navigate('About')}
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => navigation.navigate('HelpSupport')}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && { opacity: 0.6 }]}
          onPress={handleLogout}
          activeOpacity={0.8}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#FF6268" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color="#FF6268"
              />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>PetPal Version 1.0.0</Text>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!saving) setEditModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalScroll}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>

                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  disabled={saving}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={25}
                    color="#555555"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                placeholderTextColor="#AAAAAA"
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={tempEmail}
                onChangeText={setTempEmail}
                placeholder="Enter your email"
                placeholderTextColor="#AAAAAA"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={tempPhone}
                onChangeText={setTempPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#AAAAAA"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.input, styles.addressInput]}
                value={tempAddress}
                onChangeText={setTempAddress}
                placeholder="Enter your address"
                placeholderTextColor="#AAAAAA"
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                onPress={saveProfile}
                activeOpacity={0.8}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999999',
    marginTop: 5,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 18,
    paddingVertical: 25,
    borderRadius: 18,
  },
  avatar: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'visible',
  },
  avatarImage: {
    width: 95,
    height: 95,
    borderRadius: 50,
  },
  cameraIcon: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#FF6268',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
  },
  profileEmail: {
    fontSize: 13,
    color: '#999999',
    marginTop: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6268',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 15,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    marginTop: 22,
    marginHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 17,
    paddingVertical: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 13,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginTop: 4,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    marginHorizontal: 18,
    marginTop: 25,
    paddingVertical: 15,
    borderRadius: 13,
  },
  logoutText: {
    color: '#FF6268',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#AAAAAA',
    marginVertical: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 35,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333333',
  },
  addressInput: {
    minHeight: 75,
  },
  saveButton: {
    backgroundColor: '#FF6268',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
