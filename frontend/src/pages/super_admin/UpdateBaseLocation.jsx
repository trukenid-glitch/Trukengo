import React, { useState, useEffect, useRef } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import MapSection from "../../components/MapSection";
import { MapPin, Navigation, ArrowLeft, Save } from "lucide-react";

import { getBaseLocation, updateBaseLocation } from '../../api/adminService';


const libraries = ["places"];

export default function UpdateBaseLocation() {
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);
  // Default ke Kendal kalau GPS belum nyala
  const [location, setLocation] = useState({ lat: -6.9147, lng: 110.2037 });
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // JANGAN SAMPAI KOSONG!
    libraries: libraries,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const result = await getBaseLocation();
        if (result.data.latitude && result.data.longitude) {
          setLocation({
            lat: parseFloat(result.data.latitude),
            lng: parseFloat(result.data.longitude)
          });
          setAddress(result.data.base_address || "");
        }
      } catch (err) {
        console.error("Gagal load lokasi awal:", err);
      }
    };
    fetchLocation();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateBaseLocation(location.lat, location.lng, address);
      alert("Lokasi Utama Berhasil Diperbarui, Ndes!");
      navigate("/super-admin/dashboard");
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi ambil lokasi dari HP/Browser
  const getMyLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newPos);
          setLoading(false);
          // Opsi: Panggil Reverse Geocoding di sini buat dapet nama jalannya
        },
        () => {
          alert("Gagal ambil lokasi. Pastikan izin GPS aktif, ndes!");
          setLoading(false);
        },
      );
    }
  };

  // Fungsi saat Map di-klik (pindah pin manual)
  const handleMapClick = (e) => {
    const clickedPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setLocation(clickedPos);
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setLocation(newPos);
        setAddress(place.formatted_address || "");
      }
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-lg text-center rounded-3xl border border-red-200 bg-red-50 p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-red-700 mb-3">
            Gagal memuat Google Maps
          </h1>
          <p className="text-sm text-red-600 mb-4">
            Periksa API key atau koneksi internet.{" "}
            {loadError.message || "Silakan coba lagi."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700"
          >
            Muat ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* HEADER */}
      <div className="p-4 border-b flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black text-gray-800">Set Lokasi Utama</h1>
          <p className="text-xs text-gray-500">
            Tentukan titik awal keberangkatan jastip
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* KIRI: PANEL KONTROL */}
        <div className="flex-1 min-h-[400px] bg-gray-200 relative">
          {isLoaded ? (
            <MapSection
              adminLocation={location}
              onMapClick={(e) =>
                setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })
              }
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 font-bold animate-pulse">
                Sedang Memuat Peta TrukenGo...
              </p>
            </div>
          )}
          {/* Overlay petunjuk */}
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-white/20 text-[10px] font-bold shadow-sm pointer-events-none">
            📍 Klik pada peta untuk memindah pin manual
          </div>
        </div>
        <div className="w-full md:w-[400px] p-6 border-r border-gray-100 z-10 bg-white">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                Cari Alamat / Nama Tempat
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPin size={18} />
                </div>
                {isLoaded ? (
                  <Autocomplete
                    onLoad={(autoC) => (autocompleteRef.current = autoC)}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <MapPin size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Ketik nama toko, jalan, atau gedung..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                      />
                    </div>
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    placeholder="Memuat Google Maps..."
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-400 cursor-not-allowed"
                  />
                )}
              </div>
            </div>

            <button
              onClick={getMyLocation}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition-all active:scale-95"
            >
              <Navigation size={18} className={loading ? "animate-spin" : ""} />
              {loading ? "Mencari Satelit..." : "Gunakan Lokasi HP Saya"}
            </button>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">
                Koordinat Terpilih
              </p>
              <div className="flex justify-between text-xs font-mono text-blue-800">
                <span>Lat: {location.lat.toFixed(6)}</span>
                <span>Lng: {location.lng.toFixed(6)}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Simpan Lokasi Utama
            </button>
          </div>
        </div>

        {/* KANAN: MAP FULL SCREEN */}
      </div>
    </div>
  );
}
