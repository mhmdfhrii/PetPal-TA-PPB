
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F5F5F5',
  gray: '#999999',
  text: '#222222',
};

export default function ShelterDetailScreen({ navigation, route }) {
  const shelter = route.params?.shelter;

  if (!shelter) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.notFoundContainer}>
          <Ionicons
            name="business-outline"
            size={50}
            color={COLORS.gray}
          />

          <Text style={styles.notFoundText}>
            Shelter data not found.
          </Text>

          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToListText}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Mengambil informasi shelter
  const shelterName = shelter.name || 'Unnamed Shelter';
  const shelterLocation = shelter.location || 'Location not available';
  const shelterDescription =
    shelter.description || 'No description available.';
  const shelterImage = shelter.image || shelter.image_url;
  const shelterPhone = shelter.phone || shelter.contact || '-';
  const shelterAddress = shelter.address || shelter.location || '-';
  const shelterPets = shelter.pets ?? 0;
  const shelterFacilities = Array.isArray(shelter.facilities)
    ? shelter.facilities
    : [];

  // Navigasi ke katalog Animals
  const handleViewPets = () => {
    navigation.navigate('Main', {
      screen: 'Animals',
    });
  };

  // Menampilkan kontak shelter
  const handleContact = () => {
    if (shelterPhone === '-') {
      Alert.alert(
        'Contact Unavailable',
        'Contact information is not available for this shelter.'
      );
      return;
    }

    Alert.alert(
      'Contact Shelter',
      `Contact ${shelterName} at ${shelterPhone}`
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* COVER IMAGE */}
        <View style={styles.imageContainer}>
          {shelterImage ? (
            <Image
              source={{ uri: shelterImage }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="image-outline"
                size={55}
                color={COLORS.gray}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* SHELTER INFORMATION */}
        <View style={styles.content}>
          <Text style={styles.name}>
            {shelterName}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={17}
              color={COLORS.accent}
            />

            <Text style={styles.locationText}>
              {shelterLocation}
            </Text>
          </View>

          {/* PET COUNT */}
          <View style={styles.statsCard}>
            <View style={styles.statsIcon}>
              <Ionicons
                name="paw"
                size={23}
                color={COLORS.accent}
              />
            </View>

            <View>
              <Text style={styles.statsNumber}>
                {shelterPets}
              </Text>

              <Text style={styles.statsLabel}>
                Pets Available
              </Text>
            </View>
          </View>

          {/* ABOUT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              About Shelter
            </Text>

            <Text style={styles.description}>
              {shelterDescription}
            </Text>
          </View>

          {/* ADDRESS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Address
            </Text>

            <View style={styles.infoCard}>
              <Ionicons
                name="location"
                size={21}
                color={COLORS.accent}
              />

              <Text style={styles.infoText}>
                {shelterAddress}
              </Text>
            </View>
          </View>

          {/* PHONE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Contact
            </Text>

            <TouchableOpacity
              style={styles.infoCard}
              activeOpacity={0.75}
              onPress={handleContact}
            >
              <Ionicons
                name="call-outline"
                size={21}
                color={COLORS.accent}
              />

              <Text style={styles.infoText}>
                {shelterPhone}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={17}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>

          {/* FACILITIES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Our Facilities
            </Text>

            {shelterFacilities.length > 0 ? (
              <View style={styles.facilityList}>
                {shelterFacilities.map((facility, index) => (
                  <View
                    key={index}
                    style={styles.facilityItem}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={17}
                      color={COLORS.accent}
                    />

                    <Text style={styles.facilityText}>
                      {facility}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noFacilities}>
                Facility information is not available yet.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BUTTON */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.viewPetsButton}
          activeOpacity={0.85}
          onPress={handleViewPets}
        >
          <Text style={styles.buttonText}>
            View Available Pets
          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  imageContainer: {
    height: 280,
    backgroundColor: COLORS.secondary,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 23,
    paddingBottom: 30,
  },

  name: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.primary,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 9,
  },

  locationText: {
    fontSize: 12,
    color: COLORS.gray,
  },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 14,
    marginTop: 24,
    gap: 13,
  },

  statsIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#FFF0F0',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsNumber: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primary,
  },

  statsLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 3,
  },

  section: {
    marginTop: 27,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
  },

  description: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 21,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 12,
    gap: 11,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },

  facilityList: {
    gap: 13,
  },

  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  facilityText: {
    fontSize: 12,
    color: COLORS.text,
  },

  noFacilities: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 20,
  },

  bottomContainer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: COLORS.background,
  },

  viewPetsButton: {
    height: 52,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  notFoundText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 15,
  },

  backToListButton: {
    marginTop: 20,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  backToListText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '700',
  },
});
