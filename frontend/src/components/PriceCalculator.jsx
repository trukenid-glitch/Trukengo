// src/components/PriceCalculator.jsx
import { forwardRef } from 'react';
import { formatRupiah } from '../utils/helpers';
import { Calculator, Truck, PackageCheck, Wallet, Clock, MapPin } from 'lucide-react';

function PriceCalculatorBase({ distances, durations, pricingConfig }, ref) {
  // Kita kasih nilai default 0 kalau variabelnya belum ada
  const { direct = 0, pickup = 0, delivery = 0, isOpposite = false, hasStore = false } = distances || {};
  const { pickup: pTime, delivery: dTime } = durations || { pickup: 0, delivery: 0 };
  const { pickup_fee_per_km = 0, delivery_fee_per_km = 0, fixed_jastip_fee = 0 } = pricingConfig || {};

  // Kalkulasi Biaya
  let pickupCost = 0;
  let deliveryCost = 0;
  let labelAntar = "";
  let jarakAntar = 0;

  if (hasStore && isOpposite) {
    // LOGIKA NOMOR 2: BERLAWANAN ARAH
    pickupCost = pickup * pickup_fee_per_km;
    deliveryCost = delivery * delivery_fee_per_km;
    jarakAntar = delivery;
    labelAntar = "Antar Barang (Dari Toko)";
  } else {
    // LOGIKA NOMOR 1: SEARAH (atau tanpa toko)
    pickupCost = 0;                      // Gratis biaya jemput
    deliveryCost = direct * delivery_fee_per_km;
    jarakAntar = direct;
    labelAntar = "Ongkir Utama";
  }

  const totalCost = deliveryCost + pickupCost + fixed_jastip_fee;
  const totalTime = pTime + dTime;

    // Render state kosong jika belum ada perhitungan
    // Render state kosong jika belum ada perhitungan
  if (direct === 0) {
    return (
      <div ref={ref} className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 border-2 border-dashed border-gray-200 rounded-xl">
        <Calculator size={48} className="mb-3 opacity-50" />
        <p className="text-sm text-center">Masukkan lokasi anda untuk menghitung ongkir</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
      {/* Header Rincian & Badge Waktu Tetap Sama */}
      <div className="bg-slate-50 border-b border-gray-100 p-4 flex justify-between items-center text-left">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Wallet size={18} className="text-slate-600" /> Rincian Biaya
        </h3>
        {totalTime > 0 && (
          <div className=" text-black text-[12px] font-bold flex items-center gap-1 ">
            <Clock size={12} /> ±{totalTime} MENIT
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 text-left">
        {/* Notifikasi Searah */}
        {hasStore && !isOpposite && (
          <div className=" text-green-700 p-2 rounded-lg text-[10px] font-bold flex items-center gap-2">
            <PackageCheck size={14} /> JALUR SEARAH! BIAYA AMBIL BARANG GRATIS
          </div>
        )}

        {/* BIAYA JEMPUT (Hanya tampil kalau Berlawanan) */}
        {hasStore && isOpposite && (
          <div className="flex justify-between items-center">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-600 rounded-lg text-white">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Ambil Barang</p>
                <p className="text-xs text-gray-500">{pickup.toFixed(1)} km x {formatRupiah(pickup_fee_per_km)}/km</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-800">{formatRupiah(pickupCost)}</span>
          </div>
        )}

        {/* ONGKIR ANTAR (Dinamis sesuai logika) */}
        <div className="flex justify-between items-center">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Truck size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{labelAntar}</p>
              <p className="text-xs text-gray-500">{jarakAntar.toFixed(1)} km x {formatRupiah(delivery_fee_per_km)}/km</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-800">{formatRupiah(deliveryCost)}</span>
        </div>

        {/* Fee Jastip & Total Tetap Sama */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg text-white">
              <Calculator size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Fee Jasa Titip</p>
              <span className="text-[10px] text-gray-400 line-through decoration-red-400 block">{formatRupiah(5000)}</span>
            </div>
          </div>
          <span className="text-sm font-semibold text-black">{formatRupiah(fixed_jastip_fee)}</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div>
            <p className="text-base font-bold text-gray-900">Total Ongkir</p>
            <p className="text-[10px] text-gray-400 italic">*Belum termasuk harga barang</p>
          </div>
          <p className="text-xl font-black text-blue-600">{formatRupiah(totalCost)}</p>
        </div>
      </div>
    </div>
  );
}

const PriceCalculator = forwardRef(PriceCalculatorBase);

export default PriceCalculator;