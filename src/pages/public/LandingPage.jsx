import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Layout';
import { ArrowRight, Trophy, Users, Award, Target, Lightbulb, ChevronDown, Star, Zap, Calendar, CheckCircle2, MapPin } from 'lucide-react';
import cyberSecSvg from '../../assets/cybersecurity.svg';
import webTechSvg from '../../assets/webtecnologies.svg';
import graphicDesignSvg from '../../assets/graphicdesign.svg';
import itNetworkSvg from '../../assets/itnetwork.svg';
import cablingSvg from '../../assets/undraw_local-server_9izb.svg';

export default function LandingPage() {
  const categories = [
    { name: 'Cyber Security', kode: 'cyber-security', customIcon: cyberSecSvg, color: 'from-blue-500 to-blue-700', desc: 'Keamanan Jaringan & Sistem Informasi' },
    { name: 'Web Technologies', kode: 'web-tech', customIcon: webTechSvg, color: 'from-emerald-500 to-emerald-700', desc: 'Pengembangan & Desain Aplikasi Web' },
    { name: 'Graphic Design', kode: 'graphic-design', customIcon: graphicDesignSvg, color: 'from-purple-500 to-purple-700', desc: 'Desain Grafis & Multimedia Kreatif' },
    { name: 'IT Network Systems', kode: 'itnsa', customIcon: itNetworkSvg, color: 'from-orange-500 to-orange-700', desc: 'Administrasi Infrastruktur Jaringan' },
    { name: 'Network Cabling', kode: 'cabling', customIcon: cablingSvg, color: 'from-cyan-500 to-cyan-700', desc: 'Teknik Pengkabelan Jaringan Informasi' },
  ];

  const features = [
    { icon: Target, title: 'Kompetisi Berkualitas', desc: 'Standar kompetisi nasional dengan juri berpengalaman dari industri.' },
    { icon: Award, title: 'Prestasi Gemilang', desc: 'Raih medali dan menjadi kebanggaan sekolah serta daerah.' },
    { icon: Users, title: 'Jaringan Luas', desc: 'Bertemu siswa berbakat dari seluruh Kabupaten Kutai Timur.' },
    { icon: Lightbulb, title: 'Pengembangan Skill', desc: 'Asah kemampuan menghadapi tantangan dunia kerja & industri 4.0.' },
  ];

  // Timeline with auto-status based on current date
  const today = new Date();
  const getStatus = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr || startStr);
    end.setHours(23, 59, 59);
    if (today > end) return 'completed';
    if (today >= start && today <= end) return 'active';
    return 'upcoming';
  };

  const timelineEvents = [
    { date: '1 - 10 Mei 2026', title: 'Pendaftaran Peserta', desc: 'Periode pendaftaran untuk seluruh peserta dari sekolah-sekolah SMK.', status: getStatus('2026-05-01', '2026-05-10') },
    { date: '11 - 12 Mei 2026', title: 'Verifikasi Data', desc: 'Verifikasi kelengkapan data peserta dan dokumen pendukung.', status: getStatus('2026-05-11', '2026-05-12') },
    { date: '15 - 16 Mei 2026', title: 'Technical Meeting', desc: 'Rapat teknis bersama juri dan panitia pelaksana lomba.', status: getStatus('2026-05-15', '2026-05-16') },
    { date: '23 Mei 2026', title: 'Pelaksanaan Lomba', desc: 'Kompetisi LKS tingkat Kabupaten Kutai Timur berlangsung.', status: getStatus('2026-05-23', '2026-05-23') },
    { date: '24 Mei 2026', title: 'Penjurian & Rekapitulasi', desc: 'Finalisasi penilaian dan rekapitulasi hasil oleh seluruh juri.', status: getStatus('2026-05-24', '2026-05-24') },
    { date: '25 Mei 2026', title: 'Pengumuman & Award', desc: 'Pengumuman pemenang dan malam penghargaan LKS 2026.', status: getStatus('2026-05-25', '2026-05-25') },
  ];

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden selection:bg-primary/20">

      {/* ============ NAVIGATION ============ */}
      <Header />

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
        {/* Dot Grid Pattern Background */}
        <div className="absolute inset-0 dot-pattern opacity-[0.07]"></div>

        {/* Decorative Blurred Circles */}
        <div className="absolute top-20 -left-20 w-80 h-80 bg-primary/15 rounded-full blur-[80px] animate-pulse-glow"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse-glow delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-[60px] animate-pulse-glow delay-500"></div>

        {/* Floating Decorative Shapes */}
        <div className="absolute top-32 right-[15%] w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl animate-float rotate-12 hidden lg:block"></div>
        <div className="absolute top-52 left-[10%] w-12 h-12 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-xl animate-float-slow rotate-45 hidden lg:block"></div>
        <div className="absolute bottom-40 right-[25%] w-10 h-10 bg-gradient-to-br from-emerald-300/25 to-teal-300/25 rounded-lg animate-float-reverse hidden lg:block"></div>
        <div className="absolute bottom-60 left-[20%] w-14 h-14 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-2xl animate-float delay-700 hidden lg:block"></div>

        {/* Small floating dots */}
        <div className="absolute top-40 left-[40%] w-3 h-3 bg-primary/40 rounded-full animate-float delay-300 hidden lg:block"></div>
        <div className="absolute top-60 right-[30%] w-2 h-2 bg-secondary/50 rounded-full animate-float-slow delay-500 hidden lg:block"></div>
        <div className="absolute bottom-32 left-[35%] w-4 h-4 bg-accent/40 rounded-full animate-float-reverse delay-200 hidden lg:block"></div>
        <div className="absolute top-80 right-[10%] w-3 h-3 bg-orange-400/30 rounded-full animate-float delay-1000 hidden lg:block"></div>
        <div className="absolute bottom-48 right-[40%] w-2.5 h-2.5 bg-emerald-400/35 rounded-full animate-float-slow delay-800 hidden lg:block"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="animate-on-load animate-slide-up inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-semibold mb-8 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                Live Penilaian Berlangsung
              </div>

              {/* Main Heading */}
              <h1 className="animate-on-load animate-slide-up delay-200 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark tracking-tight leading-[1.1] mb-6">
                Lomba Kompetensi{' '}
                <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient">
                  Siswa SMK 2026
                </span>
              </h1>

              <p className="animate-on-load animate-slide-up delay-400 max-w-xl mx-auto lg:mx-0 text-lg text-gray-500 mb-10 leading-relaxed">
                Wujudkan potensimu dan raih prestasi gemilang di ajang kompetisi keahlian paling bergengsi untuk siswa SMK se-Kabupaten Kutai Timur.
              </p>

              {/* Stats mini inline */}
              <div className="animate-on-load animate-slide-up delay-500 flex flex-wrap justify-center lg:justify-start gap-8 mb-10">
                <div>
                  <p className="text-3xl font-extrabold text-dark">5</p>
                  <p className="text-sm text-gray-400 font-medium">Bidang Lomba</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-dark">20
                    +</p>
                  <p className="text-sm text-gray-400 font-medium">Peserta</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-primary">100%</p>
                  <p className="text-sm text-gray-400 font-medium">Transparan</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="animate-on-load animate-slide-up delay-600 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/klasemen" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-full font-bold transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2.5 hover:-translate-y-1 text-base">
                  <Trophy className="h-5 w-5" /> Lihat Live Klasemen
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 text-dark hover:border-primary hover:text-primary rounded-full font-bold transition-all flex items-center justify-center gap-2.5 hover:-translate-y-1 shadow-sm text-base">
                  <Users className="h-5 w-5" /> Portal Juri
                </Link>
              </div>
            </div>

            {/* Right Content - Illustration with floating elements */}
            <div className="relative flex justify-center lg:justify-end animate-on-load animate-slide-in-right delay-300">
              <div className="relative w-full max-w-lg">
                {/* Decorative floating elements around illustration */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-accent/30 to-secondary/20 rounded-2xl animate-float rotate-12 blur-sm"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-primary/25 to-blue-400/20 rounded-full animate-float-slow delay-500"></div>
                <div className="absolute top-1/2 -left-10 w-12 h-12 bg-gradient-to-br from-orange-300/25 to-yellow-300/20 rounded-xl animate-float-reverse delay-300"></div>
                <div className="absolute -top-2 right-10 w-8 h-8 bg-gradient-to-br from-emerald-300/30 to-teal-300/20 rounded-lg animate-float delay-700"></div>

                {/* Glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 via-purple-100/30 to-accent/20 rounded-[2.5rem] blur-2xl scale-105"></div>

                {/* Main Image */}
                <div className="relative">
                  <img
                    src="/hero-illustration.png"
                    alt="Ilustrasi LKS 3D"
                    className="w-full h-auto object-contain drop-shadow-2xl rounded-3xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 animate-on-load animate-fade-in delay-2000">
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-scroll-bounce"></div>
          </div>
        </div>
      </section>

      {/* ============ HIDDEN SECTIONS (uncomment/hapus div hidden untuk menampilkan kembali) ============ */}
      <div className="hidden">
        <div className="relative -mt-1">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1360,75 1440,60 L1440,120 L0,120 Z" fill="white" fillOpacity="0.5" />
            <path d="M0,80 C320,110 640,30 960,80 C1200,110 1320,90 1440,80 L1440,120 L0,120 Z" fill="white" fillOpacity="0.8" />
          </svg>
        </div>

        {/* ============ ABOUT SECTION ============ */}
        <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-10 right-0 w-72 h-72 bg-blue-50 rounded-full blur-[80px] opacity-60"></div>
          <div className="absolute bottom-10 left-0 w-56 h-56 bg-accent/10 rounded-full blur-[70px] opacity-50"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left - SVG Illustration */}
              <div className="relative flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-accent/10 rounded-[3rem] blur-xl opacity-50"></div>
                <img src="/illustrations/about.svg" alt="Tentang LKS" className="relative w-full max-w-md animate-float-slow" />
              </div>

              {/* Right - Content */}
              <div>
                <span className="text-primary font-bold text-sm uppercase tracking-widest">Tentang LKS</span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-dark leading-tight">
                  Ajang Kompetisi Siswa SMK Terbesar di Kutai Timur
                </h2>
                <p className="mt-6 text-gray-500 text-lg leading-relaxed">
                  Lomba Kompetensi Siswa (LKS) adalah kompetisi tahunan yang diselenggarakan untuk menguji dan mengembangkan kemampuan siswa SMK di berbagai bidang keahlian dengan standar profesional.
                </p>

                {/* Features Grid */}
                <div className="mt-10 grid sm:grid-cols-2 gap-6">
                  {features.map((f, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
                        <f.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-dark">{f.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wave: About(white) → Categories(bg-background) */}
        <div className="relative -mt-2 bg-white">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full block" preserveAspectRatio="none" style={{ height: '60px' }}>
            <path d="M0,30 C480,80 960,0 1440,40 L1440,80 L0,80 Z" fill="#f0f7ff" />
          </svg>
        </div>

        {/* ============ CATEGORIES SECTION ============ */}
        <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-2xl rotate-12 animate-float hidden lg:block"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-accent/15 rounded-full animate-float-slow hidden lg:block"></div>
          <div className="absolute top-1/2 right-20 w-4 h-4 bg-secondary/30 rounded-full animate-float-reverse hidden lg:block"></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-orange-400/25 rounded-full animate-float delay-500 hidden lg:block"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-primary font-bold text-sm uppercase tracking-widest">Bidang Kompetisi</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-dark text-balance">
                Kategori Keahlian yang Dilombakan
              </h2>
              <p className="mt-4 text-gray-500 text-lg">
                Berbagai bidang keahlian teknologi dan informatika yang siap diuji secara profesional dan transparan.
              </p>
            </div>

            {/* Category Cards - Large with SVG illustrations */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, idx) => (
                <Link
                  to={`/bidang/${cat.kode}`}
                  key={idx}
                  className={`group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 overflow-hidden ${idx >= 3 ? 'lg:col-span-1' : ''}`}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-3xl`}></div>

                  {/* Decorative corner circle */}
                  <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${cat.color} opacity-[0.06] rounded-full group-hover:opacity-[0.12] group-hover:scale-125 transition-all duration-500`}></div>

                  {/* SVG Illustration - BIG */}
                  <div className="relative w-28 h-28 mb-6 group-hover:scale-110 transition-transform duration-500">
                    <img src={cat.customIcon} alt={cat.name} className="w-full h-full object-contain drop-shadow-md" />
                  </div>

                  <h3 className="font-bold text-xl text-dark mb-2 group-hover:text-primary transition-colors duration-300">{cat.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>

                  {/* Arrow indicator */}
                  <div className="mt-6 flex items-center gap-2 text-primary/0 group-hover:text-primary transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                    <span className="text-sm font-semibold">Lihat Detail</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link to="/klasemen" className="inline-flex items-center gap-2.5 text-primary font-bold hover:text-primary/80 transition-colors text-lg group">
                Lihat Seluruh Bidang di Klasemen
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Wave: Categories(bg-background) → Timeline(white) */}
        <div className="relative -mt-2 bg-[#f0f7ff]">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full block" preserveAspectRatio="none" style={{ height: '60px' }}>
            <path d="M0,50 C320,0 720,80 1080,30 C1280,10 1380,25 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>

        {/* ============ TIMELINE SECTION ============ */}
        <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
          <div className="absolute top-10 left-0 w-56 h-56 bg-blue-50 rounded-full blur-[80px] opacity-50"></div>
          <div className="absolute bottom-10 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[70px] opacity-40"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-primary font-bold text-sm uppercase tracking-widest">Timeline</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-dark text-balance">
                Jadwal Pelaksanaan LKS 2026
              </h2>
              <p className="mt-4 text-gray-500 text-lg">
                Catat tanggal penting dan persiapkan dirimu untuk setiap tahapan kompetisi.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 md:-translate-x-1/2"></div>

              <div className="space-y-10">
                {timelineEvents.map((event, index) => (
                  <div
                    key={index}
                    className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-4 md:left-1/2 w-4 h-4 rounded-full md:-translate-x-1/2 z-10 ${event.status === 'completed'
                      ? 'bg-primary'
                      : event.status === 'active'
                        ? 'bg-orange-400 ring-4 ring-orange-200'
                        : 'bg-gray-300'
                      }`}>
                      {event.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <div className={`bg-white rounded-2xl p-6 border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${event.status === 'active' ? 'border-orange-300 shadow-orange-100' : 'border-gray-100'
                        }`}>
                        <div className={`flex items-center gap-2 text-sm font-semibold mb-2 ${index % 2 === 0 ? 'md:justify-end' : ''
                          } ${event.status === 'active' ? 'text-orange-500' : 'text-gray-400'}`}>
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </div>
                        <h3 className="text-lg font-bold text-dark">{event.title}</h3>
                        <p className="mt-1 text-gray-500 text-sm">{event.desc}</p>
                        {event.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-xs font-bold border border-orange-200">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400"></span>
                            </span>
                            Sedang Berlangsung
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Empty space for alternating layout */}
                    <div className="hidden md:block md:w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ============ CTA SECTION ============ */}
        <section className="relative pt-32 pb-40 overflow-hidden -mt-2">
          {/* Full blue background */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark via-primary to-secondary"></div>

          {/* White wave overlay at top - seamless transition from white timeline */}
          <div className="absolute top-0 left-0 right-0 z-10">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full block" preserveAspectRatio="none" style={{ height: '80px' }}>
              <path d="M0,0 L1440,0 L1440,60 C1260,100 960,20 720,70 C480,120 240,40 0,80 Z" fill="white" />
            </svg>
          </div>

          {/* Pattern overlay */}
          <div className="absolute inset-0 dot-pattern opacity-[0.06]"></div>

          {/* Floating decorations */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-2xl rotate-12 animate-float hidden lg:block"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/5 rounded-full animate-float-slow hidden lg:block"></div>
          <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-accent/10 rounded-lg animate-float-reverse hidden lg:block"></div>
          <div className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-white/10 rounded-full animate-float delay-500 hidden lg:block"></div>

          {/* Large decorative circles */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-white/5"></div>
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full border border-white/5"></div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-8 backdrop-blur-sm border border-white/10">
              <Star className="h-4 w-4 text-yellow-300" />
              Penilaian Realtime & Transparan
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
              Siap Melihat Para Juara?
            </h2>
            <p className="text-blue-100/80 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
              Seluruh penilaian dilakukan secara realtime dan transparan. Pantau terus pergerakan klasemen lomba kompetensi siswa tahun ini!
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link to="/klasemen" className="px-8 py-4 bg-white text-primary hover:bg-gray-50 rounded-full font-bold transition-all shadow-xl hover:shadow-white/20 hover:-translate-y-1 flex items-center gap-2.5 text-base">
                <Zap className="h-5 w-5" />
                Buka Dashboard Klasemen
              </Link>
              <Link to="/login" className="px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 rounded-full font-bold transition-all flex items-center gap-2.5 hover:-translate-y-1 text-base backdrop-blur-sm">
                <Users className="h-5 w-5" />
                Hubungi Panitia
              </Link>
            </div>

            {/* Stats in CTA */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { val: '5+', label: 'Bidang Lomba' },
                { val: '30+', label: 'Peserta Terbaik' },
                { val: '10+', label: 'Juri Profesional' },
                { val: '100%', label: 'Transparansi' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{s.val}</p>
                  <p className="text-blue-200/70 text-sm font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wave at bottom of CTA - seamless */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: '80px' }}>
              <path d="M0,40 C360,100 720,0 1080,50 C1260,75 1360,60 1440,40 L1440,100 L0,100 Z" fill="#0a1e36" />
            </svg>
          </div>
        </section>
      </div>
      {/* ============ END HIDDEN SECTIONS ============ */}

      {/* ============ WAVE TO FOOTER ============ */}
      <div className="relative -mb-1">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: '80px' }}>
          <path d="M0,40 C360,100 720,0 1080,50 C1260,75 1360,60 1440,40 L1440,120 L0,120 Z" fill="#0a1e36" />
        </svg>
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0a1e36] text-white pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Organizer Logos */}
          <div className="flex flex-col items-center mb-12">
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-6 font-medium">Diselenggarakan Oleh</p>
            <div className="flex items-center gap-10">
              <img src="/logo-lks.png" alt="Logo LKS" className="h-24 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <div className="w-px h-16 bg-gray-600"></div>
              <img src="/logo-mkn.png" alt="Logo MKN" className="h-24 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/lks-icon.png" alt="LKS" className="w-9 h-9 object-contain" />
              <span className="font-extrabold text-xl tracking-tight">LKS<span className="text-accent">Dikmen</span></span>
            </div>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-8">
              Sistem penilaian dan monitoring LKS Dikmen Kabupaten Kutai Timur. Transparan, real-time, dan profesional.
            </p>

            <div className="flex gap-6 mb-8 text-sm">
              <Link to="/klasemen" className="text-gray-400 hover:text-white transition-colors">Klasemen</Link>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Portal Juri</Link>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Bantuan</a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} LKS Dikmen Kabupaten Kutai Timur. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
