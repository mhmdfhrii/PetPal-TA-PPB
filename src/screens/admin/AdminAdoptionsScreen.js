
import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';

import {
  getAdminAdoptions,
  updateAdminAdoptionStatus,
  deleteAdminAdoption,
} from '../../services/api';

const FILTERS = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Diterima', value: 'approved' },
  { label: 'Ditolak', value: 'rejected' },
];

const STATUS_LABELS = {
  pending: 'Menunggu',
  approved: 'Diterima',
  rejected: 'Ditolak',
};

const STATUS_COLORS = {
  pending: {
    background: '#FFF4DF',
    text: '#B7791F',
  },
  approved: {
    background: '#E6F7EC',
    text: '#25834B',
  },
  rejected: {
    background: '#FCE8E8',
    text: '#D94A4A',
  },
};

const formatDate = (dateString) => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminAdoptionsScreen = ({ navigation }) => {
  const { session } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const loadRequests = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const token = session?.access_token;

      if (!token) {
        throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
      }

      const result = await getAdminAdoptions(token);
      setRequests(result.data || []);
    } catch (error) {
      console.error('Load Admin Adoptions Error:', error);

      Alert.alert(
        'Gagal',
        error.message || 'Tidak dapat mengambil pengajuan adopsi.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  const getCount = (status) => {
    if (status === 'all') return requests.length;
    return requests.filter((item) => item.status === status).length;
  };

  const openDetail = (item) => {
    setSelectedRequest(item);
    setDetailVisible(true);
  };

  const handleUpdateStatus = (newStatus) => {
    if (!selectedRequest) return;

    const statusText = STATUS_LABELS[newStatus];

    Alert.alert(
      'Konfirmasi Status',
      `Ubah status pengajuan ini menjadi "${statusText}"?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Ya, Ubah',
          onPress: async () => {
            try {
              setUpdating(true);

              const token = session?.access_token;

              if (!token) {
                throw new Error('Sesi admin tidak ditemukan.');
              }

              await updateAdminAdoptionStatus(
                selectedRequest.id,
                newStatus,
                token
              );

              setDetailVisible(false);
              setSelectedRequest(null);

              await loadRequests(false);

              Alert.alert(
                'Berhasil',
                'Status pengajuan berhasil diperbarui.'
              );
            } catch (error) {
              console.error('Update Adoption Status Error:', error);

              Alert.alert(
                'Gagal',
                error.message || 'Tidak dapat mengubah status pengajuan.'
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Hapus Pengajuan',
      `Apakah kamu yakin ingin menghapus pengajuan dari ${item.applicant_name}?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);

              const token = session?.access_token;

              if (!token) {
                throw new Error('Sesi admin tidak ditemukan.');
              }

              await deleteAdminAdoption(item.id, token);

              setDetailVisible(false);
              setSelectedRequest(null);

              await loadRequests(false);

              Alert.alert(
                'Berhasil',
                'Pengajuan adopsi berhasil dihapus.'
              );
            } catch (error) {
              console.error('Delete Adoption Error:', error);

              Alert.alert(
                'Gagal',
                error.message || 'Tidak dapat menghapus pengajuan.'
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const renderRequest = ({ item }) => {
    const statusStyle =
      STATUS_COLORS[item.status] || STATUS_COLORS.pending;

    return (
      <TouchableOpacity
        style={styles.requestCard}
        activeOpacity={0.8}
        onPress={() => openDetail(item)}
      >
        <View style={styles.cardTop}>
          {item.animals?.image_url ? (
            <Image
              source={{ uri: item.animals.image_url }}
              style={styles.animalImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Foto</Text>
            </View>
          )}

          <View style={styles.cardMain}>
            <Text style={styles.animalName}>
              {item.animals?.name || 'Hewan tidak ditemukan'}
            </Text>

            <Text style={styles.animalBreed}>
              {item.animals?.breed || '-'}
            </Text>

            <Text style={styles.applicantName}>
              Pemohon: {item.applicant_name}
            </Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.background },
              ]}
            >
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {STATUS_LABELS[item.status] || item.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.dateText}>
            {formatDate(item.created_at)}
          </Text>

          <Text style={styles.detailLink}>Lihat Detail ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Pengajuan Adopsi</Text>
          <Text style={styles.headerSubtitle}>
            Kelola permohonan adopsi pengguna
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Pengajuan</Text>
        <Text style={styles.summaryNumber}>{requests.length}</Text>
        <Text style={styles.summaryDescription}>
          Seluruh pengajuan adopsi yang masuk ke PetPal
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.value;

          return (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                active && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {filter.label} ({getCount(filter.value)})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6268" />
          <Text style={styles.loadingText}>Memuat pengajuan...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRequest}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadRequests(false);
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Belum Ada Pengajuan
              </Text>
              <Text style={styles.emptySubtitle}>
                Belum ada pengajuan pada kategori ini.
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={detailVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!updating) setDetailVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Pengajuan</Text>

              <TouchableOpacity
                onPress={() => setDetailVisible(false)}
                disabled={updating}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.detailContent}
              >
                <Text style={styles.detailSectionTitle}>
                  Informasi Hewan
                </Text>

                {selectedRequest.animals?.image_url ? (
                  <Image
                    source={{ uri: selectedRequest.animals.image_url }}
                    style={styles.detailImage}
                  />
                ) : null}

                <Text style={styles.detailAnimalName}>
                  {selectedRequest.animals?.name || 'Hewan tidak ditemukan'}
                </Text>

                <Text style={styles.detailValue}>
                  Ras: {selectedRequest.animals?.breed || '-'}
                </Text>

                <Text style={styles.detailValue}>
                  Kategori: {selectedRequest.animals?.category || '-'}
                </Text>

                <View style={styles.detailDivider} />

                <Text style={styles.detailSectionTitle}>
                  Informasi Pemohon
                </Text>

                <Text style={styles.detailLabel}>Nama</Text>
                <Text style={styles.detailValue}>
                  {selectedRequest.applicant_name}
                </Text>

                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>
                  {selectedRequest.email}
                </Text>

                <Text style={styles.detailLabel}>Nomor Telepon</Text>
                <Text style={styles.detailValue}>
                  {selectedRequest.phone}
                </Text>

                <Text style={styles.detailLabel}>Alamat</Text>
                <Text style={styles.detailValue}>
                  {selectedRequest.address}
                </Text>

                <Text style={styles.detailLabel}>Alasan Adopsi</Text>
                <Text style={styles.detailValue}>
                  {selectedRequest.reason}
                </Text>

                <Text style={styles.detailLabel}>Tanggal Pengajuan</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedRequest.created_at)}
                </Text>

                <Text style={styles.detailLabel}>Status Saat Ini</Text>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        STATUS_COLORS[selectedRequest.status]?.background ||
                        STATUS_COLORS.pending.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          STATUS_COLORS[selectedRequest.status]?.text ||
                          STATUS_COLORS.pending.text,
                      },
                    ]}
                  >
                    {STATUS_LABELS[selectedRequest.status] ||
                      selectedRequest.status}
                  </Text>
                </View>

                <View style={styles.detailDivider} />

                <Text style={styles.detailSectionTitle}>
                  Kelola Status
                </Text>

                <TouchableOpacity
                  style={styles.pendingButton}
                  onPress={() => handleUpdateStatus('pending')}
                  disabled={updating}
                >
                  <Text style={styles.pendingButtonText}>
                    Tandai Menunggu
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleUpdateStatus('approved')}
                  disabled={updating}
                >
                  <Text style={styles.actionButtonText}>
                    Terima Pengajuan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleUpdateStatus('rejected')}
                  disabled={updating}
                >
                  <Text style={styles.actionButtonText}>
                    Tolak Pengajuan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(selectedRequest)}
                  disabled={updating}
                >
                  <Text style={styles.deleteButtonText}>
                    Hapus Pengajuan
                  </Text>
                </TouchableOpacity>

                {updating && (
                  <ActivityIndicator
                    color="#FF6268"
                    style={styles.updatingIndicator}
                  />
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 30,
    lineHeight: 33,
    color: '#FF6268',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#252525',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 3,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  summaryLabel: {
    fontSize: 13,
    color: '#777777',
  },

  summaryNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FF6268',
    marginTop: 5,
  },

  summaryDescription: {
    fontSize: 12,
    color: '#999999',
    marginTop: 3,
  },

  filterScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },

  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  filterButtonActive: {
    backgroundColor: '#FF6268',
    borderColor: '#FF6268',
  },

  filterText: {
    fontSize: 12,
    color: '#777777',
    fontWeight: '600',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 13,
    marginBottom: 12,
    elevation: 2,
  },

  cardTop: {
    flexDirection: 'row',
  },

  animalImage: {
    width: 92,
    height: 105,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
  },

  imagePlaceholder: {
    width: 92,
    height: 105,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    fontSize: 12,
    color: '#999999',
  },

  cardMain: {
    flex: 1,
    marginLeft: 12,
    alignItems: 'flex-start',
  },

  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252525',
  },

  animalBreed: {
    fontSize: 12,
    color: '#888888',
    marginTop: 3,
  },

  applicantName: {
    fontSize: 12,
    color: '#555555',
    marginTop: 9,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    alignSelf: 'flex-start',
    marginTop: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  cardBottom: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 12,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateText: {
    fontSize: 10,
    color: '#999999',
  },

  detailLink: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6268',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#888888',
    marginTop: 12,
  },

  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
  },

  emptySubtitle: {
    fontSize: 12,
    color: '#999999',
    marginTop: 7,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '92%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#252525',
  },

  closeButton: {
    fontSize: 22,
    color: '#777777',
    paddingHorizontal: 5,
  },

  detailContent: {
    paddingBottom: 25,
  },

  detailSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 12,
  },

  detailImage: {
    width: '100%',
    height: 170,
    borderRadius: 12,
    marginBottom: 12,
  },

  detailAnimalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 5,
  },

  detailLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 12,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 20,
  },

  detailDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 18,
  },

  pendingButton: {
    backgroundColor: '#FFF4DF',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginBottom: 9,
  },

  pendingButtonText: {
    color: '#B7791F',
    fontWeight: 'bold',
  },

  approveButton: {
    backgroundColor: '#25834B',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginBottom: 9,
  },

  rejectButton: {
    backgroundColor: '#D94A4A',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginBottom: 9,
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  deleteButton: {
    backgroundColor: '#F3F3F3',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 5,
  },

  deleteButtonText: {
    color: '#D94A4A',
    fontWeight: 'bold',
  },

  updatingIndicator: {
    marginTop: 15,
  },
});

export default AdminAdoptionsScreen;
