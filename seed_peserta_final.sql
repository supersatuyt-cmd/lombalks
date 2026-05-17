-- =========================================================================
-- SCRIPT PENYESUAIAN DATA PESERTA & SEKOLAH
-- Jalankan script ini di SQL Editor Supabase Anda
-- =========================================================================

-- 1. Nonaktifkan RLS untuk memastikan tidak ada hambatan
ALTER TABLE sekolah DISABLE ROW LEVEL SECURITY;
ALTER TABLE peserta DISABLE ROW LEVEL SECURITY;
ALTER TABLE bidang_lomba DISABLE ROW LEVEL SECURITY;
ALTER TABLE juri DISABLE ROW LEVEL SECURITY;

-- 2. Hapus data peserta dan sekolah lama (tapi biarkan bidang_lomba dan modul agar tidak hilang)
DELETE FROM peserta;
DELETE FROM sekolah;

-- 3. Masukkan data Sekolah
INSERT INTO sekolah (id, nama) VALUES
(gen_random_uuid(), 'SMK Negeri 1 Kongbeng'),
(gen_random_uuid(), 'SMKN 1 Bengalon'),
(gen_random_uuid(), 'SMKN 1 Rantau Pulung'),
(gen_random_uuid(), 'SMKN 1 Sangatta Utara');

-- 4. Hapus bidang lomba 'Cyber Security' duplikat yang kosong (yang tidak punya modul) jika ada
-- Kita biarkan yang bernama 'Teknologi Keamanan Siber (Cyber Security)'
DELETE FROM bidang_lomba WHERE kode = 'cybersec' AND nama = 'Cyber Security';

-- 5. Masukkan data Peserta
DO $$
DECLARE
    -- Variabel untuk menampung ID
    id_kongbeng UUID;
    id_bengalon UUID;
    id_rantau_pulung UUID;
    id_sangatta_utara UUID;
    
    id_web UUID;
    id_cyber UUID;
    id_design UUID;
    id_cable UUID;
    id_itnsa UUID;
BEGIN
    -- Ambil ID Sekolah
    SELECT id INTO id_kongbeng FROM sekolah WHERE nama = 'SMK Negeri 1 Kongbeng' LIMIT 1;
    SELECT id INTO id_bengalon FROM sekolah WHERE nama = 'SMKN 1 Bengalon' LIMIT 1;
    SELECT id INTO id_rantau_pulung FROM sekolah WHERE nama = 'SMKN 1 Rantau Pulung' LIMIT 1;
    SELECT id INTO id_sangatta_utara FROM sekolah WHERE nama = 'SMKN 1 Sangatta Utara' LIMIT 1;

    -- Ambil ID Bidang Lomba (menggunakan LIKE agar fleksibel jika ada spasi beda)
    SELECT id INTO id_web FROM bidang_lomba WHERE nama ILIKE '%Teknologi Web%' LIMIT 1;
    SELECT id INTO id_cyber FROM bidang_lomba WHERE nama ILIKE '%Teknologi Keamanan Siber%' LIMIT 1;
    SELECT id INTO id_design FROM bidang_lomba WHERE nama ILIKE '%Teknologi Desain Grafis%' LIMIT 1;
    SELECT id INTO id_cable FROM bidang_lomba WHERE nama ILIKE '%Teknik Pengkabelan Jaringan Informasi%' LIMIT 1;
    SELECT id INTO id_itnsa FROM bidang_lomba WHERE nama ILIKE '%Teknologi Informasi Sistem Administrasi%' LIMIT 1;

    -- =========================================================================
    -- INSERT PESERTA: Teknologi Web (Web Technologies)
    -- =========================================================================
    INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
    (gen_random_uuid(), 'Fajriansyah', 'WEB-001', id_kongbeng, id_web, 'fajriansyah-web'),
    (gen_random_uuid(), 'MUHAMMAD SHAMID DZAKKIR', 'WEB-002', id_bengalon, id_web, 'shamid-web'),
    (gen_random_uuid(), 'Ananda Bisma Putra Pratama', 'WEB-003', id_rantau_pulung, id_web, 'ananda-web');

    -- =========================================================================
    -- INSERT PESERTA: Teknologi Keamanan Siber (Cyber Security)
    -- =========================================================================
    INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
    (gen_random_uuid(), 'Rahayu Suci Prayitno', 'CYBER-001', id_kongbeng, id_cyber, 'rahayu-cyber'),
    (gen_random_uuid(), 'Juwita Novita Sari', 'CYBER-002', id_kongbeng, id_cyber, 'juwita-cyber'),
    (gen_random_uuid(), 'NADINE ATHIFA APRILIA', 'CYBER-003', id_sangatta_utara, id_cyber, 'nadine-cyber'),
    (gen_random_uuid(), 'CHENA MAULIDYA', 'CYBER-004', id_sangatta_utara, id_cyber, 'chena-cyber'),
    (gen_random_uuid(), 'Marinda Thalitasari', 'CYBER-005', id_rantau_pulung, id_cyber, 'marinda-cyber'),
    (gen_random_uuid(), 'Ahmad Dias Ashari', 'CYBER-006', id_rantau_pulung, id_cyber, 'ahmad-cyber');

    -- =========================================================================
    -- INSERT PESERTA: Teknologi Desain Grafis (Graphic Design)
    -- =========================================================================
    INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
    (gen_random_uuid(), 'Muhamad Radja Ihsan Zuhdi', 'DG-001', id_sangatta_utara, id_design, 'radja-dg'),
    (gen_random_uuid(), 'HABIL RAMADHAN', 'DG-002', id_bengalon, id_design, 'habil-dg'),
    (gen_random_uuid(), 'Elisya Nur Aghniyah Muslikhatul Jannah', 'DG-003', id_rantau_pulung, id_design, 'elisya-dg');

    -- =========================================================================
    -- INSERT PESERTA: Teknik Pengkabelan Jaringan Informasi (Information Network Cable)
    -- =========================================================================
    INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
    (gen_random_uuid(), 'Kevin Tegar Davika', 'CAB-001', id_kongbeng, id_cable, 'kevin-cab'),
    (gen_random_uuid(), 'ANDI MUHAMMAD ZAHRAN JAMAL', 'CAB-002', id_bengalon, id_cable, 'andi-cab'),
    (gen_random_uuid(), 'Muhammad Feri Pratama', 'CAB-003', id_rantau_pulung, id_cable, 'feri-cab');

    -- =========================================================================
    -- INSERT PESERTA: Teknologi Informasi Sistem Administrasi (IT Network System Administration)
    -- =========================================================================
    INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
    (gen_random_uuid(), 'MAHESA ABDOLU SABIL', 'IT-001', id_sangatta_utara, id_itnsa, 'mahesa-it'),
    (gen_random_uuid(), 'M ALIF AL IKHWAN', 'IT-002', id_bengalon, id_itnsa, 'alif-it'),
    (gen_random_uuid(), 'AULIYA ALKAFFUNNISA', 'IT-003', id_rantau_pulung, id_itnsa, 'auliya-it');

END $$;
