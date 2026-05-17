import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://istsmkgxgpwtawltpmlp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzdHNta2d4Z3B3dGF3bHRwbWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjY3MDcsImV4cCI6MjA5NDQwMjcwN30.78GUeQZ3RsI9BLPhfk4lJMjQ70i2bp7znmxuTkeEueI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedJuri() {
  const { data: bidangData, error: errBidang } = await supabase.from('bidang_lomba').select('*');
  if (errBidang) return console.error('Error fetch bidang:', errBidang);
  
  console.log(`Ditemukan ${bidangData.length} bidang lomba.`);
  
  let juriCount = 1;
  
  for (const bidang of bidangData) {
    // Tentukan jumlah juri (1 atau 2 bergantian)
    const jumlahJuri = juriCount % 2 === 0 ? 2 : 1;
    console.log(`Membuat ${jumlahJuri} juri untuk bidang: ${bidang.nama}`);
    
    for (let i = 0; i < jumlahJuri; i++) {
      const email = `juri${juriCount}@lks.com`;
      const password = 'password123';
      const nama = `Juri ${juriCount} ${bidang.kode}`;
      
      console.log(`- Mendaftarkan ${email}...`);
      
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        console.error(`  Gagal sign up ${email}:`, authError.message);
        juriCount++;
        continue;
      }
      
      const userId = authData.user?.id;
      if (!userId) {
         console.log('  User ID tidak didapatkan, mungkin butuh konfirmasi email.');
      } else {
         // 2. Insert ke tabel juri
         const { error: insertError } = await supabase.from('juri').insert({
           user_id: userId,
           nama: nama,
           bidang_lomba_id: bidang.id
         });
         
         if (insertError) {
           console.error(`  Gagal insert ke tabel juri:`, insertError.message);
         } else {
           console.log(`  Berhasil dibuat: ${email} | Pass: ${password}`);
         }
      }
      juriCount++;
    }
  }
}

seedJuri();
