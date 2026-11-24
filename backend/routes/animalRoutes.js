
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
// KONFIGURASI MULTER
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
    callback(
      new Error('Format gambar harus JPG, JPEG, PNG, atau WEBP.')
    );
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
// HELPER UPLOAD GAMBAR
// ========================================

const uploadAnimalImage = async (file) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

  const { error } = await supabase.storage
    .from('pet-images')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from('pet-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

// ========================================
// HELPER HAPUS GAMBAR STORAGE
// ========================================

const deleteAnimalImage = async (imageUrl) => {
  if (!imageUrl) return;

  const marker = '/storage/v1/object/public/pet-images/';
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) return;

  const filePath = imageUrl.substring(
    markerIndex + marker.length
  );

  if (!filePath) return;

  const { error } = await supabase.storage
    .from('pet-images')
    .remove([decodeURIComponent(filePath)]);

  if (error) {
    console.error('Gagal menghapus gambar:', error.message);
  }
};

// ========================================
// GET SEMUA HEWAN
// GET /api/animals
// ========================================

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Get Animals Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data hewan.',
    });
  }
});

// ========================================
// ADMIN: TAMBAH HEWAN
// POST /api/animals/admin
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
        breed,
        category,
        age,
        gender,
        location,
        description,
        is_available,
      } = req.body;

      if (
        !name ||
        !breed ||
        !category ||
        !age ||
        !gender ||
        !location ||
        !description
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Semua informasi hewan wajib diisi.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Foto hewan wajib diunggah.',
        });
      }

      uploadedImageUrl = await uploadAnimalImage(req.file);

      const animalData = {
        name,
        breed,
        category,
        age,
        gender,
        location,
        description,
        image_url: uploadedImageUrl,
        is_available:
          is_available === undefined
            ? true
            : is_available === 'true' || is_available === true,
      };

      const { data, error } = await supabase
        .from('animals')
        .insert([animalData])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        status: 'success',
        message: 'Data hewan berhasil ditambahkan.',
        data,
      });
    } catch (error) {
      console.error('Admin Create Animal Error:', error);

      if (uploadedImageUrl) {
        await deleteAnimalImage(uploadedImageUrl);
      }

      return res.status(500).json({
        status: 'error',
        message: 'Gagal menambahkan data hewan.',
        detail: error.message,
      });
    }
  }
);

// ========================================
// ADMIN: EDIT HEWAN
// PUT /api/animals/admin/:id
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

      const {
        name,
        breed,
        category,
        age,
        gender,
        location,
        description,
        is_available,
      } = req.body;

      const { data: existingAnimal, error: findError } = await supabase
        .from('animals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (findError) throw findError;

      if (!existingAnimal) {
        return res.status(404).json({
          status: 'error',
          message: 'Data hewan tidak ditemukan.',
        });
      }

      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (breed !== undefined) updateData.breed = breed;
      if (category !== undefined) updateData.category = category;
      if (age !== undefined) updateData.age = age;
      if (gender !== undefined) updateData.gender = gender;
      if (location !== undefined) updateData.location = location;
      if (description !== undefined) {
        updateData.description = description;
      }

      if (is_available !== undefined) {
        updateData.is_available =
          is_available === 'true' || is_available === true;
      }

      if (req.file) {
        uploadedImageUrl = await uploadAnimalImage(req.file);
        updateData.image_url = uploadedImageUrl;
      }

      const { data, error } = await supabase
        .from('animals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (uploadedImageUrl && existingAnimal.image_url) {
        await deleteAnimalImage(existingAnimal.image_url);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Data hewan berhasil diperbarui.',
        data,
      });
    } catch (error) {
      console.error('Admin Update Animal Error:', error);

      if (uploadedImageUrl) {
        await deleteAnimalImage(uploadedImageUrl);
      }

      return res.status(500).json({
        status: 'error',
        message: 'Gagal memperbarui data hewan.',
        detail: error.message,
      });
    }
  }
);

// ========================================
// ADMIN: HAPUS HEWAN
// DELETE /api/animals/admin/:id
// ========================================

router.delete(
  '/admin/:id',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data: animal, error: findError } = await supabase
        .from('animals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (findError) throw findError;

      if (!animal) {
        return res.status(404).json({
          status: 'error',
          message: 'Data hewan tidak ditemukan.',
        });
      }

      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await deleteAnimalImage(animal.image_url);

      return res.status(200).json({
        status: 'success',
        message: 'Data hewan berhasil dihapus.',
      });
    } catch (error) {
      console.error('Admin Delete Animal Error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Gagal menghapus data hewan.',
        detail: error.message,
      });
    }
  }
);

// ========================================
// USER: UPLOAD HEWAN
// POST /api/animals/upload
// ========================================

router.post('/upload', upload.single('image'), async (req, res) => {
  let uploadedImageUrl = null;

  try {
    const {
      name,
      breed,
      category,
      age,
      gender,
      location,
      description,
    } = req.body;

    if (
      !name ||
      !breed ||
      !category ||
      !age ||
      !gender ||
      !location ||
      !description
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Semua informasi hewan wajib diisi.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Foto hewan wajib diunggah.',
      });
    }

    uploadedImageUrl = await uploadAnimalImage(req.file);

    const { data, error } = await supabase
      .from('animals')
      .insert([
        {
          name,
          breed,
          category,
          age,
          gender,
          location,
          description,
          image_url: uploadedImageUrl,
          is_available: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      status: 'success',
      message: 'Data hewan berhasil dikirim.',
      data,
    });
  } catch (error) {
    console.error('User Upload Animal Error:', error);

    if (uploadedImageUrl) {
      await deleteAnimalImage(uploadedImageUrl);
    }

    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengirim data hewan.',
      detail: error.message,
    });
  }
});

// ========================================
// GET DETAIL HEWAN
// GET /api/animals/:id
// ========================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        status: 'error',
        message: 'Data hewan tidak ditemukan.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Get Animal Detail Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil detail hewan.',
    });
  }
});

// ========================================
// ERROR HANDLER MULTER
// ========================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message:
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran gambar maksimal 5 MB.'
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
