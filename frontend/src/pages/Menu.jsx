import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Search, Utensils, Navigation } from "lucide-react";
import { getAllStores } from "../api/customerService";
import { getImageUrl } from "../helper/wselver";

// DATA DUMMY (Gampang ditambahin/diubah)

export default function Menu() {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const result = await getAllStores();
        setStores(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-2xl relative pb-20">
       {/* HEADER PREMIUM */}
        <div className="sticky top-0 z-[60] pl-4 py-3">
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm"></div>

          <div className="relative flex items-center">
            {/* SISI KIRI: TEKS JUDUL */}
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-1">
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                  KATALOG <span className="text-amber-800">MENU</span>
                </h1>
              </div>
              <div className="flex justify-between w-full pr-5 pl-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1 mt-1">
                  <span className="w-4 h-[1px] bg-slate-300"></span>
                  TRUKENGO
                </p>
                <button
                  onClick={() => {
                    // Trigger untuk membuka modal order atau modal khusus cek ongkir
                    navigate('/cek-ongkir')
                  }}
                  className="flex items-center justify-between  bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-md shadow-amber-800/20 active:scale-95 transition-all duration-300"
                >
                  <Navigation size={12} className="animate-pulse " />
                  Cek Ongkir
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* SEARCH BAR (Biar makin pro) */}
        <div className="p-4 max-w-md mx-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Mau titip makanan apa hari ini?"
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* KONTEN MENU */}
        {loading ? (
           <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[999]">
        {/* Container Ikon */}
        <div className="relative flex items-center justify-center">
          {/* Lingkaran Luar yang Muter */}
          <div className="absolute w-20 h-20 border-4 border-amber-100 border-t-amber-800 rounded-full animate-spin"></div>

          {/* Ikon Truk di Tengah */}
          <div className="relative bg-amber-800 p-4 rounded-2xl shadow-lg animate-bounce">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              className="w-8 h-8"
            >
              <path d="M10 17h4V5H2v12h3m5 0h20v-5h-3m-10 5a2 2 0 104 0 2 2 0 10-4 0zm10 0a2 2 0 104 0 2 2 0 10-4 0zM13 17V9h4l3 3v5" />
            </svg>
          </div>
        </div>

        {/* Teks Loading */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            TRUKEN
          </h2>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-[0.2em]">
              Menyiapkan Makanan
            </span>
            <span className="flex gap-0.5">
              <span className="w-1 h-1 bg-amber-800 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1 h-1 bg-amber-800 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1 h-1 bg-amber-800 rounded-full animate-bounce"></span>
            </span>
          </div>
        </div>
      </div>
        ) : (
          <div className="px-4 max-w-md mx-auto space-y-4 mt-4">
            {stores.length > 0 ? (
              stores.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group"
                >
                  {/* Foto Produk Pertama */}
                  <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                    <img
                      src={
                        item.product_photos?.[0] ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={item.store_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-xl shadow-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em] drop-shadow-sm">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-black text-slate-800 leading-tight">
                        {item.store_name}
                      </h3>
                      
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-700 mb-2">
                      <span className="text-[12px] font-medium truncate">
                        {item.address}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-700 mb-2">
                      <span className="text-[12px] font-medium truncate">
                         Rp {parseInt(item.price).toLocaleString()}
                      </span>
                    </div>
  
                    <div className="w-full flex justify-end">
                    <button
                      onClick={() => navigate(`/menu/${item.id}`)}
                      className="w-1/2 py-3 bg-amber-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-slate-200 active:scale-95 transition-all"
                    >
                      PESAN
                    </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-400">
                Belum ada toko yang buka nih.
              </div>
            )}
          </div>
        )}

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
