import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Settings,
  Navigation,
  Store,
  ChevronLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { getManageStores, deleteStore } from "../../api/adminService";

export default function ManageStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const result = await getManageStores();
      setStores(result.data);
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const handleDeleteStore = async (id) => {
    const confirmed = window.confirm("Yakin ingin menghapus toko ini?");
    if (!confirmed) return;

    try {
      await deleteStore(id);
      await fetchStores();
      alert("Toko berhasil dihapus.");
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-lg font-black text-gray-800 tracking-tight uppercase">
            Kelola Toko Mitra
          </h1>
        </div>
        <button
          onClick={() => navigate("/super-admin/tambah-toko")}
          className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200 active:scale-90 transition-all"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="py-20 text-center font-bold text-gray-400 animate-pulse">
            Memuat daftar toko...
          </div>
        ) : stores.length > 0 ? (
          stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                  <Store size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-md font-black text-gray-800 leading-tight">
                    {store.store_name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-gray-400">
                    <MapPin size={12} />
                    <p className="text-[11px] font-medium truncate max-w-[200px]">
                      {store.address}
                    </p>
                  </div>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-[9px] font-black uppercase text-gray-500 rounded-full">
                    {store.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tombol ke Google Maps */}
                <button
                  onClick={() =>
                    openInGoogleMaps(store.latitude, store.longitude)
                  }
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-50 text-amber-700 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-amber-100 transition-all"
                >
                  <Navigation size={14} />
                  Maps
                </button>

                {/* Tombol Kelola Detail */}
                <button
                  onClick={() => navigate(`/super-admin/edit-toko/${store.id}`)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95 transition-all"
                >
                  <Settings size={14} />
                  Kelola
                </button>

                <button
                  onClick={() => handleDeleteStore(store.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-700 shadow-lg shadow-red-200 active:scale-95 transition-all"
                >
                  <Trash2 size={14} />
                  Hapus
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-400 font-medium italic">
            Belum ada toko terdaftar, ndes.
          </div>
        )}
      </main>
    </div>
  );
}
