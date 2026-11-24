
const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');

const {
  authenticateUser,
  requireAdmin,
} = require('../middleware/authMiddleware');

// ========================================
// GET SEMUA PENGGUNA
// GET /api/users/admin
// ========================================

router.get(
  '/admin',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      // Ambil data profil pengguna
      const {
        data: profiles,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, address, created_at')
        .order('created_at', { ascending: false });

      if (profileError) {
        console.error('Get Profiles Error:', profileError);
        return res.status(500).json({
          status: 'error',
          message: 'Gagal mengambil data pengguna.',
        });
      }

      // Ambil role seluruh pengguna
      const {
        data: roles,
        error: roleError,
      } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (roleError) {
        console.error('Get User Roles Error:', roleError);
        return res.status(500).json({
          status: 'error',
          message: 'Gagal mengambil role pengguna.',
        });
      }

      // Gabungkan profil dan role berdasarkan user ID
      const roleMap = new Map(
        (roles || []).map((item) => [
          item.user_id,
          item.role,
        ])
      );

      const users = (profiles || []).map((profile) => ({
        ...profile,
        role: roleMap.get(profile.id) || 'user',
      }));

      return res.status(200).json({
        status: 'success',
        message: 'Data pengguna berhasil diambil.',
        total: users.length,
        data: users,
      });
    } catch (error) {
      console.error('Get Users Error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan saat mengambil data pengguna.',
      });
    }
  }
);

// ========================================
// UPDATE ROLE PENGGUNA
// PATCH /api/users/admin/:userId/role
// ========================================

router.patch(
  '/admin/:userId/role',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      // Validasi role
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
          status: 'error',
          message: 'Role hanya boleh berupa user atau admin.',
        });
      }

      // Admin tidak boleh mengubah role akunnya sendiri
      if (userId === req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Kamu tidak dapat mengubah role akun sendiri.',
        });
      }

      // Pastikan pengguna tersedia
      const {
        data: existingUser,
        error: userError,
      } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Find User Error:', userError);
        return res.status(500).json({
          status: 'error',
          message: 'Gagal memeriksa data pengguna.',
        });
      }

      if (!existingUser) {
        return res.status(404).json({
          status: 'error',
          message: 'Pengguna tidak ditemukan.',
        });
      }

      // Update role pengguna
      const {
        data: updatedRole,
        error: updateError,
      } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId)
        .select('user_id, role')
        .maybeSingle();

      if (updateError) {
        console.error('Update User Role Error:', updateError);
        return res.status(500).json({
          status: 'error',
          message: 'Gagal memperbarui role pengguna.',
        });
      }

      if (!updatedRole) {
        return res.status(404).json({
          status: 'error',
          message: 'Data role pengguna tidak ditemukan.',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Role pengguna berhasil diperbarui.',
        data: {
          user_id: updatedRole.user_id,
          full_name: existingUser.full_name,
          email: existingUser.email,
          role: updatedRole.role,
        },
      });
    } catch (error) {
      console.error('Update User Role Error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan saat memperbarui role pengguna.',
      });
    }
  }
);

module.exports = router;
