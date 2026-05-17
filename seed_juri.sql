-- =========================================================================
-- SCRIPT SEED DATA JURI (Dijalankan di Supabase SQL Editor)
-- PENTING: Jalankan ini setelah memastikan RLS pada tabel juri dinonaktifkan
-- atau setelah memastikan policy juri membolehkan insert.
-- =========================================================================

-- Matikan sementara RLS jika belum
ALTER TABLE juri DISABLE ROW LEVEL SECURITY;

-- Fungsi pembantu untuk membuat akun juri
DO $$
DECLARE
    bidang RECORD;
    new_user_id UUID;
    juri_count INT := 1;
    jumlah_juri INT;
    i INT;
BEGIN
    FOR bidang IN SELECT id, nama, kode FROM bidang_lomba LOOP
        -- Tentukan jumlah juri (selang-seling 1 atau 2 juri per bidang)
        IF juri_count % 2 = 0 THEN
            jumlah_juri := 2;
        ELSE
            jumlah_juri := 1;
        END IF;

        FOR i IN 1..jumlah_juri LOOP
            new_user_id := gen_random_uuid();
            
            -- 1. Insert ke tabel auth.users
            -- Password default untuk semua juri: password123
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, 
                email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, 
                raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, 
                email_change_token_new, recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 
                'juri' || juri_count || '_' || bidang.kode || '@lks.com', 
                crypt('password123', gen_salt('bf')), 
                now(), now(), now(), '{"provider":"email","providers":["email"]}', 
                '{}', now(), now(), '', '', '', ''
            );

            -- 2. Insert ke tabel public.juri
            INSERT INTO public.juri (id, user_id, nama, bidang_lomba_id)
            VALUES (
                gen_random_uuid(),
                new_user_id,
                'Juri ' || juri_count || ' (' || bidang.nama || ')',
                bidang.id
            );

            juri_count := juri_count + 1;
        END LOOP;
    END LOOP;
END $$;
