
import React, { useState, useEffect, useCallback } from 'react';

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
  Modal,
} from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import {
  getAnimals,
  getShelters,
} from '../../services/api';

import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

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
  const { profile, refreshProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Dog');
  const [search, setSearch] = useState('');

  // FILTER MODAL STATE
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedShelterLocation, setAppliedShelterLocation] = useState('All');
  const [appliedShelterSort, setAppliedShelterSort] = useState('default');

  // TEMPORARY FILTER STATE FOR MODAL
  const [tempCategory, setTempCategory] = useState('Dog');
  const [tempShelterLocation, setTempShelterLocation] = useState('All');
  const [tempShelterSort, setTempShelterSort] = useState('default');

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
  // LOAD DATA & SYNC PROFILE
  // =================================

  useEffect(() => {
    fetchAnimals();
    fetchShelters();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (refreshProfile) {
        refreshProfile();
      }
    }, [refreshProfile])
  );

  // =================================
  // DYNAMIC CATEGORIES & LOCATIONS
  // =================================

  const availableCategories = ['All', 'Dog', 'Cat', 'Rabbit', 'Bird'];
  pets.forEach((pet) => {
    if (
      pet.category &&
      !availableCategories.some(
        (c) => c.toLowerCase() === pet.category.toLowerCase()
      )
    ) {
      availableCategories.push(pet.category);
    }
  });

  const availableShelterLocations = ['All'];
  shelters.forEach((shelter) => {
    if (shelter.location) {
      const loc = shelter.location.trim();
      if (
        loc &&
        !availableShelterLocations.some(
          (l) => l.toLowerCase() === loc.toLowerCase()
        )
      ) {
        availableShelterLocations.push(loc);
      }
    }
  });

  // =================================
  // FILTER MODAL HANDLERS
  // =================================

  const openFilterModal = () => {
    setTempCategory(selectedCategory);
    setTempShelterLocation(appliedShelterLocation);
    setTempShelterSort(appliedShelterSort);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSelectedCategory(tempCategory);
    setAppliedShelterLocation(tempShelterLocation);
    setAppliedShelterSort(tempShelterSort);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setTempCategory('All');
    setTempShelterLocation('All');
    setTempShelterSort('default');
    setSelectedCategory('All');
    setAppliedShelterLocation('All');
    setAppliedShelterSort('default');
    setSearch('');
    setFilterModalVisible(false);
  };

  const isFilterActive =
    selectedCategory !== 'All' ||
    appliedShelterLocation !== 'All' ||
    appliedShelterSort !== 'default';

  // =================================
  // SEARCH AND CATEGORY FILTER (PETS)
  // =================================

  const filteredPets = pets.filter((pet) => {
    const keyword = search.trim().toLowerCase();

    const matchesCategory =
      selectedCategory === 'All' ||
      (pet.category || '').toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      keyword === '' ||
      (pet.name || '').toLowerCase().includes(keyword) ||
      (pet.breed || '').toLowerCase().includes(keyword);

    return matchesCategory && matchesSearch;
  });

  // =================================
  // SHELTER FILTER & SORT
  // =================================

  const filteredShelters = shelters
    .filter((shelter) => {
      if (appliedShelterLocation && appliedShelterLocation !== 'All') {
        const shelterLoc = (shelter.location || '').toLowerCase();
        const targetLoc = appliedShelterLocation.toLowerCase();
        if (!shelterLoc.includes(targetLoc)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (appliedShelterSort === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (appliedShelterSort === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>
              Hello, {profile?.full_name?.split(' ')[0] || 'Pet Lover'} 👋
            </Text>

            <Text style={styles.welcome}>
              Find your new best friend!
            </Text>
          </View>

          <TouchableOpacity
            style={styles.avatar}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}
          >
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons
                name="person"
                size={24}
                color={COLORS.primary}
              />
            )}
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

          <TouchableOpacity
            onPress={openFilterModal}
            style={styles.filterButtonTrigger}
            activeOpacity={0.7}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={isFilterActive ? COLORS.accent : COLORS.primary}
            />
            {isFilterActive && <View style={styles.filterActiveDot} />}
          </TouchableOpacity>
        </View>

        {/* ACTIVE FILTER BADGES */}
        {isFilterActive && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersList}
            >
              <Text style={styles.activeFilterTitle}>Filter Aktif:</Text>

              {selectedCategory !== 'All' && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>
                    Kategori: {selectedCategory}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory('All')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}

              {appliedShelterLocation !== 'All' && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>
                    Lokasi: {appliedShelterLocation}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAppliedShelterLocation('All')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}

              {appliedShelterSort !== 'default' && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>
                    Urut: {appliedShelterSort === 'name_asc' ? 'A-Z' : 'Z-A'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAppliedShelterSort('default')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={resetFilters}
                style={styles.resetFilterButton}
              >
                <Text style={styles.resetFilterText}>Reset Semua</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

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
          filteredShelters.length > 0 && (
            <View style={styles.shelterList}>
              {filteredShelters.map((shelter) => (
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
          filteredShelters.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="home-outline"
                size={35}
                color={COLORS.gray}
              />

              <Text style={styles.emptyText}>
                No shelters found matching criteria.
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

      {/* FILTER & SORT MODAL POPUP */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* MODAL HEADER */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <Text style={styles.modalTitle}>Filter & Urutkan</Text>
                <Text style={styles.modalSubtitle}>
                  Sesuaikan hewan dan shelter yang ingin dicari
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBody}
            >
              {/* FILTER KATEGORI HEWAN */}
              <Text style={styles.filterSectionTitle}>Kategori Hewan</Text>
              <View style={styles.filterPillsRow}>
                {availableCategories.map((cat) => {
                  const isSelected =
                    tempCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.filterPill,
                        isSelected && styles.filterPillActive,
                      ]}
                      onPress={() => setTempCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          isSelected && styles.filterPillTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* FILTER LOKASI SHELTER */}
              <Text style={styles.filterSectionTitle}>Lokasi Shelter</Text>
              <Text style={styles.filterSectionDescription}>
                Pilih lokasi berdasarkan shelter yang tersedia:
              </Text>
              <View style={styles.filterPillsRow}>
                {availableShelterLocations.map((loc) => {
                  const isSelected =
                    tempShelterLocation.toLowerCase() === loc.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={loc}
                      style={[
                        styles.filterPill,
                        isSelected && styles.filterPillActive,
                      ]}
                      onPress={() => setTempShelterLocation(loc)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="location-outline"
                        size={13}
                        color={isSelected ? '#FFFFFF' : COLORS.gray}
                        style={{ marginRight: 3 }}
                      />
                      <Text
                        style={[
                          styles.filterPillText,
                          isSelected && styles.filterPillTextActive,
                        ]}
                      >
                        {loc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* URUTAN SHELTER */}
              <Text style={styles.filterSectionTitle}>Urutkan Shelter</Text>
              <View style={styles.filterPillsRow}>
                {[
                  { label: 'Default', value: 'default' },
                  { label: 'Nama A - Z', value: 'name_asc' },
                  { label: 'Nama Z - A', value: 'name_desc' },
                ].map((sortItem) => {
                  const isSelected = tempShelterSort === sortItem.value;
                  return (
                    <TouchableOpacity
                      key={sortItem.value}
                      style={[
                        styles.filterPill,
                        isSelected && styles.filterPillActive,
                      ]}
                      onPress={() => setTempShelterSort(sortItem.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          isSelected && styles.filterPillTextActive,
                        ]}
                      >
                        {sortItem.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* MODAL FOOTER */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalResetButton}
                onPress={() => {
                  setTempCategory('All');
                  setTempShelterLocation('All');
                  setTempShelterSort('default');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalResetText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={applyFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.modalApplyText}>Terapkan Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },

  greeting: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 4,
    fontWeight: '500',
  },

  welcome: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.primary,
  },

  avatar: {
    width: 46,
    height: 46,
    backgroundColor: COLORS.secondary,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    marginHorizontal: 22,
    paddingHorizontal: 15,
    marginBottom: 16,
  },

  filterButtonTrigger: {
    position: 'relative',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterActiveDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },

  activeFiltersContainer: {
    marginBottom: 18,
  },

  activeFiltersList: {
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 8,
  },

  activeFilterTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginRight: 2,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },

  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  resetFilterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
  },

  resetFilterText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
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

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    paddingBottom: 25,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  modalHeaderTitleBox: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },

  modalSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  modalBody: {
    paddingHorizontal: 22,
    paddingTop: 15,
    paddingBottom: 20,
  },

  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 15,
    marginBottom: 10,
  },

  filterSectionDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 10,
  },

  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  filterPillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },

  filterPillText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },

  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingTop: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  modalResetButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalResetText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray,
  },

  modalApplyButton: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },

  modalApplyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
