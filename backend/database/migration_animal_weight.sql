-- ========================================================
-- PETPAL DATABASE MIGRATION
-- Revisi 10: Menambahkan Kolom Berat Badan (weight) pada Tabel Animals
-- ========================================================

-- 1. Tambah kolom weight ke tabel animals
-- Kolom dibuat bertipe VARCHAR(50) dan NULLABLE agar tidak mengganggu data yang sudah ada
ALTER TABLE public.animals 
ADD COLUMN IF NOT EXISTS weight VARCHAR(50);

-- 2. Dokumentasi kolom
COMMENT ON COLUMN public.animals.weight IS 'Berat badan hewan peliharaan (contoh: 4.5 kg, 12 kg, 2.1 kg)';
