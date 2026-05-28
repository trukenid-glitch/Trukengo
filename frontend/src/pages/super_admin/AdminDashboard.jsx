import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MapPin, 
    PlusCircle, 
    UserPlus, 
    Settings, 
    Store, 
    LogOut, 
    ChevronRight 
} from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [baseLocation, setBaseLocation] = useState("Kendal, Jawa Tengah"); // Default

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
    
      {/* SIDEBAR (Hidden on Mobile, shown on Desktop) */}
        <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6">
            <h1 className="text-xl font-black text-blue-600 tracking-tighter">TRUKEN<span className="text-gray-800">GO</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex items-center gap-3 font-bold text-sm">
            <Settings size={18} /> Dashboard
            </div>
            <button onClick={() => navigate('/admin/tambah-toko')} className="w-full p-3 text-gray-600 hover:bg-gray-100 rounded-xl flex items-center gap-3 text-sm transition-all text-left">
            <Store size={18} /> Toko & Menu
            </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full p-3 text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 text-sm font-bold transition-all">
            <LogOut size={18} /> Keluar
            </button>
        </div>
        </div>

      {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">
        
        {/* HEADER MOBILE */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center md:hidden">
            <h1 className="font-black text-blue-600">TRUKENGO</h1>
            <button onClick={handleLogout} className="text-red-500"><LogOut size={20}/></button>
        </header>

        <main className="p-6 md:p-10 max-w-5xl">
            <header className="mb-8">
                <h2 className="text-2xl font-black text-gray-800">Dashboard Utama</h2>
                <p className="text-gray-500 text-sm">Kelola operasional jastip TrukenGo hari ini.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD: SET LOKASI UTAMA */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center mb-4">
                    <MapPin size={24} />
                </div>
                <h3 className="font-bold text-gray-800">Lokasi Utama (Basecamp)</h3>
                <p className="text-xs text-gray-500 mb-4">Patokan jarak awal untuk cek ongkir.</p>
                </div>
                <button 
                    onClick={() => navigate('/super-admin/set-location')}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 mt-4"
                >
                    Update Lokasi
                </button>
            </div>

            {/* CARD: MANAJEMEN MENU & TOKO */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4">
                <PlusCircle size={24} />
                </div>
                <h3 className="font-bold text-gray-800">Produk & Toko</h3>
                <p className="text-xs text-gray-500 mb-4">Tambah mitra toko atau katalog makanan baru.</p>
                <div className="space-y-2">
                <button 
                    onClick={() => navigate('/super-admin/tambah-toko')}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 mt-4"
                >
                    Tambah Toko / Menu
                </button>
                </div>
            </div>

            {/* CARD: DAFTARKAN DRIVER */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                    <UserPlus size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Registrasi Driver</h3>
                    <p className="text-xs text-gray-500">Daftarkan driver baru ke dalam sistem jastip.</p>
                </div>
                </div>
                <button 
                onClick={() => navigate('/admin/register-driver')}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                >
                Buat Akun Driver
                </button>
            </div>

            </div>

          {/* QUICK STATS (Opsional) */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Total User', val: '128' },
                { label: 'Driver Aktif', val: '12' },
                { label: 'Mitra Toko', val: '45' },
                { label: 'Order Hari Ini', val: '89' },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase">{stat.label}</p>
                <p className="text-xl font-black text-gray-800">{stat.val}</p>
                </div>
            ))}
            </div>
        </main>
        </div>
    </div>
);
}