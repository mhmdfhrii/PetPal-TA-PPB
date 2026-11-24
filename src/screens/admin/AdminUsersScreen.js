
import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';

import {
  getAdminUsers,
  updateUserRole,
} from '../../services/api';

// ========================================
// ADMIN USERS SCREEN
// ========================================

const AdminUsersScreen = () => {
  const { session } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // ========================================
  // LOAD USERS
  // ========================================

  const loadUsers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error('Sesi login tidak ditemukan.');
      }

      const response = await getAdminUsers(accessToken);

      setUsers(response.data || []);
    } catch (error) {
      console.error('Load Admin Users Error:', error);

      Alert.alert(
        'Gagal',
        error.message || 'Tidak dapat mengambil data pengguna.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ========================================
  // UPDATE USER ROLE
  // ========================================

  const handleChangeRole = (selectedUser) => {
    const newRole =
      selectedUser.role === 'admin' ? 'user' : 'admin';

    const roleLabel =
      newRole === 'admin' ? 'Administrator' : 'Pengguna';

    Alert.alert(
      'Ubah Role Pengguna',
      `Apakah kamu yakin ingin mengubah role ${selectedUser.full_name || selectedUser.email} menjadi ${roleLabel}?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Ubah Role',
          onPress: async () => {
            try {
              setUpdatingId(selectedUser.id);

              const accessToken = session?.access_token;

              if (!accessToken) {
                throw new Error('Sesi login tidak ditemukan.');
              }

              await updateUserRole(
                selectedUser.id,
                newRole,
                accessToken
              );

              Alert.alert(
                'Berhasil',
                `Role pengguna berhasil diubah menjadi ${roleLabel}.`
              );

              await loadUsers(true);
            } catch (error) {
              console.error('Update User Role Error:', error);

              Alert.alert(
                'Gagal',
                error.message || 'Tidak dapat mengubah role pengguna.'
              );
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  // ========================================
  // FILTER SEARCH
  // ========================================

  const filteredUsers = users.filter((item) => {
    const keyword = search.toLowerCase().trim();

    const name = (item.full_name || '').toLowerCase();
    const email = (item.email || '').toLowerCase();

    return (
      name.includes(keyword) ||
      email.includes(keyword)
    );
  });

  // ========================================
  // USER CARD
  // ========================================

  const renderUser = ({ item }) => {
    const isAdmin = item.role === 'admin';
    const isUpdating = updatingId === item.id;

    return (
      <View style={styles.userCard}>
        <View style={styles.userTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.full_name || item.email || 'U')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.userMainInfo}>
            <Text style={styles.userName}>
              {item.full_name || 'Nama belum diisi'}
            </Text>

            <Text style={styles.userEmail}>
              {item.email || '-'}
            </Text>
          </View>

          <View
            style={[
              styles.roleBadge,
              isAdmin
                ? styles.adminRoleBadge
                : styles.userRoleBadge,
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                isAdmin
                  ? styles.adminRoleText
                  : styles.userRoleText,
              ]}
            >
              {isAdmin ? 'ADMIN' : 'USER'}
            </Text>
          </View>
        </View>

        <View style={styles.userDivider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            Nomor Telepon
          </Text>

          <Text style={styles.detailValue}>
            {item.phone || 'Belum diisi'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            Alamat
          </Text>

          <Text style={styles.detailValue}>
            {item.address || 'Belum diisi'}
          </Text>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              isAdmin && styles.demoteButton,
              isUpdating && styles.disabledButton,
            ]}
            onPress={() => handleChangeRole(item)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.roleButtonText}>
                {isAdmin ? 'Jadikan User' : 'Jadikan Admin'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Kelola Pengguna
          </Text>

          <Text style={styles.headerSubtitle}>
            Manajemen akun pengguna PetPal
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {users.length}
          </Text>

          <Text style={styles.summaryLabel}>
            Total Pengguna
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {users.filter((item) => item.role === 'admin').length}
          </Text>

          <Text style={styles.summaryLabel}>
            Administrator
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {users.filter((item) => item.role !== 'admin').length}
          </Text>

          <Text style={styles.summaryLabel}>
            User
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>
          ⌕
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau email pengguna..."
          placeholderTextColor="#AAAAAA"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          Daftar Pengguna
        </Text>

        <Text style={styles.listCount}>
          {filteredUsers.length} pengguna
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#FF6268"
          />

          <Text style={styles.loadingText}>
            Memuat data pengguna...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadUsers(true)}
              colors={['#FF6268']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Pengguna Tidak Ditemukan
              </Text>

              <Text style={styles.emptySubtitle}>
                {search
                  ? 'Coba gunakan kata kunci pencarian lain.'
                  : 'Belum ada data pengguna yang tersedia.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#252525',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 18,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 2,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6268',
  },

  summaryLabel: {
    fontSize: 10,
    color: '#888888',
    marginTop: 5,
  },

  summaryDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#EEEEEE',
  },

  searchContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  searchIcon: {
    fontSize: 23,
    color: '#999999',
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#252525',
  },

  clearSearch: {
    fontSize: 17,
    color: '#999999',
    padding: 5,
  },

  listHeader: {
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#252525',
  },

  listCount: {
    fontSize: 12,
    color: '#888888',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 13,
    marginBottom: 13,
    elevation: 2,
  },

  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6268',
  },

  userMainInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 7,
  },

  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#252525',
  },

  userEmail: {
    fontSize: 11,
    color: '#888888',
    marginTop: 4,
  },

  roleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
  },

  adminRoleBadge: {
    backgroundColor: '#FFF0F0',
  },

  userRoleBadge: {
    backgroundColor: '#EAF4FF',
  },

  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  adminRoleText: {
    color: '#FF6268',
  },

  userRoleText: {
    color: '#4385C5',
  },

  userDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 14,
  },

  detailRow: {
    marginBottom: 10,
  },

  detailLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 18,
  },

  userActions: {
    marginTop: 5,
  },

  roleButton: {
    backgroundColor: '#FF6268',
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: 'center',
  },

  demoteButton: {
    backgroundColor: '#555555',
  },

  roleButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  disabledButton: {
    opacity: 0.6,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#888888',
  },

  emptyContainer: {
    paddingVertical: 55,
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
    textAlign: 'center',
  },
});

export default AdminUsersScreen;
