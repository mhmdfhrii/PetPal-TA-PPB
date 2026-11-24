
import React, { useState, useEffect } from 'react';

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

import {
  getAnimals,
  getShelters,
} from '../../services/api';

import { useFavorites } from '../../context/FavoritesContext';

// =================================
// COLORS
// =================================

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F5F5F5',
  gray: '#999999',
  text: '#222222',
};

// =================================
// CATEGORIES
// =================================

const CATEGORIES = [
  { name: 'Dog', icon: 'dog' },
  { name: 'Cat', icon: 'cat' },
  { name: 'Rabbit', icon: 'rabbit' },
  { name: 'Bird', icon: 'bird' },
];

// =================================
// MAIN HOME SCREEN
// =================================

export default function HomeScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('Dog');
  const [search, setSearch] = useState('');

  // FAVORITES CONTEXT
  const { toggleFavorite, isFavorite } = useFavorites();

  // ANIMALS API DATA
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [errorPets, setErrorPets] = useState('');

  // SHELTERS API DATA
  const [shelters, setShelters] = useState([]);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [errorShelters, setErrorShelters] = useState('');

  // =================================
  // FETCH ANIMALS FROM API
  // =================================

  const fetchAnimals = async () => {
    try {
      setLoadingPets(true);
      setErrorPets('');

      const data = await getAnimals();

      const formattedPets = data
        .filter((pet) => pet.is_available !== false)
        .map((pet) => ({
          ...pet,
          image: pet.image_url,
        }));

      setPets(formattedPets);
    } catch (err) {
      console.error('Home fetch animals error:', err);
      setErrorPets('Gagal memuat data hewan.');
    } finally {
      setLoadingPets(false);
    }
  };

  // =================================
  // FETCH SHELTERS FROM API
  // =================================

  const fetchShelters = async () => {
    try {
      setLoadingShelters(true);
      setErrorShelters('');

      const data = await getShelters();

      const formattedShelters = data.map((shelter) => ({
        ...shelter,
        image: shelter.image_url,
      }));

      setShelters(formattedShelters);
    } catch (err) {
      console.error('Home fetch shelters error:', err);
      setErrorShelters('Gagal memuat data shelter.');
    } finally {
      setLoadingShelters(false);
    }
  };

  // =================================
  // LOAD DATA
  // =================================

  useEffect(() => {
    fetchAnimals();
    fetchShelters();
  }, []);

  // =================================
  // SEARCH AND CATEGORY FILTER
  // =================================

  const filteredPets = pets.filter((pet) => {
    const keyword = search.trim().toLowerCase();

    const matchesCategory =
      keyword !== '' ||
      selectedCategory === 'All' ||
      pet.category === selectedCategory;

    const matchesSearch =
      (pet.name || '').toLowerCase().includes(keyword) ||
      (pet.breed || '').toLowerCase().includes(keyword);

    return matchesCategory && matchesSearch;
  });

  // =================================
  // NAVIGATION
  // =================================

  const openAnimals = () => {
    navigation.navigate('Animals');
  };

  const openShelters = () => {
    navigation.navigate('Shelters');
  };

  // =================================
  // TOGGLE FAVORITE
  // =================================

  const handleFavorite = (pet) => {
    toggleFavorite(pet);
  };

  // =================================
  // RENDER
  // =================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, Pet Lover 👋
            </Text>

            <Text style={styles.welcome}>
              Find your new best friend!
            </Text>

            <TouchableOpacity style={styles.location}>
              <Ionicons
                name="location"
                size={15}
                color={COLORS.accent}
              />

              <Text style={styles.locationText}>
                Semarang, Indonesia
              </Text>

              <Ionicons
                name="chevron-down"
                size={14}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.avatar}>
            <Ionicons
              name="person"
              size={26}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={21}
            color={COLORS.gray}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search your favorite pet..."
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

          <TouchableOpacity onPress={openAnimals}>
            <Ionicons
              name="options-outline"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* CATEGORIES */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Pet Categories
          </Text>

          <TouchableOpacity
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={styles.seeAll}>
              All
            </Text>
          </TouchableOpacity>
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
                  color={
                    active ? '#FFFFFF' : COLORS.primary
                  }
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

        {/* FEATURED PETS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Featured Pets
            </Text>

            <Text style={styles.sectionSubtitle}>
              Meet your future companion
            </Text>
          </View>

          <TouchableOpacity onPress={openAnimals}>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {/* PET LOADING */}

        {loadingPets && (
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

        {/* PET ERROR */}

        {!loadingPets && errorPets !== '' && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="wifi-off"
              size={40}
              color={COLORS.gray}
            />

            <Text style={styles.emptyText}>
              {errorPets}
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

        {/* FEATURED PET LIST */}

        {!loadingPets && errorPets === '' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petList}
          >
            {filteredPets.map((pet) => {
              const favorite = isFavorite(pet.id);

              return (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petCard}
                  activeOpacity={0.85}
                  onPress={openAnimals}
                >
                  <View style={styles.petImageContainer}>
                    {pet.image ? (
                      <Image
                        source={{ uri: pet.image }}
                        style={styles.petImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons
                          name="paw"
                          size={35}
                          color={COLORS.gray}
                        />
                      </View>
                    )}

                    {/* FAVORITE BUTTON */}

                    <TouchableOpacity
                      style={styles.favoriteButton}
                      activeOpacity={0.7}
                      onPress={(event) => {
                        event.stopPropagation();
                        handleFavorite(pet);
                      }}
                    >
                      <Ionicons
                        name={
                          favorite
                            ? 'heart'
                            : 'heart-outline'
                        }
                        size={20}
                        color={COLORS.accent}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.petInfo}>
                    <View style={styles.petNameRow}>
                      <Text style={styles.petName}>
                        {pet.name}
                      </Text>

                      {pet.gender && (
                        <Ionicons
                          name={
                            pet.gender === 'Male'
                              ? 'male'
                              : 'female'
                          }
                          size={16}
                          color={COLORS.accent}
                        />
                      )}
                    </View>

                    <Text style={styles.petBreed}>
                      {pet.breed}
                    </Text>

                    <View style={styles.petMetadata}>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color={COLORS.gray}
                      />

                      <Text style={styles.metadataText}>
                        {pet.age || 'Age not specified'}
                      </Text>

                      <Ionicons
                        name="location-outline"
                        size={13}
                        color={COLORS.gray}
                      />

                      <Text style={styles.metadataText}>
                        {pet.location || 'Location not specified'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* PET EMPTY STATE */}

        {!loadingPets &&
          errorPets === '' &&
          filteredPets.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="paw-outline"
                size={35}
                color={COLORS.gray}
              />

              <Text style={styles.emptyText}>
                No pets found.
              </Text>
            </View>
          )}

        {/* NEARBY SHELTERS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Nearby Shelters
            </Text>

            <Text style={styles.sectionSubtitle}>
              Find shelters around you
            </Text>
          </View>

          <TouchableOpacity onPress={openShelters}>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {/* SHELTER LOADING */}

        {loadingShelters && (
          <View style={styles.shelterLoading}>
            <ActivityIndicator
              size="small"
              color={COLORS.accent}
            />

            <Text style={styles.loadingText}>
              Loading shelters...
            </Text>
          </View>
        )}

        {/* SHELTER ERROR */}

        {!loadingShelters && errorShelters !== '' && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="wifi-off"
              size={35}
              color={COLORS.gray}
            />

            <Text style={styles.emptyText}>
              {errorShelters}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchShelters}
            >
              <Text style={styles.retryButtonText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SHELTER LIST */}

        {!loadingShelters &&
          errorShelters === '' &&
          shelters.length > 0 && (
            <View style={styles.shelterList}>
              {shelters.map((shelter) => (
                <TouchableOpacity
                  key={shelter.id}
                  style={styles.shelterCard}
                  activeOpacity={0.85}
                  onPress={openShelters}
                >
                  {shelter.image ? (
                    <Image
                      source={{ uri: shelter.image }}
                      style={styles.shelterImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.shelterImagePlaceholder}>
                      <Ionicons
                        name="home"
                        size={25}
                        color={COLORS.gray}
                      />
                    </View>
                  )}

                  <View style={styles.shelterInfo}>
                    <Text style={styles.shelterName}>
                      {shelter.name}
                    </Text>

                    <View style={styles.shelterLocation}>
                      <Ionicons
                        name="location-outline"
                        size={13}
                        color={COLORS.gray}
                      />

                      <Text style={styles.shelterLocationText}>
                        {shelter.location}
                      </Text>
                    </View>

                    <Text style={styles.shelterPetCount}>
                      {shelter.contact
                        ? `Contact: ${shelter.contact}`
                        : 'Pet adoption center'}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

        {/* SHELTER EMPTY STATE */}

        {!loadingShelters &&
          errorShelters === '' &&
          shelters.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="home-outline"
                size={35}
                color={COLORS.gray}
              />

              <Text style={styles.emptyText}>
                No shelters available.
              </Text>
            </View>
          )}

        {/* FOOTER */}

        <View style={styles.footer}>
          <Ionicons
            name="paw"
            size={17}
            color={COLORS.accent}
          />

          <Text style={styles.footerText}>
            Made with love by PetPal
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

// =================================
// STYLES
// =================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingTop: 55,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 25,
  },

  greeting: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
  },

  welcome: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.primary,
  },

  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },

  locationText: {
    fontSize: 12,
    color: COLORS.gray,
  },

  avatar: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.secondary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 53,
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    marginHorizontal: 22,
    paddingHorizontal: 15,
    marginBottom: 27,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    marginLeft: 10,
    color: COLORS.text,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 15,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 5,
  },

  seeAll: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '700',
  },

  categoryList: {
    paddingHorizontal: 22,
    gap: 10,
    paddingBottom: 27,
  },

  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 25,
  },

  categoryActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  categoryTextActive: {
    color: COLORS.background,
  },

  petList: {
    paddingHorizontal: 22,
    gap: 15,
    paddingBottom: 28,
  },

  petCard: {
    width: 235,
    backgroundColor: COLORS.background,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
  },

  petImageContainer: {
    height: 185,
    backgroundColor: COLORS.secondary,
  },

  petImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  petInfo: {
    padding: 13,
  },

  petNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  petName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },

  petBreed: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 5,
  },

  petMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
  },

  metadataText: {
    fontSize: 10,
    color: COLORS.gray,
    marginRight: 5,
  },

  emptyState: {
    alignItems: 'center',
    padding: 30,
  },

  emptyText: {
    color: COLORS.gray,
    marginTop: 10,
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

  shelterLoading: {
    alignItems: 'center',
    padding: 25,
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

  shelterList: {
    paddingHorizontal: 22,
    gap: 12,
  },

  shelterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 15,
  },

  shelterImage: {
    width: 75,
    height: 75,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
  },

  shelterImagePlaceholder: {
    width: 75,
    height: 75,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shelterInfo: {
    flex: 1,
    marginLeft: 13,
  },

  shelterName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  shelterLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },

  shelterLocationText: {
    fontSize: 10,
    color: COLORS.gray,
  },

  shelterPetCount: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: 7,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 7,
  },

  footerText: {
    color: COLORS.gray,
    fontSize: 11,
  },
});
