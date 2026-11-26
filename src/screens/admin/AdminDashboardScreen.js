
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../../context/AuthContext';

import {
  getAnimals,
  getShelters,
  createAdminAnimal,
  updateAdminAnimal,
  deleteAdminAnimal,
} from '../../services/api';

// ========================================
// FORM DEFAULT
// ========================================

const initialForm = {
  name: '',
  breed: '',
  category: '',
  age: '',
  gender: '',
  location: '',
  description: '',
  is_available: true,
  shelter_id: '',
};

// ========================================
// ADMIN DASHBOARD
// ========================================

const AdminDashboardScreen = ({ navigation }) => {
  const { user, session, signOut } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [selectedImage, setSelectedImage] = useState(null);

  // ========================================
  // LOAD DATA HEWAN & SHELTER
  // ========================================

  const loadAnimals = async () => {
    try {
      setLoading(true);

      const [animalsData, sheltersData] = await Promise.all([
        getAnimals(),
        getShelters().catch(() => []),
      ]);
      setAnimals(animalsData);
      setShelters(sheltersData || []);
    } catch (error) {
      console.error('Load Animals Error:', error);

      Alert.alert(
        'Gagal',
        error.message || 'Tidak dapat mengambil data hewan.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
  }, []);

  // ========================================
  // FORM HANDLER
  // ========================================

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const openAddModal = () => {
    setEditingAnimal(null);
    setForm(initialForm);
    setSelectedImage(null);
    setModalVisible(true);
  };

  const openEditModal = (animal) => {
    setEditingAnimal(animal);

    setForm({
      name: animal.name || '',
      breed: animal.breed || '',
      category: animal.category || '',
      age: animal.age || '',
      gender: animal.gender || '',
      location: animal.location || '',
      description: animal.description || '',
      is_available: animal.is_available ?? true,
      shelter_id: animal.shelter_id ? String(animal.shelter_id) : '',
    });

    setSelectedImage(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalVisible(false);
    setEditingAnimal(null);
    setForm(initialForm);
    setSelectedImage(null);
  };

  // ========================================
  // IMAGE PICKER
  // ========================================

  const chooseFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Izin Dibutuhkan',
          'Izinkan PetPal mengakses galeri untuk memilih foto.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Gallery Error:', error);
      Alert.alert('Gagal', 'Tidak dapat membuka galeri.');
    }
  };

  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Izin Dibutuhkan',
          'Izinkan PetPal menggunakan kamera.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera Error:', error);
      Alert.alert('Gagal', 'Tidak dapat membuka kamera.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Pilih Foto Hewan',
      'Pilih sumber foto yang ingin digunakan.',
      [
        {
          text: 'Galeri',
          onPress: chooseFromGallery,
        },
        {
          text: 'Kamera',
          onPress: takePhoto,
        },
        {
          text: 'Batal',
          style: 'cancel',
        },
      ]
    );
  };

  // ========================================
  // SIMPAN DATA HEWAN
  // ========================================

  const handleSave = async () => {
    const requiredFields = [
      'name',
      'breed',
      'category',
      'age',
      'gender',
      'location',
      'description',
    ];

    for (const field of requiredFields) {
      if (!String(form[field] || '').trim()) {
        Alert.alert(
          'Data Belum Lengkap',
          'Mohon isi seluruh informasi hewan terlebih dahulu.'
        );
        return;
      }
    }

    if (!editingAnimal && !selectedImage) {
      Alert.alert(
        'Foto Belum Dipilih',
        'Silakan pilih foto hewan terlebih dahulu.'
      );
      return;
    }

    const accessToken = session?.access_token;

    if (!accessToken) {
      Alert.alert(
        'Sesi Berakhir',
        'Silakan login kembali sebagai administrator.'
      );
      return;
    }

    try {
      setSaving(true);

      const cleanForm = {
        name: form.name.trim(),
        breed: form.breed.trim(),
        category: form.category.trim(),
        age: form.age.trim(),
        gender: form.gender.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        is_available: form.is_available,
        shelter_id: form.shelter_id ? Number(form.shelter_id) : null,
      };

      if (editingAnimal) {
        await updateAdminAnimal(
          editingAnimal.id,
          cleanForm,
          selectedImage,
          accessToken
        );

        Alert.alert(
          'Berhasil',
          'Data hewan berhasil diperbarui.'
        );
      } else {
        await createAdminAnimal(
          cleanForm,
          selectedImage,
          accessToken
        );

        Alert.alert(
          'Berhasil',
          'Data hewan berhasil ditambahkan.'
        );
      }

      setModalVisible(false);
      setEditingAnimal(null);
      setForm(initialForm);
      setSelectedImage(null);

      await loadAnimals();
    } catch (error) {
      console.error('Save Animal Error:', error);

      Alert.alert(
        'Gagal',
        error.message || 'Tidak dapat menyimpan data hewan.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // HAPUS DATA HEWAN
  // ========================================

  const handleDelete = (animal) => {
    const doDelete = async () => {
      try {
        const accessToken = session?.access_token;

        if (!accessToken) {
          if (Platform.OS === 'web') {
            window.alert('Sesi Berakhir. Silakan login kembali.');
          } else {
            Alert.alert(
              'Sesi Berakhir',
              'Silakan login kembali.'
            );
          }
          return;
        }

        await deleteAdminAnimal(
          animal.id,
          accessToken
        );

        if (Platform.OS === 'web') {
          window.alert('Data hewan berhasil dihapus.');
        } else {
          Alert.alert(
            'Berhasil',
            'Data hewan berhasil dihapus.'
          );
        }

        await loadAnimals();
      } catch (error) {
        console.error('Delete Animal Error:', error);

        if (Platform.OS === 'web') {
          window.alert(error.message || 'Tidak dapat menghapus data hewan.');
        } else {
          Alert.alert(
            'Gagal',
            error.message || 'Tidak dapat menghapus data hewan.'
          );
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' && window.confirm
          ? window.confirm(`Apakah kamu yakin ingin menghapus ${animal.name}?`)
          : true;
      if (confirmed) {
        doDelete();
      }
      return;
    }

    Alert.alert(
      'Hapus Data Hewan',
      `Apakah kamu yakin ingin menghapus ${animal.name}?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: doDelete,
        },
      ]
    );
  };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    const doLogout = async () => {
      try {
        await signOut();
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('Tidak dapat keluar dari akun.');
        } else {
          Alert.alert('Gagal', 'Tidak dapat keluar dari akun.');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' && window.confirm
          ? window.confirm('Apakah kamu yakin ingin keluar dari akun admin?')
          : true;
      if (confirmed) {
        doLogout();
      }
      return;
    }

    Alert.alert(
      'Keluar',
      'Apakah kamu yakin ingin keluar dari akun admin?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: doLogout,
        },
      ]
    );
  };

  // ========================================
  // ANIMAL CARD
  // ========================================

  const renderAnimal = ({ item }) => (
    <View style={styles.animalCard}>
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.animalImage}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>
            Tidak ada foto
          </Text>
        </View>
      )}

      <View style={styles.animalInfo}>
        <View style={styles.animalHeader}>
          <View style={styles.animalTitleContainer}>
            <Text style={styles.animalName}>
              {item.name}
            </Text>

            <Text style={styles.animalBreed}>
              {item.breed} • {item.category}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.is_available
                  ? '#E6F7EC'
                  : '#FCE8E8',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: item.is_available
                    ? '#25834B'
                    : '#D94A4A',
                },
              ]}
            >
              {item.is_available ? 'Tersedia' : 'Tidak tersedia'}
            </Text>
          </View>
        </View>

        <Text style={styles.animalLocation}>
          {item.shelters?.name
            ? `🏠 ${item.shelters.name} • ${item.location}`
            : (item.location || 'Lokasi belum diisi')}
        </Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>
              Hapus
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ========================================
  // FORM INPUT COMPONENT
  // ========================================

  const renderInput = (
    label,
    key,
    placeholder,
    multiline = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
        value={form[key]}
        onChangeText={(value) => updateForm(key, value)}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  // ========================================
  // DASHBOARD HEADER / MENU CARDS
  // ========================================

  const DashboardHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            PetPal Admin
          </Text>

          <Text style={styles.headerSubtitle}>
            Administrator Dashboard
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Keluar
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          Selamat datang, Admin!
        </Text>

        <Text style={styles.welcomeEmail}>
          {user?.email || 'Administrator'}
        </Text>

        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>
            ADMINISTRATOR
          </Text>
        </View>
      </View>

      {/* CARD 1: KELOLA HEWAN */}

      <View style={styles.menuCard}>
        <View style={styles.menuCardContent}>
          <Text style={styles.menuCardTitle}>
            Kelola Data Hewan
          </Text>

          <Text style={styles.menuCardSubtitle}>
            {animals.length} data hewan terdaftar
          </Text>
        </View>

        <TouchableOpacity
          style={styles.menuAddButton}
          onPress={openAddModal}
        >
          <Text style={styles.menuAddButtonText}>
            + Tambah
          </Text>
        </TouchableOpacity>
      </View>

      {/* CARD 2: KELOLA SHELTER */}

      <TouchableOpacity
        style={styles.menuCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AdminShelters')}
      >
        <View style={styles.menuCardContent}>
          <Text style={styles.menuCardTitle}>
            Kelola Data Shelter
          </Text>

          <Text style={styles.menuCardSubtitle}>
            Tambah, edit, dan kelola shelter PetPal
          </Text>
        </View>

        <Text style={styles.menuCardArrow}>›</Text>
      </TouchableOpacity>

      {/* CARD 3: PENGAJUAN ADOPSI */}

      <TouchableOpacity
        style={styles.menuCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AdminAdoptions')}
      >
        <View style={styles.menuCardContent}>
          <Text style={styles.menuCardTitle}>
            Kelola Pengajuan Adopsi
          </Text>

          <Text style={styles.menuCardSubtitle}>
            Lihat dan kelola pengajuan dari pengguna
          </Text>
        </View>

        <Text style={styles.menuCardArrow}>›</Text>
      </TouchableOpacity>

      {/* CARD 4: KELOLA PENGGUNA */}

      <TouchableOpacity
        style={styles.menuCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AdminUsers')}
      >
        <View style={styles.menuCardContent}>
          <Text style={styles.menuCardTitle}>
            Kelola Pengguna
          </Text>

          <Text style={styles.menuCardSubtitle}>
            Lihat dan kelola akun pengguna PetPal
          </Text>
        </View>

        <Text style={styles.menuCardArrow}>›</Text>
      </TouchableOpacity>

      {/* JUDUL DAFTAR HEWAN */}

      <View style={styles.animalListHeader}>
        <Text style={styles.animalListTitle}>
          Daftar Hewan
        </Text>

        <Text style={styles.animalListSubtitle}>
          Data hewan yang tersedia di PetPal
        </Text>
      </View>
    </View>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <FlatList
        data={animals}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAnimal}
        ListHeaderComponent={DashboardHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadAnimals}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color="#FF6268"
              />

              <Text style={styles.loadingText}>
                Memuat data hewan...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Belum Ada Data Hewan
              </Text>

              <Text style={styles.emptySubtitle}>
                Tekan tombol Tambah untuk memasukkan data hewan.
              </Text>
            </View>
          )
        }
      />

      {/* ================================= */}
      {/* MODAL TAMBAH / EDIT HEWAN */}
      {/* ================================= */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingAnimal
                    ? 'Edit Data Hewan'
                    : 'Tambah Hewan'}
                </Text>

                <TouchableOpacity
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Text style={styles.closeButton}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputLabel}>
                  Foto Hewan
                </Text>

                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={showImageOptions}
                  disabled={saving}
                >
                  {selectedImage?.uri ? (
                    <Image
                      source={{ uri: selectedImage.uri }}
                      style={styles.selectedImage}
                    />
                  ) : editingAnimal?.image_url ? (
                    <Image
                      source={{ uri: editingAnimal.image_url }}
                      style={styles.selectedImage}
                    />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Text style={styles.imagePickerIcon}>
                        +
                      </Text>

                      <Text style={styles.imagePickerText}>
                        Pilih foto hewan
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {renderInput(
                  'Nama Hewan',
                  'name',
                  'Contoh: Mochi'
                )}

                {renderInput(
                  'Ras',
                  'breed',
                  'Contoh: Persian'
                )}

                {renderInput(
                  'Kategori',
                  'category',
                  'Contoh: Cat atau Dog'
                )}

                {renderInput(
                  'Usia',
                  'age',
                  'Contoh: 2 tahun'
                )}

                {renderInput(
                  'Jenis Kelamin',
                  'gender',
                  'Contoh: Male atau Female'
                )}

                {renderInput(
                  'Lokasi',
                  'location',
                  'Contoh: Semarang'
                )}

                <Text style={styles.inputLabel}>
                  Shelter Penampungan (Opsional)
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shelterPickerRow}
                >
                  <TouchableOpacity
                    style={[
                      styles.shelterPickerOption,
                      (!form.shelter_id || form.shelter_id === '') &&
                        styles.shelterPickerOptionActive,
                    ]}
                    onPress={() => updateForm('shelter_id', '')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.shelterPickerText,
                        (!form.shelter_id || form.shelter_id === '') &&
                          styles.shelterPickerTextActive,
                      ]}
                    >
                      Tanpa Shelter (Independen)
                    </Text>
                  </TouchableOpacity>

                  {shelters.map((shelterItem) => {
                    const isSelected =
                      String(form.shelter_id) === String(shelterItem.id);
                    return (
                      <TouchableOpacity
                        key={shelterItem.id}
                        style={[
                          styles.shelterPickerOption,
                          isSelected && styles.shelterPickerOptionActive,
                        ]}
                        onPress={() => {
                          updateForm('shelter_id', String(shelterItem.id));
                          if (!form.location && shelterItem.location) {
                            updateForm('location', shelterItem.location);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.shelterPickerText,
                            isSelected && styles.shelterPickerTextActive,
                          ]}
                        >
                          🏠 {shelterItem.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {renderInput(
                  'Deskripsi',
                  'description',
                  'Ceritakan kondisi dan karakter hewan...',
                  true
                )}

                <Text style={styles.inputLabel}>
                  Status Adopsi
                </Text>

                <View style={styles.availabilityContainer}>
                  <TouchableOpacity
                    style={[
                      styles.availabilityOption,
                      form.is_available && styles.availabilityActive,
                    ]}
                    onPress={() =>
                      updateForm('is_available', true)
                    }
                  >
                    <Text
                      style={[
                        styles.availabilityText,
                        form.is_available && styles.availabilityTextActive,
                      ]}
                    >
                      Tersedia
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.availabilityOption,
                      !form.is_available && styles.availabilityActive,
                    ]}
                    onPress={() =>
                      updateForm('is_available', false)
                    }
                  >
                    <Text
                      style={[
                        styles.availabilityText,
                        !form.is_available && styles.availabilityTextActive,
                      ]}
                    >
                      Tidak tersedia
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    saving && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingAnimal
                        ? 'Simpan Perubahan'
                        : 'Tambah Hewan'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>
                    Batal
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#252525',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 3,
  },

  logoutButton: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 9,
  },

  logoutText: {
    color: '#FF6268',
    fontWeight: '600',
  },

  welcomeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
  },

  welcomeEmail: {
    fontSize: 13,
    color: '#888888',
    marginTop: 5,
  },

  adminBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 7,
    marginTop: 12,
  },

  adminBadgeText: {
    fontSize: 10,
    color: '#FF6268',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // MENU CARDS

  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 17,
    paddingVertical: 19,
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },

  menuCardContent: {
    flex: 1,
    paddingRight: 10,
  },

  menuCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252525',
  },

  menuCardSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 6,
    lineHeight: 18,
  },

  menuCardArrow: {
    fontSize: 28,
    color: '#FF6268',
    marginLeft: 8,
  },

  menuAddButton: {
    backgroundColor: '#FF6268',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9,
  },

  menuAddButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // DAFTAR HEWAN

  animalListHeader: {
    marginHorizontal: 16,
    marginTop: 25,
    marginBottom: 13,
  },

  animalListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
  },

  animalListSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },

  listContent: {
    paddingBottom: 30,
  },

  animalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 13,
    marginBottom: 13,
    overflow: 'hidden',
    elevation: 2,
  },

  animalImage: {
    width: '100%',
    height: 170,
    backgroundColor: '#EEEEEE',
  },

  imagePlaceholder: {
    height: 170,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    color: '#888888',
  },

  animalInfo: {
    padding: 14,
  },

  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  animalTitleContainer: {
    flex: 1,
    marginRight: 8,
  },

  animalName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#252525',
  },

  animalBreed: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  animalLocation: {
    color: '#777777',
    fontSize: 12,
    marginTop: 10,
  },

  cardActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 9,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#FFF0F0',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#FF6268',
    fontWeight: 'bold',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#D94A4A',
    fontWeight: 'bold',
  },

  loadingContainer: {
    paddingVertical: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#888888',
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
  },

  emptySubtitle: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
    paddingHorizontal: 25,
  },

  // MODAL

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalKeyboard: {
    width: '100%',
    maxHeight: '94%',
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '100%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#252525',
  },

  closeButton: {
    fontSize: 22,
    color: '#777777',
    paddingHorizontal: 5,
  },

  inputGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: '#252525',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },

  multilineInput: {
    height: 100,
    paddingTop: 12,
  },

  imagePicker: {
    height: 170,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 11,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 18,
  },

  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  imagePickerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },

  imagePickerIcon: {
    fontSize: 35,
    color: '#FF6268',
    fontWeight: '300',
  },

  imagePickerText: {
    fontSize: 13,
    color: '#888888',
    marginTop: 5,
  },

  availabilityContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  availabilityOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    borderRadius: 9,
    alignItems: 'center',
  },

  availabilityActive: {
    borderColor: '#FF6268',
    backgroundColor: '#FFF0F0',
  },

  availabilityText: {
    color: '#777777',
    fontSize: 12,
    fontWeight: '600',
  },

  availabilityTextActive: {
    color: '#FF6268',
  },

  saveButton: {
    backgroundColor: '#FF6268',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  disabledButton: {
    opacity: 0.7,
  },

  cancelButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 5,
  },

  cancelButtonText: {
    color: '#888888',
    fontWeight: '600',
  },

  shelterPickerRow: {
    gap: 8,
    paddingVertical: 5,
    marginBottom: 15,
  },

  shelterPickerOption: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  shelterPickerOptionActive: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FF6268',
  },

  shelterPickerText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },

  shelterPickerTextActive: {
    color: '#FF6268',
    fontWeight: '700',
  },
});

export default AdminDashboardScreen;
