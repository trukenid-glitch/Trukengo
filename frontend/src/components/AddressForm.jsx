// src/components/AddressForm.jsx
import React, { useRef, useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { MapPin, Store, User, Navigation } from 'lucide-react';

export default function AddressForm({ setStoreLocation, setCustomerLocation, customerLocation, onCalculate, isReady,  }) {
  const storeInputRef = useRef();
  const customerInputRef = useRef();
  const [isLocating, setIsLocating] = useState(false);

  const onStorePlaceChanged = () => {
    const place = storeInputRef.current.getPlace();
    if (place.geometry) {
      setStoreLocation({
        address: place.formatted_address,
        coords: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }
      });
    }
  };

  const onCustomerPlaceChanged = () => {
    const place = customerInputRef.current.getPlace();
    if (place.geometry) {
      setCustomerLocation({
        address: place.formatted_address,
        coords: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }
      });
    }
  };

  // FUNGSI AMBIL LOKASI USER
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser kamu tidak mendukung fitur lokasi.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Gunakan Geocoder untuk mengubah koordinat jadi teks alamat
        // eslint-disable-next-line no-undef
        const geocoder = new google.maps.Geocoder();
        
        try {
          const response = await geocoder.geocode({
            location: { lat: latitude, lng: longitude }
          });

          if (response.results[0]) {
            const address = response.results[0].formatted_address;
            
            // 1. Update Input secara visual
            const inputElement = document.getElementById('customer-input');
            if (inputElement) inputElement.value = address;

            // 2. Update State
            setCustomerLocation({
              address: address,
              coords: { lat: latitude, lng: longitude }
            });
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          alert("Gagal mendapatkan nama alamat.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        alert("Gagal mengambil lokasi. Pastikan izin lokasi aktif.");
      }
    );
  };

  const autocompleteOptions = {
    componentRestrictions: { country: "id" }, // Mengunci pencarian hanya di Indonesia
    fields: ["address_components", "geometry", "icon", "name", "formatted_address"],
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-left">

      {/* TAB SELECTOR NDES! */}
      <div className=" mb-6">
        <p className="text-[12px] font-bold text-black capitalize tracking-tight italic">
          💡 Tips: Klik tombol "lokasi saya" untuk menentukan lokasi anda
        </p>
      </div>

      {/* Input Toko */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Store size={16} className={setStoreLocation ? "text-black" : "text-gray-400"} />
          Alamat Toko 
        </label>
        <Autocomplete onLoad={(autoC) => storeInputRef.current = autoC} onPlaceChanged={onStorePlaceChanged} options={autocompleteOptions}>
          <input
            type="text"
            placeholder="Cari nama toko atau jalan"
            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-600 outline-none transition-all shadow-sm text-sm"
            options={autocompleteOptions}
          />
        </Autocomplete>
      </div>

     {/* Input Customer */}
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <User size={16} className="text-black" />
        Lokasi Anda 
      </label>

      <div className="relative flex items-center">
        <Autocomplete 
          onLoad={(autoC) => customerInputRef.current = autoC} 
          onPlaceChanged={onCustomerPlaceChanged} 
          options={autocompleteOptions}
          className="w-full" // Pastikan Autocomplete memenuhi lebar container
        >
          <input
            id="customer-input"
            type="text"
            placeholder="Cari lokasi anda"
            className="w-full p-3 pr-24 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-600 outline-none transition-all shadow-sm text-sm"
          />
        </Autocomplete>

       {/* TOMBOL LOKASI SAYA (DI DALAM INPUT) */}
        <button 
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className={`
            absolute right-1.5 px-3 py-2 rounded-2xl flex items-center gap-1.5 transition-all duration-300
            ${isLocating 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-90'
            }
          `}
          title="Gunakan lokasi GPS saya saat ini"
        >
          {/* Ikon dengan efek denyut kalau lagi mencari */}
          <div className="relative">
            <Navigation 
              size={14} 
              className={`${isLocating ? "animate-spin" : "animate-pulse"}`} 
            />
            {!isLocating && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-100 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-200"></span>
              </span>
            )}
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest">
            {isLocating ? "Mencari..." : "Lokasi Saya"}
          </span>
        </button>
      </div>
    </div>

    <button
  onClick={onCalculate}
  // Tombol aktif kalau customerLocation sudah ada isinya
  disabled={!customerLocation} 
  className={`w-full py-3 mt-2 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
    customerLocation // Ganti isReady jadi customerLocation di sini juga
    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
  }`}
>
  <MapPin size={18} />
  Hitung Ongkir
</button>
    </div>
  );
}