
const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');

const {
  authenticateUser,
  requireAdmin,
} = require('../middleware/authMiddleware');

// ========================================
// ADMIN: MENGAMBIL SEMUA PENGAJUAN
// GET /api/adoptions/admin
// ========================================

router.get('/admin', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select(`
        *,
        animals (
          id,
          name,
          breed,
          category,
          age,
          gender,
          location,
          image_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      status: 'success',
      total: data.length,
      data,
    });
  } catch (error) {
    console.error('Admin Get Adoptions Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil seluruh pengajuan adopsi.',
    });
  }
});

// ========================================
// ADMIN: MENGUBAH STATUS PENGAJUAN
// PATCH /api/adoptions/admin/:id/status
// ========================================

router.patch(
  '/admin/:id/status',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = ['pending', 'approved', 'rejected'];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Status pengajuan tidak valid.',
        });
      }

      const { data: existingRequest, error: findError } =
        await supabase
          .from('adoption_requests')
          .select('id')
          .eq('id', id)
          .maybeSingle();

      if (findError) throw findError;

      if (!existingRequest) {
        return res.status(404).json({
          status: 'error',
          message: 'Pengajuan adopsi tidak ditemukan.',
        });
      }

      const { data, error } = await supabase
        .from('adoption_requests')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          animals (
            id,
            name,
            breed,
            category,
            image_url
          )
        `)
        .single();

      if (error) throw error;

      return res.json({
        status: 'success',
        message: 'Status pengajuan berhasil diperbarui.',
        data,
      });
    } catch (error) {
      console.error('Update Adoption Status Error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Gagal memperbarui status pengajuan.',
      });
    }
  }
);

// ========================================
// ADMIN: MENGHAPUS PENGAJUAN
// DELETE /api/adoptions/admin/:id
// ========================================

router.delete(
  '/admin/:id',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('adoption_requests')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          status: 'error',
          message: 'Pengajuan adopsi tidak ditemukan.',
        });
      }

      return res.json({
        status: 'success',
        message: 'Pengajuan adopsi berhasil dihapus.',
      });
    } catch (error) {
      console.error('Delete Adoption Error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Gagal menghapus pengajuan adopsi.',
      });
    }
  }
);

// ========================================
// USER: MENGIRIM PENGAJUAN ADOPSI
// POST /api/adoptions
// Wajib login
// ========================================

router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      animal_id,
      phone,
      address,
      reason,
    } = req.body;

    if (
      !animal_id ||
      !Number.isInteger(Number(animal_id)) ||
      Number(animal_id) <= 0 ||
      !phone?.trim() ||
      !address?.trim() ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Data pengajuan tidak lengkap atau tidak valid.',
      });
    }

    // Identitas pengguna diambil dari token login,
    // bukan dari data yang dikirim aplikasi.
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Akun pengguna tidak memiliki email yang valid.',
      });
    }

    // Ambil nama dari profil pengguna.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    const applicantName =
      profile?.full_name?.trim() ||
      req.user.user_metadata?.full_name?.trim() ||
      userEmail.split('@')[0];

    // Periksa ketersediaan hewan.
    const { data: animal, error: animalError } = await supabase
      .from('animals')
      .select('id, name, is_available')
      .eq('id', Number(animal_id))
      .maybeSingle();

    if (animalError) throw animalError;

    if (!animal) {
      return res.status(404).json({
        status: 'error',
        message: 'Data hewan tidak ditemukan.',
      });
    }

    if (!animal.is_available) {
      return res.status(400).json({
        status: 'error',
        message: 'Hewan ini sudah tidak tersedia untuk diadopsi.',
      });
    }

    // Simpan pengajuan beserta identitas akun yang terautentikasi.
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert([
        {
          animal_id: Number(animal_id),
          applicant_user_id: userId,
          applicant_name: applicantName,
          email: userEmail.toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          reason: reason.trim(),
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      status: 'success',
      message: 'Pengajuan adopsi berhasil dikirim.',
      data,
    });
  } catch (error) {
    console.error('Adoption Request Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat mengirim pengajuan adopsi.',
    });
  }
});

// ========================================
// USER: MELIHAT RIWAYAT PENGAJUAN
// GET /api/adoptions
// Wajib login
// ========================================

router.get('/', authenticateUser, async (req, res) => {
  try {
    // Identitas diambil dari token login.
    // Pengguna tidak bisa menentukan email orang lain.
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('adoption_requests')
      .select(`
        *,
        animals (
          name,
          breed,
          category,
          image_url
        )
      `)
      .eq('applicant_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      status: 'success',
      total: data.length,
      data,
    });
  } catch (error) {
    console.error('Get Adoption Requests Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil riwayat pengajuan adopsi.',
    });
  }
});

module.exports = router;
