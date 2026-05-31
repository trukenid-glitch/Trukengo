import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Tag, DollarSign, ArrowLeft, Save } from "lucide-react";
import { getPricingConfig } from "../../api/customerService";
import { updatePricingConfig } from "../../api/adminService";

export default function EditConfig() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickup_fee_per_km: "",
    delivery_fee_per_km: "",
    fixed_jastip_fee: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const result = await getPricingConfig();
        if (result.data) {
          setForm({
            pickup_fee_per_km: result.data.pickup_fee_per_km ?? 0,
            delivery_fee_per_km: result.data.delivery_fee_per_km ?? 0,
            fixed_jastip_fee: result.data.fixed_jastip_fee ?? 0,
          });
        } else {
          window.alert("Data konfigurasi tidak ditemukan.");
        }
      } catch (err) {
        window.alert(`Gagal memuat konfigurasi: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updatePricingConfig({
        pickup_fee_per_km: Number(form.pickup_fee_per_km),
        delivery_fee_per_km: Number(form.delivery_fee_per_km),
        fixed_jastip_fee: Number(form.fixed_jastip_fee),
      });

      window.alert("Tarif Jastip berhasil disimpan.");
      navigate("/super-admin/dashboard");
    } catch (err) {
      window.alert(`Gagal menyimpan tarif: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 mb-6"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-linear-to-r from-sky-600 to-blue-700 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-100 font-bold mb-2">
                  Pengaturan Tarif Jastip
                </p>
                <h1 className="text-3xl font-black text-white">
                  Edit Tarif Jastip
                </h1>
                <p className="mt-2 text-sm text-sky-100/80 max-w-2xl">
                  Atur biaya pickup, delivery, dan fee tetap untuk perhitungan
                  ongkir dinamis.
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 px-4 py-3 text-white text-sm font-medium shadow-lg shadow-sky-900/20">
                Halaman admin responsif untuk mobile dan desktop
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Save size={20} className="animate-spin" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Memuat konfigurasi tarif...
                </p>
              </div>
            ) : (
              <form className="grid gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Pickup / km
                    </span>
                    <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <MapPin size={18} className="text-sky-600" />
                      <input
                        name="pickup_fee_per_km"
                        value={form.pickup_fee_per_km}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        step="100"
                        className="w-full bg-transparent outline-none text-sm text-slate-900"
                        placeholder="1000"
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Delivery / km
                    </span>
                    <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <DollarSign size={18} className="text-emerald-600" />
                      <input
                        name="delivery_fee_per_km"
                        value={form.delivery_fee_per_km}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        step="100"
                        className="w-full bg-transparent outline-none text-sm text-slate-900"
                        placeholder="2000"
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Fee Tetap
                    </span>
                    <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <Tag size={18} className="text-amber-600" />
                      <input
                        name="fixed_jastip_fee"
                        value={form.fixed_jastip_fee}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        step="100"
                        className="w-full bg-transparent outline-none text-sm text-slate-900"
                        placeholder="2000"
                      />
                    </div>
                  </label>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-bold text-slate-800">Preview</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Nilai tarif ini akan digunakan untuk menghitung ongkir pada
                    frontend saat pelanggan memesan.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-blue-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
