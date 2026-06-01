// src/pages/DetailMenu.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShoppingCart,
  X,
  DollarSign,
} from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import { getStoreDetail, getPricingConfig } from "../api/customerService";
import { getBaseLocationOpen } from "../api/adminService";
import PriceCalculator from "../components/PriceCalculator";

const libraries = ["places"];

export default function DetailMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const priceCalcRef = useRef(null);

  // Load Google Maps API
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [note, setNote] = useState("");
  const [extraMenu, setExtraMenu] = useState("");
  const [userLocation, setUserLocation] = useState("");

  // Shipping Fee Calculator State
  const [shippingFee, setShippingFee] = useState(0);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [pricingConfig, setPricingConfig] = useState(null);
  const [calcStep, setCalcStep] = useState("idle");

  const isProcessing = [
    "fetching_base",
    "calc_pickup",
    "calc_delivery",
  ].includes(calcStep);
  const calcStatusLabel =
    calcStep === "fetching_base"
      ? "Mencari Basecamp..."
      : calcStep === "calc_pickup"
        ? "Menuju Toko..."
        : calcStep === "calc_delivery"
          ? "Simulasi ke Rumahmu..."
          : calcStep === "done"
            ? "Perhitungan selesai"
            : "";
  const progressWidth =
    calcStep === "fetching_base"
      ? "20%"
      : calcStep === "calc_pickup"
        ? "60%"
        : calcStep === "calc_delivery"
          ? "100%"
          : "0%";

  // Fungsi untuk Calculate Shipping Fee (Gunakan Google Maps untuk akurasi)
  const handleCalculateShipping = async () => {
    if (!produk) return;

    try {
      // Step 1: Get customer location using geolocation
      setCalcStep("fetching_base");
      const customerCoords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          reject,
        );
      });

      // Step 2: Fetch base location (admin/driver)
      const baseLocationData = await getBaseLocationOpen();
      const adminCoords = baseLocationData.data;

      // Konversi koordinat ke number jika string, handle comma decimal separator
      const parseCoord = (val) => {
        if (typeof val === "string") {
          return Number(val.replace(",", "."));
        }
        return Number(val);
      };

      const adminLat = parseCoord(adminCoords.latitude);
      const adminLng = parseCoord(adminCoords.longitude);
      const storeLat = parseCoord(produk.latitude);
      const storeLng = parseCoord(produk.longitude);
      const customerLat = customerCoords.latitude;
      const customerLng = customerCoords.longitude;

      // Validasi koordinat
      if (
        isNaN(adminLat) ||
        isNaN(adminLng) ||
        isNaN(storeLat) ||
        isNaN(storeLng) ||
        isNaN(customerLat) ||
        isNaN(customerLng)
      ) {
        throw new Error("Koordinat tidak valid");
      }

      // Step 3: Hitung jarak menggunakan Google Maps Distance Matrix API (SAMA SEPERTI HOME.JSX)
      // eslint-disable-next-line no-undef
      const distanceService = new google.maps.DistanceMatrixService();

      // Calculate pickup distance (admin -> store)
      setCalcStep("calc_pickup");
      const pickupResponse = await distanceService.getDistanceMatrix({
        origins: [{ lat: adminLat, lng: adminLng }],
        destinations: [{ lat: storeLat, lng: storeLng }],
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: true,
      });

      if (pickupResponse.rows[0].elements[0].status !== "OK") {
        throw new Error("Gagal hitung jarak jemput");
      }

      const pickupDistance =
        pickupResponse.rows[0].elements[0].distance.value / 1000; // Convert meter to KM

      // Calculate delivery distance (store -> customer)
      setCalcStep("calc_delivery");
      const deliveryResponse = await distanceService.getDistanceMatrix({
        origins: [{ lat: storeLat, lng: storeLng }],
        destinations: [{ lat: customerLat, lng: customerLng }],
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: true,
      });

      if (deliveryResponse.rows[0].elements[0].status !== "OK") {
        throw new Error("Gagal hitung jarak antar");
      }

      const deliveryDistance =
        deliveryResponse.rows[0].elements[0].distance.value / 1000; // Convert meter to KM

      // Validasi jarak (jarak tidak boleh lebih dari 100 km)
      if (pickupDistance > 100 || deliveryDistance > 100) {
        console.warn("Jarak terlalu jauh:", {
          pickupDistance,
          deliveryDistance,
        });
        alert("Lokasi terlalu jauh dari basecamp. Mohon cek kembali.");
        setCalcStep("idle");
        return;
      }

      // Step 5: Fetch pricing config
      const pricingData = await getPricingConfig();
      const config = pricingData.data;
      setPricingConfig(config);

      // Step 6: Calculate total shipping fee
      const pickupFee = pickupDistance * config.pickup_fee_per_km;
      const deliveryFee = deliveryDistance * config.delivery_fee_per_km;
      const totalShipping = pickupFee + deliveryFee + config.fixed_jastip_fee;

      // Step 7: Set location name and save shipping fee
      setCalcStep("done");
      setUserLocation(`${customerLat.toFixed(4)}, ${customerLng.toFixed(4)}`);
      setDistanceInfo({
        pickup: pickupDistance,
        delivery: deliveryDistance,
        pickupFeePerKm: config.pickup_fee_per_km,
        deliveryFeePerKm: config.delivery_fee_per_km,
        fixedFee: config.fixed_jastip_fee,
      });
      setShippingFee(Math.round(totalShipping));

      // Debug log
      console.log("✓ Shipping calculated (Google Maps):", {
        pickupDistance: pickupDistance.toFixed(2),
        deliveryDistance: deliveryDistance.toFixed(2),
        pickupFee: Math.round(pickupFee),
        deliveryFee: Math.round(deliveryFee),
        totalShipping: Math.round(totalShipping),
      });
    } catch (error) {
      console.error("Error calculating shipping:", error);
      alert(
        "Gagal hitung ongkir. Pastikan GPS aktif dan Google Maps API aktif!",
      );
      setCalcStep("idle");
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const result = await getStoreDetail(id);
        setProduk(result.data); // Simpan data dari backend
      } catch (err) {
        console.error(err);
        alert("Gagal ambil data toko, ndes!");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleOrderWA = () => {
    if (!extraMenu.trim()) {
      alert(
        "Waduh ndes, isi dulu menu yang mau dipesan dari daftar menu toko!",
      );
      return; // Berhenti di sini, gak bakal buka WA
    }

    if (!userLocation.trim()) {
      alert(
        "Alamatnya jangan lupa diisi atau klik tombol 'Cek & Hitung Ongkir'!",
      );
      return; // Berhenti di sini juga
    }

    const phoneNumber = "62895379007437"; // No WA Truken

    // Rincian ongkir jika sudah dihitung
    let shippingDetails = "";
    if (distanceInfo && shippingFee > 0) {
      const pickupCost = Math.round(
        distanceInfo.pickup * distanceInfo.pickupFeePerKm,
      );
      const deliveryCost = Math.round(
        distanceInfo.delivery * distanceInfo.deliveryFeePerKm,
      );
      shippingDetails = `%0A%0A*RINCIAN ONGKIR:*%0A📍 Jarak Jemput: ${distanceInfo.pickup.toFixed(2)} KM%0A📍 Jarak Antar: ${distanceInfo.delivery.toFixed(2)} KM%0A%0A💰 Biaya Jemput: Rp ${pickupCost.toLocaleString("id-ID")}%0A💰 Biaya Antar: Rp ${deliveryCost.toLocaleString("id-ID")}%0A💰 Fee Jastip Tetap: Rp ${distanceInfo.fixedFee.toLocaleString("id-ID")}%0A%0A🔴 *TOTAL ONGKIR: Rp ${shippingFee.toLocaleString("id-ID")}*`;
    }

    const message = `Halo Truken! %0A%0ASaya mau pesan Jastip *${produk.store_name}* %0A%0A*Dengan Menu:*%0A${extraMenu || "-"}%0A%0A*Catatan Khusus:*%0A${note || "-"}%0A%0A*Lokasi Warung:* ${produk.address}%0A---------------------------%0A%0A*Lokasi Pengiriman:*%0A${userLocation || "Belum diisi"}${shippingDetails}%0A%0A---------------------------%0A*Mohon segera diproses yaaa*`;

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
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
    );
  }

  if (!produk) return <div>Menu tidak ditemukan!</div>;

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="min-h-screen bg-white max-w-md mx-auto shadow-2xl relative pb-32 overflow-x-hidden">
        {/* Tombol Back Melayang */}
        <button
          onClick={() => navigate("/menu")}
          className="fixed top-4 left-4 z-20 bg-white/80 backdrop-blur p-2 rounded-full shadow-md"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Hero Image - Pakai product_photos dari DB */}
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-80 bg-gray-100">
          {produk.product_photos?.length > 0 ? (
            produk.product_photos.map((foto, index) => (
              <div key={index} className="flex-none w-full h-full snap-center">
                <img
                  src={foto}
                  alt={`${produk.store_name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="flex-none w-full h-full flex items-center justify-center snap-center p-4">
              <img
                src="https://via.placeholder.com/600x320?text=No+Image"
                alt="No Image"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex justify-center gap-1.5 -mt-6 relative z-20">
          {produk.product_photos?.map((_, index) => (
            <div
              key={index}
              className="w-1.5 h-1.5 rounded-full bg-amber-600 shadow-sm"
            ></div>
          ))}
        </div>

        {/* Konten Detail */}
        <div className="p-6 mt-5 bg-white rounded-t-[32px] relative z-10 ">
          <div className="flex justify-between items-start mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-black text-slate-900 leading-none capitalize tracking-tighter mb-1">
                {produk.store_name}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-8">
            {/* Baris Lokasi */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-hover hover:bg-white hover:shadow-md">
              <div className="bg-white p-2 rounded-xl shadow-sm text-gray-800">
                <MapPin size={18} />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {produk.address}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Baris Jam */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-gray-800">
                  <Clock size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {produk.operating_hours}
                </span>
              </div>

              {/* Baris Harga */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-gray-800">
                  <DollarSign size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-800 uppercase leading-none mb-1">
                    Mulai Dari
                  </p>
                  <p className="text-xs font-black text-slate-800">
                    Rp {parseInt(produk.price).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative border-t border-dashed border-slate-200 pt-6">
            <h2 className="text-xs font-black text-slate-400 capitalize mb-3 tracking-[0.2em]">
              TENTANG MAKANAN INI
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm font-medium italic">
              "{produk.description}"
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="fixed bottom-6  left-1/2 -translate-x-1/2  px-4 z-50 w-full max-w-md">
            <div className="bg-slate-900 p-2 rounded-[28px] shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
              {/* WADAH FOTO MENU TOKO DENGAN LABEL */}
              <div className="relative flex-none group">
                <button
                  onClick={() =>
                    produk.menu_photos?.length &&
                    setSelectedImg(produk.menu_photos)
                  }
                  className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-gray-500/50 shadow-lg active:scale-90 transition-all relative"
                >
                  <img
                    src={
                      produk.menu_photos?.[0] ||
                      "https://via.placeholder.com/100"
                    }
                    className="w-full h-full object-cover brightness-50"
                    alt="Thumbnail Menu"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-white leading-tight text-center">
                      {produk.menu_photos?.length || 0} HAL
                      <br />
                      MENU
                    </span>
                  </div>
                </button>

                {/* Label Penjelas di Atas (Tooltip-ish) */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-800 text-[8px] font-bold px-2 py-0.5 rounded-md text-white whitespace-nowrap animate-bounce shadow-lg">
                  Klik Daftar Menu
                </div>
              </div>

              {/* TOMBOL UTAMA */}
              {/* UPDATE TOMBOL UTAMA DI ACTION BAR */}
              <button
                onClick={() => setShowOrderModal(true)} // Buka modal dulu
                className="flex-1 bg-amber-800 hover:bg-amber-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                <ShoppingCart size={16} strokeWidth={3} />
                PESAN JASTIP SEKARANG
              </button>
            </div>
          </div>
        </div>

        {selectedImg && (
          <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl transition-all">
            {/* Tombol Close */}
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-6 right-6 z-[130] bg-white/20 p-3 rounded-full text-white backdrop-blur-md active:scale-90"
            >
              <X size={24} strokeWidth={3} />
            </button>

            {/* Wadah Slider Foto Menu */}
            <div className="w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-[80vh] items-center">
              {/* Jika yang di-klik adalah menu_toko (Array), kita loop. 
                Jika cuma satu foto (String), kita tampilin satu aja. */}
              {Array.isArray(selectedImg) ? (
                selectedImg.map((foto, idx) => (
                  <div
                    key={idx}
                    className="flex-none w-full h-full flex items-center justify-center snap-center p-4"
                  >
                    <img
                      src={foto}
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
                      alt={`Menu Hal ${idx + 1}`}
                      loading="lazy"
                    />
                  </div>
                ))
              ) : (
                <div className="flex-none w-full h-full flex items-center justify-center p-4">
                  <img
                    src={selectedImg}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    alt="Zoom"
                  />
                </div>
              )}
            </div>

            {/* Indikator Halaman (Cuma muncul kalau fotonya banyak) */}
            {/* Indikator Halaman & Petunjuk Geser */}
            {Array.isArray(selectedImg) && selectedImg.length > 1 && (
              <div className="absolute bottom-10 flex flex-col items-center gap-4">
                {/* Titik-titik indikator */}
                <div className="flex gap-2">
                  {selectedImg.map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white/30"
                    ></div>
                  ))}
                </div>

                {/* Tulisan petunjuk yang cuma muncul kalau menunya banyak */}
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Geser halaman <span className="text-blue-400">→</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* MODAL ORDER */}
        {/* MODAL ORDER */}
        {showOrderModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    Detail Pesanan
                  </h2>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {produk.store_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 2. INPUT MENU TAMBAHAN (BARU!) */}
              <div className="mb-6">
                <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest block mb-3">
                  Pesan Menu (Sesuai Daftar Menu)
                </label>
                <textarea
                  value={extraMenu}
                  onChange={(e) => setExtraMenu(e.target.value)}
                  placeholder="Contoh: Nasi Putih 2, Es Teh Manis 1, Kerupuk 3"
                  className="w-full bg-gray-50 border border-gray-500 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                />
                <p className="text-[9px] text-gray-800 mt-2 font-medium italic">
                  *Lihat foto daftar menu di pojok kiri bawah tombol pesan{" "}
                </p>
              </div>

              {/* 4. INPUT LOKASI PENGIRIMAN */}
              <div className="mb-8">
                <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest block mb-3 leading-none">
                  Lokasi Pengiriman / Ongkir
                </label>
                <button
                  onClick={handleCalculateShipping}
                  disabled={isProcessing || !mapsLoaded}
                  className={`w-full rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-200 ${
                    isProcessing || !mapsLoaded
                      ? "bg-gray-600 text-white cursor-not-allowed"
                      : "bg-amber-700 text-white shadow-lg hover:bg-amber-700 "
                  }`}
                  title={!mapsLoaded ? "Google Maps sedang dimuat..." : ""}
                >
                  <span className="text-lg">📍</span>
                  <span>{!mapsLoaded ? "Memuat..." : "Cek Ongkir"}</span>
                </button>
              </div>

              {calcStep === "done" && distanceInfo && pricingConfig && (
                <div className="mb-8">
                  <PriceCalculator
                    ref={priceCalcRef}
                    distances={{
                      direct: distanceInfo.delivery,
                      pickup: distanceInfo.pickup,
                      delivery: distanceInfo.delivery,
                      isOpposite: true,
                      hasStore: true,
                    }}
                    durations={{ pickup: 0, delivery: 0 }}
                    pricingConfig={{
                      pickup_fee_per_km: distanceInfo.pickupFeePerKm,
                      delivery_fee_per_km: distanceInfo.deliveryFeePerKm,
                      fixed_jastip_fee: distanceInfo.fixedFee,
                    }}
                  />
                </div>
              )}

              {/* 3. INPUT CATATAN */}
              <div className="mb-8">
                <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest block mb-3">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Gak pake seledri, sambal pisah"
                  className="w-full bg-gray-50 border border-gray-500 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                onClick={handleOrderWA}
                disabled={!extraMenu.trim() || calcStep !== "done"}
                className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95
                ${
                  !extraMenu.trim() || calcStep !== "done"
                    ? "bg-gray-300 cursor-not-allowed opacity-70"
                    : "bg-blue-600 hover:bg-blue-800 text-white shadow-xl shadow-blue-200"
                }`}
              >
                <ShoppingCart size={20} />
                {!extraMenu.trim() || calcStep !== "done"
                  ? "LENGKAPI DATA & CEK ONGKIR"
                  : "🛒 KIRIM PESANAN VIA WHATSAPP"}
              </button>

              {shippingFee > 0 && (
                <p className="text-[9px] text-gray-500 mt-3 text-center italic">
                  *Ongkir sudah dihitung dan akan ditampilkan di pesan WhatsApp
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
