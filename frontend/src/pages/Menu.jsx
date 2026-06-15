import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Search, Utensils, Navigation, MessageSquareDot } from "lucide-react";
import { getAllStores } from "../api/customerService";
import { getImageUrl } from "../helper/wselver";

// DATA DUMMY (Gampang ditambahin/diubah)

export default function Menu() {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [searchTerm, setSearchTerm] = useState(""); // Input teks real-time
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Hasil text setelah didiamkan

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400); // Jeda waktu pencarian jalan otomatis

    return () => clearTimeout(delayDebounceFn); // Hapus timeout lama kalau user ngetik lagi sebelum 400ms
  }, [searchTerm]);

  // 1. Fetch data UTAMA (Dipicu saat pertama kali buka atau saat keyword debouncedSearch berubah)
  useEffect(() => {
    const fetchInitialStores = async () => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        // Reset page ke 1 setiap kali ada pencarian baru
        const result = await getAllStores(1, 5, debouncedSearch); 
        setStores(result.data);
        setPage(1); // Kembalikan ke halaman awal
        setHasMore(result.hasMore);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);      // Matikan loading utama
        setIsInitialLoad(false);
      }
    };
    
    fetchInitialStores();
  }, [debouncedSearch]); // Re-run effect jika kata kunci hasil debounce berubah

  // 2. Fungsi Load More saat di-scroll (Pastikan membawa parameter debouncedSearch)
  const loadMoreStores = async () => {
    if (fetchingMore || !hasMore) return;

    try {
      setFetchingMore(true);
      const nextPage = page + 1;
      const result = await getAllStores(nextPage, 5, debouncedSearch); // Bawa kata kunci pencarian
      
      setStores((prevStores) => [...prevStores, ...result.data]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Gagal load data berikutnya:", err);
    } finally {
      setFetchingMore(false);
    }
  };

  // 3. Listener Scroll Tetap Sama
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (docHeight - (scrollTop + windowHeight) < 100) {
        loadMoreStores();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, fetchingMore, debouncedSearch]); // Tambah debouncedSearch di dependensi

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
              value={searchTerm} // Ikat nilai input ke state searchTerm
              onChange={(e) => setSearchTerm(e.target.value)} // Update state tiap kali ngetik
              placeholder="Mau titip makanan apa hari ini?"
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* ==================== BANNER JASTIP MANUAL PREMIUM (BARU) ==================== */}
       {/* ==================== BANNER JASTIP MANUAL PREMIUM (WA LOGO VERSION) ==================== */}
        <div className="px-4 pb-2 max-w-md mx-auto">
          <div
            onClick={() => {
              const phoneNumber = "6283838072848";
              const message = encodeURIComponent("Halo Trukengo! Saya mau jastip dong, makanan yang saya cari belum ada di aplikasi.");
              window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
            }}
            className="flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/60 rounded-[24px] shadow-sm cursor-pointer active:scale-[0.98] transition-all duration-300"
          >
            {/* Kiri: Ikon & Teks */}
            <div className="flex items-center gap-3 pr-2">
              <div className="bg-amber-800 text-white p-2.5 rounded-2xl shadow-sm flex-shrink-0 animate-pulse">
                <MessageSquareDot size={18} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-xs font-black text-slate-800 tracking-tight leading-none mb-1">
                  Gak nemu yang dicari?
                </h4>
                <p className="text-[10px] font-bold text-amber-900/70 leading-tight">
                  Chat WhatsApp aja!
                </p>
              </div>
            </div>

            {/* Kanan: LOGO WHATSAPP (Ganti Tulisan Chat Admin) */}
            <div className="bg-[#25D366] p-2.5 rounded-2xl shadow-lg shadow-green-200 flex-shrink-0 active:scale-90 transition-transform">
              <svg 
                viewBox="0 0 24 24" 
                fill="white" 
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.895-5.338 11.898-11.896a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
          </div>
        </div>
        {/* ============================================================================= */}
        {/* ============================================================================= */}

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
          <div className={`px-4 max-w-md mx-auto space-y-4 mt-4 transition-opacity duration-200 ${searchTerm !== debouncedSearch ? 'opacity-50' : 'opacity-100'}`}>
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
              <div className="text-center py-20 text-gray-400 font-bold text-sm">
                "{debouncedSearch}" tidak ada. <br/>
                coba cari makanan lain
              </div>
            )}
          </div>
        )}

        {fetchingMore && (
            <div className="py-4 flex justify-center items-center gap-2">
              <div className="w-5 h-5 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-amber-950 uppercase tracking-widest animate-pulse">
                Loading
              </p>
            </div>
          )}

          {/* NOTIFIKASI JIKA DATA SUDAH HABIS */}
          {!hasMore && stores.length > 0 && (
            <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest py-6">
              Tidak ada data makanan lain
            </p>
          )}
      </div>
    </div>
  );
}
