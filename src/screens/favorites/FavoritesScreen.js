
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../context/FavoritesContext';

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F5F5F5',
  gray: '#999999',
};

export default function FavoritesScreen({ navigation }) {
  const { favorites, toggleFavorite, isLoaded } = useFavorites();

  const openDetail = (animal) => {
    navigation.navigate('AnimalDetail', { animal });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Favorites</Text>

          <Text style={styles.subtitle}>
            Your favorite animal companions
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Saved Pets
          </Text>

          <Text style={styles.count}>
            {favorites.length} pets
          </Text>
        </View>

        {!isLoaded ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Loading your favorites...
            </Text>
          </View>
        ) : favorites.length > 0 ? (
          <View style={styles.petList}>
            {favorites.map((animal) => (
              <TouchableOpacity
                key={animal.id}
                style={styles.petCard}
                activeOpacity={0.85}
                onPress={() => openDetail(animal)}
              >
                <Image
                  source={{
                    uri: animal.image || animal.image_url,
                  }}
                  style={styles.petImage}
                />

                <View style={styles.petInfo}>
                  <Text style={styles.petName}>
                    {animal.name}
                  </Text>

                  <Text style={styles.petBreed}>
                    {animal.breed}
                  </Text>

                  <View style={styles.metadata}>
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={COLORS.gray}
                    />

                    <Text style={styles.metadataText}>
                      {animal.location || 'Location unavailable'}
                    </Text>
                  </View>

                  <Text style={styles.detailText}>
                    View Details →
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  activeOpacity={0.7}
                  onPress={() => toggleFavorite(animal)}
                >
                  <Ionicons
                    name="heart"
                    size={22}
                    color={COLORS.accent}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="heart-outline"
                size={45}
                color={COLORS.accent}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Favorites Yet
            </Text>

            <Text style={styles.emptyText}>
              You haven't saved any pets yet.
              Find your favorite companion and
              tap the heart icon!
            </Text>

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Animals')}
            >
              <Text style={styles.exploreButtonText}>
                Explore Pets
              </Text>
            </TouchableOpacity>
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
    marginBottom: 25,
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

  count: {
    fontSize: 11,
    color: COLORS.gray,
  },

  petList: {
    paddingHorizontal: 22,
    gap: 13,
  },

  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 15,
    padding: 10,
    backgroundColor: COLORS.background,
  },

  petImage: {
    width: 105,
    height: 110,
    borderRadius: 11,
    backgroundColor: COLORS.secondary,
  },

  petInfo: {
    flex: 1,
    marginLeft: 13,
  },

  petName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },

  petBreed: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 5,
  },

  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 9,
  },

  metadataText: {
    fontSize: 10,
    color: COLORS.gray,
  },

  detailText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    marginTop: 10,
  },

  removeButton: {
    padding: 8,
  },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 35,
    paddingTop: 65,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 20,
  },

  emptyText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 9,
  },

  exploreButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 13,
    marginTop: 22,
  },

  exploreButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
