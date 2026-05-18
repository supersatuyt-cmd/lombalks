-- =========================================================================
-- MIGRATION LENGKAP LKS DIKMEN - SCORING SYSTEM
-- Jalankan di Supabase SQL Editor (https://supabase.com/dashboard)
-- 
-- Script ini mencakup:
-- 1. Pembuatan semua tabel (CREATE TABLE IF NOT EXISTS)
-- 2. RLS policies
-- 3. Akun Admin
-- 4. Akun Juri (1 per bidang lomba)
-- =========================================================================

-- =========================================================================
-- BAGIAN 1: BUAT TABEL-TABEL UTAMA
-- =========================================================================

-- Tabel Bidang Lomba
CREATE TABLE IF NOT EXISTS bidang_lomba (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  kode TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Sekolah
CREATE TABLE IF NOT EXISTS sekolah (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Peserta
CREATE TABLE IF NOT EXISTS peserta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  nomor_peserta TEXT NOT NULL,
  slug TEXT UNIQUE,
  sekolah_id UUID REFERENCES sekolah(id) ON DELETE SET NULL,
  bidang_lomba_id UUID REFERENCES bidang_lomba(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Juri
CREATE TABLE IF NOT EXISTS juri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  bidang_lomba_id UUID REFERENCES bidang_lomba(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Modul (modul penilaian per bidang)
CREATE TABLE IF NOT EXISTS modul (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bidang_lomba_id UUID REFERENCES bidang_lomba(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  urutan INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Deskripsi Nilai (kriteria penilaian per modul)
CREATE TABLE IF NOT EXISTS deskripsi_nilai (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  modul_id UUID REFERENCES modul(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  nilai_max NUMERIC DEFAULT 100,
  urutan INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Penilaian (nilai yang diberikan juri ke peserta)
CREATE TABLE IF NOT EXISTS penilaian (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  juri_id UUID REFERENCES juri(id) ON DELETE CASCADE,
  peserta_id UUID REFERENCES peserta(id) ON DELETE CASCADE,
  deskripsi_nilai_id UUID REFERENCES deskripsi_nilai(id) ON DELETE CASCADE,
  nilai NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(juri_id, peserta_id, deskripsi_nilai_id)
);

-- =========================================================================
-- BAGIAN 2: MATIKAN RLS (agar seed data bisa masuk tanpa hambatan)
-- =========================================================================

ALTER TABLE bidang_lomba DISABLE ROW LEVEL SECURITY;
ALTER TABLE sekolah DISABLE ROW LEVEL SECURITY;
ALTER TABLE peserta DISABLE ROW LEVEL SECURITY;
ALTER TABLE juri DISABLE ROW LEVEL SECURITY;
ALTER TABLE modul DISABLE ROW LEVEL SECURITY;
ALTER TABLE deskripsi_nilai DISABLE ROW LEVEL SECURITY;
ALTER TABLE penilaian DISABLE ROW LEVEL SECURITY;


-- =========================================================================
-- BAGIAN 3: SEED DATA BIDANG LOMBA
-- =========================================================================

INSERT INTO bidang_lomba (kode, nama) VALUES
('web-tech', 'Teknologi Web (Web Technologies)'),
('cyber-security', 'Teknologi Keamanan Siber (Cyber Security)'),
('graphic-design', 'Teknologi Desain Grafis (Graphic Design)'),
('cabling', 'Teknik Pengkabelan Jaringan Informasi (Information Network Cable)'),
('itnsa', 'Teknologi Informasi Sistem Administrasi (IT Network System Administration)')
ON CONFLICT (kode) DO NOTHING;


-- =========================================================================
-- BAGIAN 4: SEED DATA SEKOLAH
-- =========================================================================

INSERT INTO sekolah (nama) VALUES
('SMK Negeri 1 Kongbeng'),
('SMKN 1 Bengalon'),
('SMKN 1 Rantau Pulung'),
('SMKN 1 Sangatta Utara')
ON CONFLICT (nama) DO NOTHING;


-- =========================================================================
-- BAGIAN 5: BUAT AKUN ADMIN + AKUN JURI
-- Menggunakan auth.users langsung via SQL
-- =========================================================================

DO $$
DECLARE
    admin_user_id UUID;
    juri_user_id UUID;
    bidang RECORD;
    juri_counter INT := 1;
BEGIN
    -- =====================================================================
    -- 5A. BUAT AKUN ADMIN
    -- Email: admin@lks.com | Password: admin123
    -- =====================================================================
    
    -- Cek apakah admin sudah ada
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@lks.com';
    
    IF admin_user_id IS NULL THEN
        admin_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, recovery_sent_at, last_sign_in_at, 
            raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, 
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_user_id,
            'authenticated',
            'authenticated',
            'admin@lks.com',
            crypt('admin123', gen_salt('bf')),
            now(), now(), now(),
            '{"provider":"email","providers":["email"],"role":"admin"}',
            '{"nama":"Administrator LKS","role":"admin"}',
            now(), now(),
            '', '', '', ''
        );

        -- Insert identities for admin
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            admin_user_id,
            format('{"sub":"%s","email":"%s"}', admin_user_id::text, 'admin@lks.com')::jsonb,
            'email',
            admin_user_id::text,
            now(), now(), now()
        );

        -- Juga masukkan admin sebagai juri "admin" (agar bisa login ke sistem)
        -- Admin tidak perlu bidang_lomba_id, tapi perlu ada di tabel juri agar AuthContext bisa load
        INSERT INTO juri (id, user_id, nama, bidang_lomba_id) VALUES (
            gen_random_uuid(),
            admin_user_id,
            'Administrator',
            (SELECT id FROM bidang_lomba LIMIT 1)  -- Assign ke bidang pertama sebagai placeholder
        );

        RAISE NOTICE '✅ Akun Admin berhasil dibuat: admin@lks.com / admin123';
    ELSE
        RAISE NOTICE '⚠️ Akun Admin sudah ada, skip.';
    END IF;

    -- =====================================================================
    -- 5B. BUAT AKUN JURI (1 juri per bidang lomba)
    -- Email: juri1@lks.com, juri2@lks.com, dst.
    -- Password: password123
    -- =====================================================================
    
    FOR bidang IN SELECT id, nama, kode FROM bidang_lomba ORDER BY nama LOOP
        -- Cek apakah juri untuk bidang ini sudah ada
        IF NOT EXISTS (
            SELECT 1 FROM juri WHERE bidang_lomba_id = bidang.id AND nama != 'Administrator'
        ) THEN
            juri_user_id := gen_random_uuid();
            
            -- Buat auth user untuk juri
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, 
                email_confirmed_at, recovery_sent_at, last_sign_in_at, 
                raw_app_meta_data, raw_user_meta_data, 
                created_at, updated_at, 
                confirmation_token, email_change, email_change_token_new, recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                juri_user_id,
                'authenticated',
                'authenticated',
                'juri' || juri_counter || '@lks.com',
                crypt('password123', gen_salt('bf')),
                now(), now(), now(),
                '{"provider":"email","providers":["email"]}',
                '{}',
                now(), now(),
                '', '', '', ''
            );

            -- Insert identities for juri
            INSERT INTO auth.identities (
                id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
            ) VALUES (
                gen_random_uuid(),
                juri_user_id,
                format('{"sub":"%s","email":"%s"}', juri_user_id::text, 'juri' || juri_counter || '@lks.com')::jsonb,
                'email',
                juri_user_id::text,
                now(), now(), now()
            );

            -- Insert ke tabel juri
            INSERT INTO juri (id, user_id, nama, bidang_lomba_id) VALUES (
                gen_random_uuid(),
                juri_user_id,
                'Juri ' || bidang.nama,
                bidang.id
            );

            RAISE NOTICE '✅ Juri % dibuat: juri%@lks.com / password123 → %', juri_counter, juri_counter, bidang.nama;
        ELSE
            RAISE NOTICE '⚠️ Juri untuk bidang % sudah ada, skip.', bidang.nama;
        END IF;

        juri_counter := juri_counter + 1;
    END LOOP;

END $$;


-- =========================================================================
-- BAGIAN 6: SEED DATA PESERTA
-- =========================================================================

DO $$
DECLARE
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

    -- Ambil ID Bidang Lomba
    SELECT id INTO id_web FROM bidang_lomba WHERE kode = 'web-tech' LIMIT 1;
    SELECT id INTO id_cyber FROM bidang_lomba WHERE kode = 'cyber-security' LIMIT 1;
    SELECT id INTO id_design FROM bidang_lomba WHERE kode = 'graphic-design' LIMIT 1;
    SELECT id INTO id_cable FROM bidang_lomba WHERE kode = 'cabling' LIMIT 1;
    SELECT id INTO id_itnsa FROM bidang_lomba WHERE kode = 'itnsa' LIMIT 1;

    -- Cek apakah peserta sudah ada
    IF NOT EXISTS (SELECT 1 FROM peserta LIMIT 1) THEN

        -- Teknologi Web
        INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
        (gen_random_uuid(), 'Fajriansyah', 'WEB-001', id_kongbeng, id_web, 'fajriansyah-web'),
        (gen_random_uuid(), 'MUHAMMAD SHAMID DZAKKIR', 'WEB-002', id_bengalon, id_web, 'shamid-web'),
        (gen_random_uuid(), 'Ananda Bisma Putra Pratama', 'WEB-003', id_rantau_pulung, id_web, 'ananda-web');

        -- Teknologi Keamanan Siber
        INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
        (gen_random_uuid(), 'Rahayu Suci Prayitno', 'CYBER-001', id_kongbeng, id_cyber, 'rahayu-cyber'),
        (gen_random_uuid(), 'Juwita Novita Sari', 'CYBER-002', id_kongbeng, id_cyber, 'juwita-cyber'),
        (gen_random_uuid(), 'NADINE ATHIFA APRILIA', 'CYBER-003', id_sangatta_utara, id_cyber, 'nadine-cyber'),
        (gen_random_uuid(), 'CHENA MAULIDYA', 'CYBER-004', id_sangatta_utara, id_cyber, 'chena-cyber'),
        (gen_random_uuid(), 'Marinda Thalitasari', 'CYBER-005', id_rantau_pulung, id_cyber, 'marinda-cyber'),
        (gen_random_uuid(), 'Ahmad Dias Ashari', 'CYBER-006', id_rantau_pulung, id_cyber, 'ahmad-cyber');

        -- Teknologi Desain Grafis
        INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
        (gen_random_uuid(), 'Muhamad Radja Ihsan Zuhdi', 'DG-001', id_sangatta_utara, id_design, 'radja-dg'),
        (gen_random_uuid(), 'HABIL RAMADHAN', 'DG-002', id_bengalon, id_design, 'habil-dg'),
        (gen_random_uuid(), 'Elisya Nur Aghniyah Muslikhatul Jannah', 'DG-003', id_rantau_pulung, id_design, 'elisya-dg');

        -- Teknik Pengkabelan
        INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
        (gen_random_uuid(), 'Kevin Tegar Davika', 'CAB-001', id_kongbeng, id_cable, 'kevin-cab'),
        (gen_random_uuid(), 'ANDI MUHAMMAD ZAHRAN JAMAL', 'CAB-002', id_bengalon, id_cable, 'andi-cab'),
        (gen_random_uuid(), 'Muhammad Feri Pratama', 'CAB-003', id_rantau_pulung, id_cable, 'feri-cab');

        -- ITNSA
        INSERT INTO peserta (id, nama, nomor_peserta, sekolah_id, bidang_lomba_id, slug) VALUES
        (gen_random_uuid(), 'MAHESA ABDOLU SABIL', 'IT-001', id_sangatta_utara, id_itnsa, 'mahesa-it'),
        (gen_random_uuid(), 'M ALIF AL IKHWAN', 'IT-002', id_bengalon, id_itnsa, 'alif-it'),
        (gen_random_uuid(), 'AULIYA ALKAFFUNNISA', 'IT-003', id_rantau_pulung, id_itnsa, 'auliya-it');

        RAISE NOTICE '✅ Data peserta berhasil di-seed (18 peserta)';
    ELSE
        RAISE NOTICE '⚠️ Data peserta sudah ada, skip seed peserta.';
    END IF;

END $$;


-- =========================================================================
-- BAGIAN 7: VERIFIKASI DATA
-- =========================================================================

-- Cek jumlah data per tabel
SELECT 'bidang_lomba' AS tabel, COUNT(*) AS jumlah FROM bidang_lomba
UNION ALL
SELECT 'sekolah', COUNT(*) FROM sekolah
UNION ALL
SELECT 'peserta', COUNT(*) FROM peserta
UNION ALL
SELECT 'juri', COUNT(*) FROM juri
UNION ALL
SELECT 'modul', COUNT(*) FROM modul
UNION ALL
SELECT 'deskripsi_nilai', COUNT(*) FROM deskripsi_nilai;

-- Daftar akun yang bisa login:
SELECT 
    u.email, 
    j.nama AS nama_juri, 
    b.nama AS bidang_lomba
FROM auth.users u
LEFT JOIN juri j ON j.user_id = u.id
LEFT JOIN bidang_lomba b ON b.id = j.bidang_lomba_id
WHERE u.email LIKE '%@lks.com'
ORDER BY u.email;


-- =========================================================================
-- RINGKASAN AKUN LOGIN
-- =========================================================================
-- 
-- ┌─────────────────────┬──────────────┬───────────┐
-- │ Email               │ Password     │ Role      │
-- ├─────────────────────┼──────────────┼───────────┤
-- │ admin@lks.com       │ admin123     │ Admin     │
-- │ juri1@lks.com       │ password123  │ Juri      │
-- │ juri2@lks.com       │ password123  │ Juri      │
-- │ juri3@lks.com       │ password123  │ Juri      │
-- │ juri4@lks.com       │ password123  │ Juri      │
-- │ juri5@lks.com       │ password123  │ Juri      │
-- └─────────────────────┴──────────────┴───────────┘
-- 
-- Jalankan seluruh script ini di SQL Editor Supabase.
-- Setelah selesai, Anda bisa login dengan akun di atas.
-- =========================================================================
