
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons
            name="paw"
            size={55}
            color="#FF6268"
          />
        </View>

        <Text style={styles.appName}>PetPal</Text>
        <Text style={styles.tagline}>
          Find your new best friend
        </Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About PetPal</Text>
        <Text style={styles.description}>
          PetPal merupakan aplikasi direktori dan adopsi hewan
          peliharaan yang membantu pengguna menemukan hewan
          yang membutuhkan rumah baru.
        </Text>
        <Text style={styles.description}>
          Melalui PetPal, pengguna dapat melihat berbagai
          informasi hewan, menemukan shelter, menyimpan hewan
          favorit, dan mendapatkan informasi untuk proses adopsi.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Our Features</Text>

        <FeatureItem
          icon="paw"
          title="Pet Directory"
          description="Melihat berbagai hewan yang tersedia untuk diadopsi."
        />

        <FeatureItem
          icon="home-heart"
          title="Shelter Directory"
          description="Menemukan shelter dan informasi tempat penampungan hewan."
        />

        <FeatureItem
          icon="heart"
          title="Favorites"
          description="Menyimpan hewan yang disukai."
        />

        <FeatureItem
          icon="magnify"
          title="Search & Filter"
          description="Mencari hewan berdasarkan nama, ras, dan kategori."
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Developer</Text>
        <Text style={styles.developerName}>
          Muhammad Fahri Sani
        </Text>
        <Text style={styles.description}>
          Computer Engineering Student
        </Text>
        <Text style={styles.description}>
          Universitas Diponegoro
        </Text>
      </View>

      <Text style={styles.footer}>
        Made with love for every pet ❤️
      </Text>
    </ScrollView>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={23}
          color="#FF6268"
        />
      </View>

      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 35,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
  },
  tagline: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },
  version: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 21,
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  featureDescription: {
    fontSize: 12,
    color: '#888888',
    marginTop: 3,
    lineHeight: 18,
  },
  developerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  footer: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 12,
    marginVertical: 25,
  },
});
