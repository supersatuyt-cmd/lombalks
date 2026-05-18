-- =========================================================================
-- SCRIPT PEMBUATAN AKUN ADMIN
-- Jalankan script ini di SQL Editor Supabase Anda
-- =========================================================================

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Cek apakah admin sudah ada
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@lks.com';
    
    IF admin_user_id IS NULL THEN
        admin_user_id := gen_random_uuid();
        
        -- 1. Insert ke auth.users
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

        -- 2. Insert ke auth.identities
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

        -- 3. Insert ke tabel juri (sebagai bypass agar sistem web membaca data profile)
        -- Admin dikaitkan dengan satu bidang_lomba secara acak sebagai syarat relasi database
        INSERT INTO public.juri (id, user_id, nama, bidang_lomba_id) VALUES (
            gen_random_uuid(),
            admin_user_id,
            'Administrator',
            (SELECT id FROM public.bidang_lomba LIMIT 1) 
        );

        RAISE NOTICE '✅ Akun Admin berhasil dibuat!';
        RAISE NOTICE 'Email: admin@lks.com';
        RAISE NOTICE 'Password: admin123';
    ELSE
        RAISE NOTICE '⚠️ Akun Admin (admin@lks.com) sudah terdaftar di database.';
    END IF;
END $$;
