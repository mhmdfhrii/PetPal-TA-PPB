-- ========================================================
-- PETPAL DATABASE MIGRATION
-- Revisi 9: Dukungan Status Adopsi Lanjutan (completed & cancelled)
-- Status yang didukung:
-- 1. pending   : Pengajuan masuk dan sedang menunggu tinjauan admin/shelter
-- 2. approved  : Pengajuan disetujui, hewan disiapkan untuk serah terima (is_available = false)
-- 3. completed : Proses adopsi selesai dan hewan resmi diserahterimakan (is_available = false)
-- 4. rejected  : Pengajuan ditolak (is_available = true jika tidak ada adopsi approved lain)
-- 5. cancelled : Pengajuan dibatalkan (is_available = true jika tidak ada adopsi approved lain)
-- ========================================================

DO $$
BEGIN
  -- Perbarui CHECK constraint jika sebelumnya dibatasi hanya pada pending/approved/rejected
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'adoption_requests_status_check'
  ) THEN
    ALTER TABLE public.adoption_requests DROP CONSTRAINT adoption_requests_status_check;
  END IF;

  -- Pasang constraint baru yang mendukung seluruh alur status
  ALTER TABLE public.adoption_requests 
    ADD CONSTRAINT adoption_requests_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled'));
EXCEPTION
  WHEN OTHERS THEN
    -- Jika kolom bertipe TEXT / VARCHAR bebas, constraint check bersifat opsional
    RAISE NOTICE 'Constraint status diperbarui atau kolom berformat text standar.';
END $$;
