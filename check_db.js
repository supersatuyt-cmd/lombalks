import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://istsmkgxgpwtawltpmlp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzdHNta2d4Z3B3dGF3bHRwbWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjY3MDcsImV4cCI6MjA5NDQwMjcwN30.78GUeQZ3RsI9BLPhfk4lJMjQ70i2bp7znmxuTkeEueI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: p } = await supabase.from('peserta').select('*');
  console.log("Peserta count:", p?.length);

  const { data: b } = await supabase.from('bidang_lomba').select('*');
  console.log("Bidang lomba:", b?.map(x => x.kode));
}
check();
