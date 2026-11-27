
import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { uploadPet } from '../../services/api';

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#777777',
  border: '#EEEEEE',
  light: '#FFF1F1',
};

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  editable = true,
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>

    <TextInput
      style={[
        styles.input,
        multiline && styles.multilineInput,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#AAAAAA"
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      keyboardType={keyboardType}
      editable={editable}
    />
  </View>
);

export default function UploadPetScreen({ navigation }) {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [category, setCategory] = useState('Dog');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // =====================================
  // TAKE PHOTO - NATIVE CAMERA
  // =====================================
  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'PetPal membutuhkan izin kamera untuk mengambil foto hewan.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      // Jika foto berhasil diambil
      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0]);
      }

      // Jika pengguna menekan Cancel,
      // aplikasi kembali tanpa mengubah foto.
    } catch (error) {
      console.error('Camera Error:', error);

      Alert.alert(
        'Camera Error',
        error.message || 'Gagal membuka kamera.'
      );
    }
  };

  // =====================================
  // CHOOSE FROM GALLERY
  // =====================================
  const pickImageFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'PetPal membutuhkan akses galeri untuk memilih foto hewan.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Gallery Error:', error);

      Alert.alert(
        'Gallery Error',
        error.message || 'Gagal membuka galeri.'
      );
    }
  };

  // =====================================
  // IMAGE SOURCE OPTIONS
  // =====================================
  const showImageOptions = () => {
    if (uploading) return;

    Alert.alert(
      'Pet Photo',
      'Pilih sumber foto hewan yang ingin digunakan.',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImageFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // =====================================
  // UPLOAD PET
  // =====================================
  const handleUpload = async () => {
    if (
      !name.trim() ||
      !breed.trim() ||
      !age.trim() ||
      !location.trim() ||
      !description.trim()
    ) {
      Alert.alert(
        'Incomplete Form',
        'Mohon lengkapi semua informasi hewan.'
      );
      return;
    }

    if (!image) {
      Alert.alert(
        'Photo Required',
        'Silakan ambil foto atau pilih foto hewan terlebih dahulu.'
      );
      return;
    }

    const petData = {
      name: name.trim(),
      breed: breed.trim(),
      category,
      age: age.trim(),
      gender,
      weight: weight.trim() || undefined,
      location: location.trim(),
      description: description.trim(),
    };

    try {
      setUploading(true);

      await uploadPet(petData, image);

      Alert.alert(
        'Upload Successful!',
        'Hewan berhasil ditambahkan ke PetPal.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Upload Pet Error:', error);

      Alert.alert(
        'Upload Failed',
        error.message ||
          'Terjadi kesalahan saat mengunggah hewan.'
      );
    } finally {
      setUploading(false);
    }
  };

  const categories = ['Dog', 'Cat', 'Rabbit', 'Bird'];
  const genders = ['Male', 'Female'];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={uploading}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Upload Pet
        </Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>
          Find a Loving Home
        </Text>

        <Text style={styles.subheading}>
          Share your pet with people who are looking for a new
          companion.
        </Text>

        {/* PET PHOTO */}
        <Text style={styles.sectionTitle}>
          Pet Photo
        </Text>

        <TouchableOpacity
          style={styles.imageContainer}
          onPress={showImageOptions}
          disabled={uploading}
          activeOpacity={0.8}
        >
          {image ? (
            <Image
              source={{ uri: image.uri }}
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.cameraIcon}>
                <Ionicons
                  name="camera-outline"
                  size={30}
                  color={COLORS.accent}
                />
              </View>

              <Text style={styles.uploadText}>
                Upload Pet Photo
              </Text>

              <Text style={styles.uploadSubtext}>
                Tap to take a photo or choose from gallery
              </Text>
            </View>
          )}

          <View style={styles.editImageButton}>
            <Ionicons
              name="camera"
              size={17}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>

        {/* BASIC INFORMATION */}
        <Text style={styles.sectionTitle}>
          Basic Information
        </Text>

        <FormInput
          label="Pet Name"
          value={name}
          onChangeText={setName}
          placeholder="Example: Milo"
          editable={!uploading}
        />

        <FormInput
          label="Breed"
          value={breed}
          onChangeText={setBreed}
          placeholder="Example: Golden Retriever"
          editable={!uploading}
        />

        {/* CATEGORY */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Category
          </Text>

          <View style={styles.optionContainer}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionButton,
                  category === item && styles.selectedOption,
                ]}
                onPress={() => setCategory(item)}
                disabled={uploading}
              >
                <Text
                  style={[
                    styles.optionText,
                    category === item &&
                      styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FormInput
          label="Age"
          value={age}
          onChangeText={setAge}
          placeholder="Example: 2 years"
          editable={!uploading}
        />

        {/* GENDER */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Gender
          </Text>

          <View style={styles.optionContainer}>
            {genders.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.genderButton,
                  gender === item && styles.selectedOption,
                ]}
                onPress={() => setGender(item)}
                disabled={uploading}
              >
                <Ionicons
                  name={item === 'Male' ? 'male' : 'female'}
                  size={17}
                  color={
                    gender === item
                      ? COLORS.accent
                      : COLORS.secondary
                  }
                />

                <Text
                  style={[
                    styles.optionText,
                    gender === item &&
                      styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FormInput
          label="Weight (Berat Badan)"
          value={weight}
          onChangeText={setWeight}
          placeholder="Example: 4.5 kg or 12 kg"
          editable={!uploading}
        />

        <FormInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Example: Semarang, Indonesia"
          editable={!uploading}
        />

        <FormInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Tell us more about your pet..."
          multiline
          editable={!uploading}
        />

        {/* UPLOAD BUTTON */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            uploading && styles.disabledButton,
          ]}
          onPress={handleUpload}
          disabled={uploading}
          activeOpacity={0.85}
        >
          {uploading ? (
            <>
              <ActivityIndicator color="#FFFFFF" />

              <Text style={styles.uploadButtonText}>
                Uploading...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.uploadButtonText}>
                Upload Pet
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Make sure all information is correct before uploading.
        </Text>
      </ScrollView>
    </View>
  );
}

// =====================================
// STYLES
// =====================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 15,
    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  headerPlaceholder: {
    width: 40,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 35,
  },

  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 12,
  },

  subheading: {
    fontSize: 13,
    color: COLORS.secondary,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 14,
    marginTop: 12,
  },

  imageContainer: {
    height: 190,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F0DADA',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 22,
    backgroundColor: '#FFFAFA',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  uploadText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },

  uploadSubtext: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 5,
  },

  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  editImageButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  formGroup: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 9,
  },

  input: {
    height: 51,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 15,
    fontSize: 13,
    color: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },

  multilineInput: {
    height: 110,
    paddingTop: 14,
  },

  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  optionButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },

  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },

  selectedOption: {
    backgroundColor: COLORS.light,
    borderColor: COLORS.accent,
  },

  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },

  selectedOptionText: {
    color: COLORS.accent,
  },

  uploadButton: {
    height: 54,
    backgroundColor: COLORS.accent,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 15,
  },

  disabledButton: {
    opacity: 0.7,
  },

  uploadButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  footerText: {
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 15,
  },
});
