
import React, { useEffect, useState } from 'react';

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

import { Ionicons } from '@expo/vector-icons';

import { getShelters } from '../../services/api';

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F5F5F5',
  gray: '#999999',
  text: '#222222',
};

export default function ShelterScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Mengambil data shelter dari REST API
  const fetchShelters = async () => {
    try {
      setLoading(true);
      setError(false);

      const data = await getShelters();

      const formattedShelters = data.map((shelter) => ({
        ...shelter,
        image: shelter.image_url,
        location: shelter.location || 'Location not available',
        description:
          shelter.description || 'No description available.',
        phone: shelter.contact || '-',
        address: shelter.location || '-',
        pets: 0,
        facilities: [],
      }));

      setShelters(formattedShelters);
    } catch (err) {
      console.error('Fetch Shelters Error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  // Fitur pencarian shelter
  const filteredShelters = shelters.filter((shelter) => {
    const keyword = search.trim().toLowerCase();

    return (
      shelter.name.toLowerCase().includes(keyword) ||
      shelter.location.toLowerCase().includes(keyword)
    );
  });

  // Membuka halaman detail shelter
  const openDetail = (shelter) => {
    navigation.navigate('ShelterDetail', {
      shelter,
    });
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
          <Text style={styles.title}>Find Shelters</Text>

          <Text style={styles.subtitle}>
            Discover shelters and help animals find a home
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
            placeholder="Search shelter or location..."
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

        {/* SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Nearby Shelters
          </Text>

          <Text style={styles.resultCount}>
            {loading ? 'Loading...' : `${filteredShelters.length} shelters found`}
          </Text>
        </View>

        {/* LOADING */}
        {loading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.accent}
            />

            <Text style={styles.stateText}>
              Loading shelters...
            </Text>
          </View>
        )}

        {/* ERROR */}
        {!loading && error && (
          <View style={styles.stateContainer}>
            <Ionicons
              name="cloud-offline-outline"
              size={45}
              color={COLORS.gray}
            />

            <Text style={styles.emptyTitle}>
              Failed to load shelters
            </Text>

            <Text style={styles.stateText}>
              Check your internet connection and try again.
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
        {!loading && !error && (
          <View style={styles.shelterList}>
            {filteredShelters.map((shelter) => (
              <TouchableOpacity
                key={shelter.id}
                style={styles.shelterCard}
                activeOpacity={0.85}
                onPress={() => openDetail(shelter)}
              >
                <View style={styles.imageContainer}>
                  {shelter.image ? (
                    <Image
                      source={{ uri: shelter.image }}
                      style={styles.shelterImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={40}
                        color={COLORS.gray}
                      />
                    </View>
                  )}

                  <View style={styles.petBadge}>
                    <Ionicons
                      name="paw"
                      size={12}
                      color={COLORS.accent}
                    />

                    <Text style={styles.petBadgeText}>
                      {shelter.pets} pets
                    </Text>
                  </View>
                </View>

                <View style={styles.shelterInfo}>
                  <Text style={styles.shelterName}>
                    {shelter.name}
                  </Text>

                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={15}
                      color={COLORS.gray}
                    />

                    <Text style={styles.locationText}>
                      {shelter.location}
                    </Text>
                  </View>

                  <Text
                    style={styles.description}
                    numberOfLines={2}
                  >
                    {shelter.description}
                  </Text>

                  <View style={styles.detailLink}>
                    <Text style={styles.detailLinkText}>
                      View Shelter
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color={COLORS.accent}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredShelters.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="business-outline"
              size={45}
              color={COLORS.gray}
            />

            <Text style={styles.emptyTitle}>
              No shelters found
            </Text>

            <Text style={styles.emptyText}>
              Try another shelter name or location.
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
    marginBottom: 27,
  },

  searchInput: {
    flex: 1,
    fontSize: 12,
    marginLeft: 10,
    color: COLORS.text,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },

  resultCount: {
    fontSize: 11,
    color: COLORS.gray,
  },

  shelterList: {
    paddingHorizontal: 22,
    gap: 16,
  },

  shelterCard: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },

  imageContainer: {
    height: 190,
    backgroundColor: COLORS.secondary,
  },

  shelterImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  petBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.background,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  petBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },

  shelterInfo: {
    padding: 15,
  },

  shelterName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },

  locationText: {
    fontSize: 11,
    color: COLORS.gray,
  },

  description: {
    fontSize: 11,
    color: COLORS.gray,
    lineHeight: 18,
    marginTop: 10,
  },

  detailLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 13,
    paddingTop: 12,
  },

  detailLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },

  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 35,
  },

  stateText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 10,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 18,
  },

  retryButtonText: {
    color: COLORS.background,
    fontSize: 12,
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
});
