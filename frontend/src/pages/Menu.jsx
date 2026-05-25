import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, Utensils } from 'lucide-react';
import { DUMMY_MENU } from '../utils/dataDummy';

// DATA DUMMY (Gampang ditambahin/diubah)

export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-2xl relative pb-20">
      {/* HEADER PREMIUM */}
        <div className="sticky top-0 z-[60] px-4 py-3">
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Tombol Back dengan Lingkaran Soft */}
              <button 
                onClick={() => navigate('/')}
                className="group p-2 bg-slate-900 -mt-6 text-white rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-slate-900/20 active:scale-90"
              >
                <ArrowLeft size={20} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
              </button>

              {/* Teks Judul dengan Aksen */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                    KATALOG <span className="text-amber-600">MENU</span>
                  </h1>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                  <span className="w-4 h-[1px] bg-slate-300"></span>
                  Truken Jastip Food
                </p>
              </div>
            </div>
          </div>
        </div>
      {/* SEARCH BAR (Biar makin pro) */}
      <div className="p-4 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Mau titip makanan apa hari ini?"
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* KONTEN MENU */}
      <div className="px-4 max-w-md mx-auto space-y-4">
        {DUMMY_MENU.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group active:scale-[0.98] transition-transform"
          >
            {/* Foto Makanan */}
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                src={item.galeri[0]} 
                alt={item.nama}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading='lazy'
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                <span className="text-xs font-black text-blue-600">{item.harga}</span>
              </div>
            </div>

            {/* Detail Makanan */}
            <div className="p-4">
              <h3 className="text-lg font-black text-slate-800 mb-1">{item.nama}</h3>
              <div className="flex items-center gap-1.5 text-gray-500 mb-4">
                <MapPin size={14} className="text-red-500" />
                <span className="text-xs font-medium">{item.lokasi}</span>
              </div>
              
              {/* // Di dalam Menu.jsx (bagian button) */}
                <button 
                onClick={() => navigate(`/menu/${item.id}`)}
                className="w-full py-3 bg-amber-700 text-white rounded-xl font-bold text-xs"
                >
                LIHAT DETAIL & PESAN
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER NOTE */}
      <div className="mt-8 text-center px-8 pb-10">
        <p className="text-xs text-gray-400 font-medium">
          Gak nemu yang dicari? Langsung chat ajah
        </p>
      </div>
    </div>
    </div>
  );
}