
import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { getAnimals } from '../../services/api';

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F5F5F5',
  gray: '#999999',
  text: '#222222',
};

const CATEGORIES = [
  { name: 'All', icon: 'paw' },
  { name: 'Dog', icon: 'dog' },
  { name: 'Cat', icon: 'cat' },
  { name: 'Rabbit', icon: 'rabbit' },
  { name: 'Bird', icon: 'bird' },
];

export default function AnimalScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mengambil data hewan dari API
  const fetchAnimals = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getAnimals();

      const formattedPets = data
        .filter((pet) => pet.is_available !== false)
        .map((pet) => ({
          ...pet,
          image: pet.image_url,
        }));

      setPets(formattedPets);
    } catch (err) {
      console.error('Fetch animals error:', err);

      setError(
        'Gagal memuat data hewan. Periksa koneksi internet kamu.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Refresh setiap kali halaman Animals kembali aktif
  useFocusEffect(
    useCallback(() => {
      fetchAnimals();
    }, [])
  );

  // Search dan filter kategori
  const filteredPets = pets.filter((pet) => {
    const keyword = search.trim().toLowerCase();

    const matchesCategory =
      selectedCategory === 'All' ||
      pet.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      (pet.name || '').toLowerCase().includes(keyword) ||
      (pet.breed || '').toLowerCase().includes(keyword) ||
      (pet.location || '').toLowerCase().includes(keyword);

    return matchesCategory && matchesSearch;
  });

  // Membuka halaman detail hewan
  const openDetail = (pet) => {
    navigation.navigate('AnimalDetail', {
      animal: pet,
    });
  };

  // Membuka halaman Upload Pet
  const openUploadPet = () => {
    navigation.navigate('UploadPet');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Find Your Pet</Text>
          <Text style={styles.subtitle}>
            Find a lovely companion for your family
          </Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={21}
            color={COLORS.gray}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search name, breed, or location..."
            placeholderTextColor={COLORS.gray}
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* UPLOAD PET BUTTON */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={openUploadPet}
          activeOpacity={0.85}
        >
          <View style={styles.uploadIconContainer}>
            <MaterialCommunityIcons
              name="cloud-upload-outline"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.uploadTextContainer}>
            <Text style={styles.uploadTitle}>Upload Your Pet</Text>
            <Text style={styles.uploadSubtitle}>
              Share your pet and find a loving home
            </Text>
          </View>

          <Ionicons
            name="arrow-forward-circle"
            size={27}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* CATEGORIES */}
        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((category) => {
            const active =
              selectedCategory === category.name;

            return (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryButton,
                  active && styles.categoryActive,
                ]}
                onPress={() =>
                  setSelectedCategory(category.name)
                }
              >
                <MaterialCommunityIcons
                  name={category.icon}
                  size={18}
                  color={active ? '#FFFFFF' : COLORS.primary}
                />

                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* PET COUNT */}
        <View style={styles.resultHeader}>
          <Text style={styles.sectionTitle}>
            Available Pets
          </Text>

          <Text style={styles.resultCount}>
            {loading
              ? 'Loading...'
              : `${filteredPets.length} pets found`}
          </Text>
        </View>

        {/* LOADING */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.accent}
            />

            <Text style={styles.loadingText}>
              Loading pets...
            </Text>
          </View>
        )}

        {/* ERROR */}
        {!loading && error !== '' && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="wifi-off"
              size={45}
              color={COLORS.gray}
            />

            <Text style={styles.emptyTitle}>
              Something went wrong
            </Text>

            <Text style={styles.emptyText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchAnimals}
            >
              <Text style={styles.retryButtonText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PET GRID */}
        {!loading && error === '' && (
          <View style={styles.petGrid}>
            {filteredPets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                activeOpacity={0.85}
                onPress={() => openDetail(pet)}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={
                      pet.image
                        ? { uri: pet.image }
                        : undefined
                    }
                    style={styles.petImage}
                    resizeMode="cover"
                  />

                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {pet.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.petInfo}>
                  <View style={styles.petNameRow}>
                    <Text style={styles.petName}>
                      {pet.name}
                    </Text>

                    <Ionicons
                      name={
                        pet.gender?.toLowerCase() === 'male'
                          ? 'male'
                          : 'female'
                      }
                      size={16}
                      color={COLORS.accent}
                    />
                  </View>

                  <Text style={styles.petBreed}>
                    {pet.breed}
                  </Text>

                  <View style={styles.metadata}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color={COLORS.gray}
                    />

                    <Text style={styles.metadataText}>
                      {pet.age || 'Age not specified'}
                    </Text>
                  </View>

                  <View style={styles.metadata}>
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={COLORS.gray}
                    />

                    <Text style={styles.metadataText}>
                      {pet.location || 'Location not specified'}
                    </Text>
                  </View>

                  <View style={styles.detailLink}>
                    <Text style={styles.detailLinkText}>
                      View Details
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={COLORS.accent}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          error === '' &&
          filteredPets.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="paw-off"
                size={45}
                color={COLORS.gray}
              />

              <Text style={styles.emptyTitle}>
                No pets found
              </Text>

              <Text style={styles.emptyText}>
                Try another keyword or category.
              </Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingTop: 55,
    paddingBottom: 35,
  },

  header: {
    paddingHorizontal: 22,
    marginBottom: 22,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.primary,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 6,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    marginHorizontal: 22,
    paddingHorizontal: 15,
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    fontSize: 12,
    marginLeft: 10,
    color: COLORS.text,
  },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    marginHorizontal: 22,
    marginBottom: 25,
    padding: 14,
    borderRadius: 15,
  },

  uploadIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  uploadSubtitle: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
    opacity: 0.9,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },

  categoryHeader: {
    marginHorizontal: 22,
  },

  categoryList: {
    paddingHorizontal: 22,
    gap: 9,
    paddingTop: 14,
    paddingBottom: 25,
  },

  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },

  categoryActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  categoryTextActive: {
    color: COLORS.background,
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 15,
  },

  resultCount: {
    fontSize: 11,
    color: COLORS.gray,
  },

  petGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    rowGap: 15,
  },

  petCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
  },

  imageContainer: {
    height: 135,
    backgroundColor: COLORS.secondary,
  },

  petImage: {
    width: '100%',
    height: '100%',
  },

  categoryBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    backgroundColor: COLORS.background,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
  },

  petInfo: {
    padding: 10,
  },

  petNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  petName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
  },

  petBreed: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: 9,
  },

  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },

  metadataText: {
    fontSize: 10,
    color: COLORS.gray,
    flex: 1,
  },

  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 7,
    paddingTop: 9,
  },

  detailLinkText: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    padding: 35,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
  },

  emptyText: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 5,
    textAlign: 'center',
  },

  loadingContainer: {
    alignItems: 'center',
    padding: 35,
  },

  loadingText: {
    color: COLORS.gray,
    marginTop: 12,
    fontSize: 12,
  },

  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
