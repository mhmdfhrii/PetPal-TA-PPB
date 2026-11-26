
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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../../context/AuthContext';

import {
  getAdminShelters,
  createAdminShelter,
  updateAdminShelter,
  deleteAdminShelter,
} from '../../services/api';

const initialForm = {
  name: '',
  location: '',
  description: '',
  contact: '',
  is_active: true,
};

const AdminSheltersScreen = ({ navigation }) => {
  const { session } = useAuth();

  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [selectedImage, setSelectedImage] = useState(null);

  const accessToken = session?.access_token;

  // ========================================
  // LOAD SHELTERS
  // ========================================

  const loadShelters = async () => {
    try {
      setLoading(true);

      if (!accessToken) {
        throw new Error('Sesi admin tidak ditemukan.');
      }

      const data = await getAdminShelters(accessToken);
      setShelters(data);
    } catch (error) {
      console.error('Load Admin Shelters Error:', error);

      Alert.alert(
        'Gagal',
        error.message || 'Tidak dapat mengambil data shelter.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, [accessToken]);

  // ========================================
  // FORM
  // ========================================

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const openAddModal = () => {
    setEditingShelter(null);
    setForm(initialForm);
    setSelectedImage(null);
    setModalVisible(true);
  };

  const openEditModal = (shelter) => {
    setEditingShelter(shelter);

    setForm({
      name: shelter.name || '',
      location: shelter.location || '',
      description: shelter.description || '',
      contact: shelter.contact || '',
      is_active: shelter.is_active ?? true,
    });

    setSelectedImage(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalVisible(false);
    setEditingShelter(null);
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
          'Izinkan PetPal mengakses galeri.'
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
      'Foto Shelter',
      'Pilih sumber foto.',
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
  // SAVE SHELTER
  // ========================================

  const handleSave = async () => {
    const requiredFields = [
      'name',
      'location',
      'description',
      'contact',
    ];

    for (const field of requiredFields) {
      if (!String(form[field] || '').trim()) {
        Alert.alert(
          'Data Belum Lengkap',
          'Mohon lengkapi seluruh informasi shelter.'
        );
        return;
      }
    }

    if (!accessToken) {
      Alert.alert('Sesi Berakhir', 'Silakan login kembali.');
      return;
    }

    try {
      setSaving(true);

      const cleanForm = {
        name: form.name.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        contact: form.contact.trim(),
        is_active: form.is_active,
      };

      if (editingShelter) {
        await updateAdminShelter(
          editingShelter.id,
          cleanForm,
          selectedImage,
          accessToken
        );

        Alert.alert(
          'Berhasil',
          'Data shelter berhasil diperbarui.'
        );
      } else {
        await createAdminShelter(
          cleanForm,
          selectedImage,
          accessToken
        );

        Alert.alert(
          'Berhasil',
          'Shelter berhasil ditambahkan.'
        );
      }

      setModalVisible(false);
      setEditingShelter(null);
      setForm(initialForm);
      setSelectedImage(null);

      await loadShelters();
    } catch (error) {
      console.error('Save Shelter Error:', error);

      Alert.alert(
        'Gagal',
        error.message || 'Tidak dapat menyimpan shelter.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // DEACTIVATE SHELTER
  // ========================================

  const handleDelete = (shelter) => {
    const doDelete = async () => {
      try {
        if (!accessToken) {
          throw new Error('Sesi admin tidak ditemukan.');
        }

        await deleteAdminShelter(
          shelter.id,
          accessToken
        );

        if (Platform.OS === 'web') {
          window.alert('Shelter berhasil dinonaktifkan.');
        } else {
          Alert.alert(
            'Berhasil',
            'Shelter berhasil dinonaktifkan.'
          );
        }

        await loadShelters();
      } catch (error) {
        console.error('Delete Shelter Error:', error);

        if (Platform.OS === 'web') {
          window.alert(error.message || 'Tidak dapat menonaktifkan shelter.');
        } else {
          Alert.alert(
            'Gagal',
            error.message || 'Tidak dapat menonaktifkan shelter.'
          );
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' && window.confirm
          ? window.confirm(`Apakah kamu yakin ingin menonaktifkan ${shelter.name}?`)
          : true;
      if (confirmed) {
        doDelete();
      }
      return;
    }

    Alert.alert(
      'Nonaktifkan Shelter',
      `Apakah kamu yakin ingin menonaktifkan ${shelter.name}?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Nonaktifkan',
          style: 'destructive',
          onPress: doDelete,
        },
      ]
    );
  };

  // ========================================
  // REACTIVATE SHELTER
  // ========================================

  const handleReactivate = async (shelter) => {
    try {
      if (!accessToken) {
        throw new Error('Sesi admin tidak ditemukan.');
      }

      await updateAdminShelter(
        shelter.id,
        { is_active: true },
        null,
        accessToken
      );

      Alert.alert(
        'Berhasil',
        'Shelter berhasil diaktifkan kembali.'
      );

      await loadShelters();
    } catch (error) {
      Alert.alert(
        'Gagal',
        error.message || 'Tidak dapat mengaktifkan shelter.'
      );
    }
  };

  // ========================================
  // INPUT COMPONENT
  // ========================================

  const renderInput = (
    label,
    key,
    placeholder,
    multiline = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

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
  // SHELTER CARD
  // ========================================

  const renderShelter = ({ item }) => (
    <View style={styles.shelterCard}>
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.shelterImage}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>
            Tidak ada foto
          </Text>
        </View>
      )}

      <View style={styles.shelterInfo}>
        <View style={styles.shelterHeader}>
          <Text style={styles.shelterName}>
            {item.name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.is_active
                  ? '#E6F7EC'
                  : '#FCE8E8',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: item.is_active
                    ? '#25834B'
                    : '#D94A4A',
                },
              ]}
            >
              {item.is_active ? 'Aktif' : 'Nonaktif'}
            </Text>
          </View>
        </View>

        <Text style={styles.shelterLocation}>
          {item.location}
        </Text>

        <Text style={styles.shelterContact}>
          Kontak: {item.contact}
        </Text>

        <Text
          style={styles.shelterDescription}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          {item.is_active ? (
            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deactivateText}>
                Nonaktifkan
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.activateButton}
              onPress={() => handleReactivate(item)}
            >
              <Text style={styles.activateText}>
                Aktifkan
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Kelola Shelter
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Data Shelter
          </Text>

          <Text style={styles.sectionSubtitle}>
            {shelters.length} shelter terdaftar
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonText}>
            + Tambah
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#FF6268"
          />

          <Text style={styles.loadingText}>
            Memuat data shelter...
          </Text>
        </View>
      ) : (
        <FlatList
          data={shelters}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderShelter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadShelters}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Belum Ada Shelter
              </Text>

              <Text style={styles.emptySubtitle}>
                Tekan tombol Tambah untuk memasukkan shelter.
              </Text>
            </View>
          }
        />
      )}

      {/* ================================= */}
      {/* ADD / EDIT MODAL */}
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
                  {editingShelter
                    ? 'Edit Shelter'
                    : 'Tambah Shelter'}
                </Text>

                <TouchableOpacity
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputLabel}>
                  Foto Shelter
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
                  ) : editingShelter?.image_url ? (
                    <Image
                      source={{ uri: editingShelter.image_url }}
                      style={styles.selectedImage}
                    />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Text style={styles.imagePickerIcon}>+</Text>
                      <Text style={styles.imagePickerText}>
                        Pilih foto shelter
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {renderInput(
                  'Nama Shelter',
                  'name',
                  'Contoh: Shelter PawCare'
                )}

                {renderInput(
                  'Lokasi',
                  'location',
                  'Alamat lengkap shelter'
                )}

                {renderInput(
                  'Kontak',
                  'contact',
                  'Nomor telepon atau WhatsApp'
                )}

                {renderInput(
                  'Deskripsi',
                  'description',
                  'Informasi mengenai shelter...',
                  true
                )}

                <Text style={styles.inputLabel}>
                  Status Shelter
                </Text>

                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      form.is_active && styles.statusOptionActive,
                    ]}
                    onPress={() => updateForm('is_active', true)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        form.is_active && styles.statusOptionTextActive,
                      ]}
                    >
                      Aktif
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      !form.is_active && styles.statusOptionActive,
                    ]}
                    onPress={() => updateForm('is_active', false)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        !form.is_active && styles.statusOptionTextActive,
                      ]}
                    >
                      Nonaktif
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
                      {editingShelter
                        ? 'Simpan Perubahan'
                        : 'Tambah Shelter'}
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
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    minWidth: 75,
  },

  backText: {
    color: '#FF6268',
    fontWeight: '600',
    fontSize: 14,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
  },

  headerSpacer: {
    minWidth: 75,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },

  addButton: {
    backgroundColor: '#FF6268',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 9,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
  },

  shelterImage: {
    width: '100%',
    height: 170,
    backgroundColor: '#EEEEEE',
  },

  imagePlaceholder: {
    height: 170,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    color: '#888888',
  },

  shelterInfo: {
    padding: 14,
  },

  shelterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  shelterName: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#252525',
    marginRight: 8,
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

  shelterLocation: {
    color: '#555555',
    fontSize: 13,
    marginTop: 9,
  },

  shelterContact: {
    color: '#777777',
    fontSize: 12,
    marginTop: 6,
  },

  shelterDescription: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  cardActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
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

  deactivateButton: {
    flex: 1,
    backgroundColor: '#FCE8E8',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
  },

  deactivateText: {
    color: '#D94A4A',
    fontWeight: 'bold',
  },

  activateButton: {
    flex: 1,
    backgroundColor: '#E6F7EC',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
  },

  activateText: {
    color: '#25834B',
    fontWeight: 'bold',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#888888',
  },

  emptyContainer: {
    paddingVertical: 60,
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
    height: 160,
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
  },

  imagePickerText: {
    fontSize: 13,
    color: '#888888',
    marginTop: 5,
  },

  statusOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  statusOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    borderRadius: 9,
    alignItems: 'center',
  },

  statusOptionActive: {
    borderColor: '#FF6268',
    backgroundColor: '#FFF0F0',
  },

  statusOptionText: {
    color: '#777777',
    fontSize: 12,
    fontWeight: '600',
  },

  statusOptionTextActive: {
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
});

export default AdminSheltersScreen;
