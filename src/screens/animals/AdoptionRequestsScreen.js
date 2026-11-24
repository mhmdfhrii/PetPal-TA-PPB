import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getAdoptionRequests } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F5F5F5',
  text: '#222222',
  gray: '#999999',
  border: '#EEEEEE',
};

export default function AdoptionRequestsScreen({ navigation }) {
  const { session } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadRequests = useCallback(async (showError = true) => {
    if (!session?.access_token) {
      setLoading(false);

      if (showError) {
        Alert.alert(
          'Sesi tidak ditemukan',
          'Silakan login kembali untuk melihat riwayat adopsi.'
        );
      }

      return;
    }

    try {
      setLoading(true);

      const data = await getAdoptionRequests(session.access_token);

      setRequests(data || []);
      setHasLoaded(true);
    } catch (error) {
      if (showError) {
        Alert.alert(
          'Gagal mengambil data',
          error.message ||
            'Terjadi kesalahan saat mengambil riwayat adopsi.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const getStatusStyle = (status) => {
    switch ((status || 'pending').toLowerCase()) {
      case 'approved':
        return {
          backgroundColor: '#E6F7EC',
          color: '#219653',
          label: 'Approved',
        };

      case 'rejected':
        return {
          backgroundColor: '#FDEAEA',
          color: '#E5484D',
          label: 'Rejected',
        };

      default:
        return {
          backgroundColor: '#FFF4DF',
          color: '#D99420',
          label: 'Pending',
        };
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderRequest = (item) => {
    const status = getStatusStyle(item.status);

    return (
      <View key={item.id.toString()} style={styles.requestCard}>
        <View style={styles.requestTop}>
          <Text style={styles.requestDate}>
            {formatDate(item.created_at)}
          </Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status.backgroundColor },
            ]}
          >
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.animalRow}>
          {item.animals?.image_url ? (
            <Image
              source={{ uri: item.animals.image_url }}
              style={styles.animalImage}
            />
          ) : (
            <View style={[styles.animalImage, styles.imagePlaceholder]}>
              <Ionicons name="paw" size={28} color={COLORS.accent} />
            </View>
          )}

          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>
              {item.animals?.name || 'Hewan'}
            </Text>

            <Text style={styles.animalBreed}>
              {item.animals?.breed || item.animals?.category || '-'}
            </Text>

            <Text style={styles.applicantName}>
              Pemohon: {item.applicant_name || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{item.email || '-'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{item.phone || '-'}</Text>
        </View>

        <View style={styles.statusDescription}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color={status.color}
          />

          <Text
            style={[
              styles.statusDescriptionText,
              { color: status.color },
            ]}
          >
            {status.label === 'Pending'
              ? 'Pengajuan kamu sedang menunggu proses peninjauan.'
              : status.label === 'Approved'
              ? 'Pengajuan adopsi kamu telah disetujui.'
              : 'Pengajuan adopsi kamu belum disetujui.'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={23} color={COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Adoption Requests</Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadRequests()}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons
            name="refresh-outline"
            size={21}
            color={loading ? COLORS.gray : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Adoption History</Text>

        <Text style={styles.subtitle}>
          Lihat perkembangan pengajuan adopsi hewan yang pernah kamu kirim.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={COLORS.accent}
            />
          </View>

          <Text style={styles.infoText}>
            Riwayat ini hanya menampilkan pengajuan yang dibuat melalui akun
            kamu.
          </Text>
        </View>

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Your Requests</Text>

          <Text style={styles.resultCount}>
            {requests.length} pengajuan
          </Text>
        </View>

        {loading && !hasLoaded ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>
              Memuat riwayat pengajuan...
            </Text>
          </View>
        ) : (
          <>
            {hasLoaded && requests.length === 0 && (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={35}
                    color={COLORS.accent}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  Belum Ada Pengajuan
                </Text>

                <Text style={styles.emptyText}>
                  Kamu belum memiliki pengajuan adopsi. Yuk, temukan hewan
                  yang ingin kamu adopsi!
                </Text>
              </View>
            )}

            {requests.map(renderRequest)}
          </>
        )}

        {loading && hasLoaded && (
          <View style={styles.refreshLoading}>
            <ActivityIndicator size="small" color={COLORS.accent} />
            <Text style={styles.loadingText}>Memperbarui data...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  refreshButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 23,
    paddingBottom: 40,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 8,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 22,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4F4',
    borderRadius: 13,
    padding: 14,
    marginBottom: 25,
    gap: 11,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 17,
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },

  resultCount: {
    fontSize: 12,
    color: COLORS.gray,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 55,
  },

  loadingText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 12,
  },

  refreshLoading: {
    alignItems: 'center',
    paddingVertical: 15,
  },

  requestCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
  },

  requestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  requestDate: {
    fontSize: 11,
    color: COLORS.gray,
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  animalImage: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
  },

  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  animalInfo: {
    flex: 1,
    marginLeft: 13,
  },

  animalName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },

  animalBreed: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },

  applicantName: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 7,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    gap: 9,
  },

  detailText: {
    fontSize: 12,
    color: COLORS.text,
  },

  statusDescription: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.secondary,
    borderRadius: 9,
    padding: 11,
    marginTop: 7,
    gap: 8,
  },

  statusDescriptionText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 35,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },

  emptyText: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
});