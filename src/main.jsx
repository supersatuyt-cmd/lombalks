import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Tangkap hash rahasia dari Supabase (seperti reset password) SEBELUM React/Supabase jalan
// Jika tidak, script Supabase akan otomatis menghapus hash ini dari URL!
const hash = window.location.hash;
if (hash && (hash.includes('type=recovery') || hash.includes('error='))) {
  // Simpan hash ke memori sementara agar bisa dibaca oleh Login.jsx nanti
  sessionStorage.setItem('auth_hash', hash);
  
  if (window.location.pathname === '/') {
    // Lempar langsung ke halaman login beserta hash-nya
    window.location.href = '/login' + hash;
  } else {
    renderApp();
  }
} else {
  renderApp();
}

function renderApp() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
