
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const supabase = require('../config/supabase');

const {
  authenticateUser,
  requireAdmin,
} = require('../middleware/authMiddleware');

// ========================================
// MULTER CONFIGURATION
// ========================================

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Format foto harus JPG, JPEG, PNG, atau WEBP.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ========================================
// HELPER UPLOAD FOTO SHELTER
// ========================================

const uploadShelterImage = async (file) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const fileName = `shelters/${Date.now()}-${crypto.randomUUID()}${extension}`;

  const { error } = await supabase.storage
    .from('pet-images')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('pet-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

// ========================================
// HELPER HAPUS FOTO SHELTER
// ========================================

const deleteShelterImage = async (imageUrl) => {
  if (!imageUrl) return;

  const marker = '/storage/v1/object/public/pet-images/';
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) return;

  const filePath = imageUrl.substring(
    markerIndex + marker.length
  );

  if (!filePath.startsWith('shelters/')) return;

  const { error } = await supabase.storage
    .from('pet-images')
    .remove([decodeURIComponent(filePath)]);

  if (error) {
    console.error('Delete Shelter Image Error:', error.message);
  }
};

// ========================================
// ADMIN: GET SEMUA SHELTER
// GET /api/shelters/admin
// ========================================

router.get(
  '/admin',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      return res.status(200).json({
        status: 'success',
        total: data.length,
        data,
      });
    } catch (error) {
      console.error('Admin Get Shelters Error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Gagal mengambil seluruh data shelter.',
      });
    }
  }
);

// ========================================
// ADMIN: TAMBAH SHELTER
// POST /api/shelters/admin
// ========================================

router.post(
  '/admin',
  authenticateUser,
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    let uploadedImageUrl = null;

    try {
      const {
        name,
        location,
        description,
        contact,
        is_active,
      } = req.body;

      if (
        !name?.trim() ||
        !location?.trim() ||
        !description?.trim() ||
        !contact?.trim()
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Nama, lokasi, deskripsi, dan kontak wajib diisi.',
        });
      }

      if (req.file) {
        uploadedImageUrl = await uploadShelterImage(req.file);
      }

      const shelterData = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        contact: contact.trim(),
        image_url: uploadedImageUrl,
        is_active:
          is_active === undefined
            ? true
            : is_active === 'true' || is_active === true,
      };

      const { data, error } = await supabase
        .from('shelters')
        .insert([shelterData])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        status: 'success',
        message: 'Shelter berhasil ditambahkan.',
        data,
      });
    } catch (error) {
      console.error('Admin Create Shelter Error:', error);

      if (uploadedImageUrl) {
        await deleteShelterImage(uploadedImageUrl);
      }

      return res.status(500).json({
        status: 'error',
        message: 'Gagal menambahkan shelter.',
        detail: error.message,
      });
    }
  }
);

// ========================================
// ADMIN: EDIT SHELTER
// PUT /api/shelters/admin/:id
// ========================================

router.put(
  '/admin/:id',
  authenticateUser,
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    let uploadedImageUrl = null;

    try {
      const { id } = req.params;

      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'ID shelter tidak valid.',
        });
      }

      const { data: existingShelter, error: findError } = await supabase
        .from('shelters')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (findError) throw findError;

      if (!existingShelter) {
        return res.status(404).json({
          status: 'error',
          message: 'Shelter tidak ditemukan.',
        });
      }

      const {
        name,
        location,
        description,
        contact,
        is_active,
      } = req.body;

      const updateData = {};

      if (name !== undefined) updateData.name = name.trim();
      if (location !== undefined) updateData.location = location.trim();
      if (description !== undefined) {
        updateData.description = description.trim();
      }
      if (contact !== undefined) updateData.contact = contact.trim();

      if (is_active !== undefined) {
        updateData.is_active =
          is_active === 'true' || is_active === true;
      }

      if (req.file) {
        uploadedImageUrl = await uploadShelterImage(req.file);
        updateData.image_url = uploadedImageUrl;
      }

      const { data, error } = await supabase
        .from('shelters')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (uploadedImageUrl && existingShelter.image_url) {
        await deleteShelterImage(existingShelter.image_url);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Data shelter berhasil diperbarui.',
        data,
      });
    } catch (error) {
      console.error('Admin Update Shelter Error:', error);

      if (uploadedImageUrl) {
        await deleteShelterImage(uploadedImageUrl);
      }

      return res.status(500).json({
        status: 'error',
        message: 'Gagal memperbarui data shelter.',
        detail: error.message,
      });
    }
  }
);

// ========================================
// ADMIN: NONAKTIFKAN SHELTER
// DELETE /api/shelters/admin/:id
// ========================================

router.delete(
  '/admin/:id',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'ID shelter tidak valid.',
        });
      }

      const { data: shelter, error: findError } = await supabase
        .from('shelters')
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (findError) throw findError;

      if (!shelter) {
        return res.status(404).json({
          status: 'error',
          message: 'Shelter tidak ditemukan.',
        });
      }

      const { data, error } = await supabase
        .from('shelters')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        status: 'success',
        message: 'Shelter berhasil dinonaktifkan.',
        data,
      });
    } catch (error) {
      console.error('Admin Delete Shelter Error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Gagal menonaktifkan shelter.',
      });
    }
  }
);

// ========================================
// PUBLIC: GET SHELTER AKTIF
// GET /api/shelters
// ========================================

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      total: data.length,
      data,
    });
  } catch (error) {
    console.error('Get Shelters Error:', error.message);

    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data shelter.',
    });
  }
});

// ========================================
// PUBLIC: GET DETAIL SHELTER
// GET /api/shelters/:id
// ========================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID shelter tidak valid.',
      });
    }

    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        status: 'error',
        message: 'Shelter tidak ditemukan.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Get Shelter Detail Error:', error.message);

    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil detail shelter.',
    });
  }
});

// ========================================
// MULTER ERROR HANDLER
// ========================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message:
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran foto maksimal 5 MB.'
          : error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }

  next();
});

module.exports = router;
