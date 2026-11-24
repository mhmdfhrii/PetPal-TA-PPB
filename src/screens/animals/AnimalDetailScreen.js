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
import { useFavorites } from '../../context/FavoritesContext';

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F5F5F5',
  gray: '#999999',
  text: '#222222',
  green: '#22A06B',
  red: '#E5484D',
};

export default function AnimalDetailScreen({ navigation, route }) {
  const animal = route.params?.animal;

  const { toggleFavorite, isFavorite } = useFavorites();

  if (!animal) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.notFound}>
          <Ionicons
            name="paw-outline"
            size={45}
            color={COLORS.gray}
          />

          <Text style={styles.notFoundText}>
            Animal data not found.
          </Text>

          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToListText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const favorite = isFavorite(animal.id);
  const available = animal.is_available !== false;

  const handleFavorite = () => {
    toggleFavorite(animal);
  };

  // =================================
  // ADOPTION
  // =================================

  const handleAdopt = () => {
    if (!available) {
      Alert.alert(
        'Pet Unavailable',
        `${animal.name} is currently not available for adoption.`
      );
      return;
    }

    navigation.navigate('AdoptionForm', {
      animal: animal,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          {animal.image || animal.image_url ? (
            <Image
              source={{
                uri: animal.image || animal.image_url,
              }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="paw"
                size={65}
                color={COLORS.gray}
              />
              <Text style={styles.placeholderText}>
                No image available
              </Text>
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

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
            activeOpacity={0.7}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={23}
              color={COLORS.accent}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>
                {animal.name || 'Unknown Pet'}
              </Text>

              <Text style={styles.breed}>
                {animal.breed || 'Breed not specified'}
              </Text>
            </View>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {animal.category || 'Pet'}
              </Text>
            </View>
          </View>

          <View style={styles.availabilityRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: available
                    ? COLORS.green
                    : COLORS.red,
                },
              ]}
            />

            <Text
              style={[
                styles.availabilityText,
                {
                  color: available
                    ? COLORS.green
                    : COLORS.red,
                },
              ]}
            >
              {available
                ? 'Available for Adoption'
                : 'Not Available'}
            </Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={COLORS.accent}
              />
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>
                {animal.age || 'Not specified'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons
                name={
                  animal.gender === 'Male'
                    ? 'male'
                    : animal.gender === 'Female'
                      ? 'female'
                      : 'help-circle-outline'
                }
                size={22}
                color={COLORS.accent}
              />
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {animal.gender || 'Unknown'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons
                name="location-outline"
                size={22}
                color={COLORS.accent}
              />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {animal.location || 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              About {animal.name || 'This Pet'}
            </Text>

            <Text style={styles.description}>
              {animal.description ||
                'No description is available for this pet yet.'}
            </Text>
          </View>

          {animal.shelters && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shelter Penampungan</Text>
              <TouchableOpacity
                style={styles.shelterCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('ShelterDetail', {
                    shelter: animal.shelters,
                  })
                }
              >
                <View style={styles.shelterIconBox}>
                  <Ionicons name="business" size={22} color={COLORS.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shelterCardName}>
                    {animal.shelters.name}
                  </Text>
                  <Text style={styles.shelterCardLocation}>
                    📍 {animal.shelters.location || animal.location}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.noteCard}>
            <Ionicons
              name="heart"
              size={21}
              color={COLORS.accent}
            />

            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>
                Give {animal.name} a loving home
              </Text>

              <Text style={styles.noteText}>
                Every pet deserves a safe, comfortable, and loving
                family.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.adoptButton,
            !available && styles.adoptButtonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleAdopt}
          disabled={!available}
        >
          <Text style={styles.adoptButtonText}>
            {available
              ? `Adopt ${animal.name}`
              : 'Currently Unavailable'}
          </Text>

          <Ionicons
            name={available ? 'arrow-forward' : 'close-circle-outline'}
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
    paddingBottom: 15,
  },
  imageContainer: {
    height: 330,
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
  placeholderText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 25,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.primary,
  },
  breed: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 5,
  },
  categoryBadge: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '700',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 9,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    paddingHorizontal: 4,
    borderRadius: 13,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    lineHeight: 22,
    color: COLORS.gray,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 15,
    borderRadius: 14,
    marginTop: 25,
    gap: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  noteText: {
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.gray,
    marginTop: 5,
  },
  bottomContainer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: COLORS.background,
  },
  adoptButton: {
    height: 52,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  adoptButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  adoptButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 12,
  },
  backToListButton: {
    marginTop: 20,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 20,
  },
  backToListText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shelterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  shelterIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shelterCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  shelterCardLocation: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
});
