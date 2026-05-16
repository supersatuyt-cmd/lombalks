-- Data Bidang Lomba
INSERT INTO bidang_lomba (kode, nama) VALUES
('web-tech', 'Teknologi Web (Web Technologies)'),
('cyber-security', 'Teknologi Keamanan Siber (Cyber Security)'),
('graphic-design', 'Teknologi Desain Grafis (Graphic Design)'),
('cabling', 'Teknik Pengkabelan Jaringan Informasi (Information Network Cable)'),
('itnsa', 'Teknologi Informasi Sistem Administrasi (IT Network System Administration)')
ON CONFLICT (kode) DO NOTHING;

-- Data Sekolah
INSERT INTO sekolah (nama) VALUES
('SMK Negeri 1 Kongbeng'),
('SMKN 1 Bengalon'),
('SMKN 1 Rantau Pulung'),
('SMKN 1 Sangatta Utara')
ON CONFLICT DO NOTHING; -- Asumsi jika nama sekolah unique

-- Script insert Peserta menggunakan subquery untuk mendapatkan ID bidang & sekolah
-- Teknologi Web
INSERT INTO peserta (bidang_lomba_id, sekolah_id, nama, slug, nomor_peserta) VALUES
(
  (SELECT id FROM bidang_lomba WHERE kode = 'web-tech' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMK Negeri 1 Kongbeng' LIMIT 1),
  'Fajriansyah', 'fajriansyah-web', 'WEB-001'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'web-tech' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Bengalon' LIMIT 1),
  'MUHAMMAD SHAMID DZAKKIR', 'muhammad-shamid-dzakkir-web', 'WEB-002'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'web-tech' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Rantau Pulung' LIMIT 1),
  'Ananda Bisma Putra Pratama', 'ananda-bisma-web', 'WEB-003'
);

-- Teknologi Keamanan Siber
INSERT INTO peserta (bidang_lomba_id, sekolah_id, nama, slug, nomor_peserta) VALUES
(
  (SELECT id FROM bidang_lomba WHERE kode = 'cyber-security' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMK Negeri 1 Kongbeng' LIMIT 1),
  'Rahayu Suci Prayitno', 'rahayu-suci-cyber', 'CYBER-001'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'cyber-security' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMK Negeri 1 Kongbeng' LIMIT 1),
  'Juwita Novita Sari', 'juwita-novita-cyber', 'CYBER-002'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'cyber-security' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Sangatta Utara' LIMIT 1),
  'NADINE ATHIFA APRILIA', 'nadine-athifa-cyber', 'CYBER-003'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'cyber-security' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Sangatta Utara' LIMIT 1),
  'CHENA MAULIDYA', 'chena-maulidya-cyber', 'CYBER-004'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'cyber-security' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Rantau Pulung' LIMIT 1),
  'Marinda Thalitasari', 'marinda-thalita-cyber', 'CYBER-005'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'cyber-security' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Rantau Pulung' LIMIT 1),
  'Ahmad Dias Ashari', 'ahmad-dias-cyber', 'CYBER-006'
);

-- Teknologi Desain Grafis
INSERT INTO peserta (bidang_lomba_id, sekolah_id, nama, slug, nomor_peserta) VALUES
(
  (SELECT id FROM bidang_lomba WHERE kode = 'graphic-design' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Sangatta Utara' LIMIT 1),
  'Muhamad Radja Ihsan Zuhdi', 'radja-ihsan-design', 'DG-001'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'graphic-design' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Bengalon' LIMIT 1),
  'HABIL RAMADHAN', 'habil-ramadhan-design', 'DG-002'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'graphic-design' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Rantau Pulung' LIMIT 1),
  'Elisya Nur Aghniyah Muslikhatul Jannah', 'elisya-nur-design', 'DG-003'
);

-- Teknik Pengkabelan
INSERT INTO peserta (bidang_lomba_id, sekolah_id, nama, slug, nomor_peserta) VALUES
(
  (SELECT id FROM bidang_lomba WHERE kode = 'cabling' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMK Negeri 1 Kongbeng' LIMIT 1),
  'Kevin Tegar Davika', 'kevin-tegar-cabling', 'CAB-001'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'cabling' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Bengalon' LIMIT 1),
  'ANDI MUHAMMAD ZAHRAN JAMAL', 'zahran-jamal-cabling', 'CAB-002'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'cabling' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Rantau Pulung' LIMIT 1),
  'Muhammad Feri Pratama', 'feri-pratama-cabling', 'CAB-003'
);

-- IT Network System Administration
INSERT INTO peserta (bidang_lomba_id, sekolah_id, nama, slug, nomor_peserta) VALUES
(
  (SELECT id FROM bidang_lomba WHERE kode = 'itnsa' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Sangatta Utara' LIMIT 1),
  'MAHESA ABDOLU SABIL', 'mahesa-abdolu-itnsa', 'IT-001'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'itnsa' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Bengalon' LIMIT 1),
  'M ALIF AL IKHWAN', 'alif-ikhwan-itnsa', 'IT-002'
),
(
  (SELECT id FROM bidang_lomba WHERE kode = 'itnsa' LIMIT 1),
  (SELECT id FROM sekolah WHERE nama = 'SMKN 1 Rantau Pulung' LIMIT 1),
  'AULIYA ALKAFFUNNISA', 'auliya-alkaffunnisa-itnsa', 'IT-003'
);
