-- ========================================================
-- PETPAL DATABASE MIGRATION
-- Revisi 3: Menghubungkan Hewan dengan Shelter (Relasi animals -> shelters)
-- ========================================================

-- 1. Tambah kolom shelter_id ke tabel animals
-- Menggunakan NULLABLE dan ON DELETE SET NULL agar data hewan lama tidak terhapus / rusak.
ALTER TABLE public.animals 
ADD COLUMN IF NOT EXISTS shelter_id BIGINT REFERENCES public.shelters(id) ON DELETE SET NULL;

-- 2. Buat index pada kolom shelter_id untuk mempercepat join dan pencarian hewan per shelter
CREATE INDEX IF NOT EXISTS idx_animals_shelter_id ON public.animals(shelter_id);

-- 3. Komentar dokumentasi kolom
COMMENT ON COLUMN public.animals.shelter_id IS 'ID shelter tempat hewan terdaftar (relasi ke shelters.id)';
