import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import {
  Camera, Store, MapPin, Clock, Tag, ChevronLeft, Navigation, Plus, X
} from "lucide-react";
import MapSection from "../../components/MapSection";
import { getAdminStoreDetail, updateStore } from "../../api/adminService";
import { compressImage } from "../../utils/compressor";

const libraries = ["places"];

export default function EditStore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);

  // State Form Utama
  const [formData, setFormData] = useState({
    store_name: "",
    price: "",
    operating_hours: "",
    address: "",
    category: "Makanan Berat",
    description: "",
    latitude: -6.9147,
    longitude: 110.2037,
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // State untuk Foto Lama (dari Database)
  const [oldProductPhotos, setOldProductPhotos] = useState([]);
  const [oldMenuPhotos, setOldMenuPhotos] = useState([]);

  // State untuk File Baru yang akan di-upload
  const [productFiles, setProductFiles] = useState([]); // [ {file, preview}, ... ]
  const [menuFiles, setMenuFiles] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  // 1. FETCH DATA TOKO YANG MAU DIEDIT
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const result = await getAdminStoreDetail(id);
        const store = result.data;

        const parsedLat = parseFloat(store.latitude);
        const parsedLng = parseFloat(store.longitude);
        setFormData({
          store_name: store.store_name,
          price: store.price,
          operating_hours: store.operating_hours,
          address: store.address,
          category: store.category || "Makanan Berat",
          description: store.description,
          latitude: Number.isFinite(parsedLat) ? parsedLat : -6.9147,
          longitude: Number.isFinite(parsedLng) ? parsedLng : 110.2037,
        });

        // Simpan foto lama dari database ke state khusus
        setOldProductPhotos(store.product_photos || []);
        setOldMenuPhotos(store.menu_photos || []);
      } catch (err) {
        alert("Gagal mengambil data toko, ndes! " + err);
        navigate("/super-admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setFormData({ ...formData, address: e.target.value });
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        setFormData({
          ...formData,
          address: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        });
      }
    }
  };

  const getMyLocation = () => {
    if (navigator.geolocation) {
      setSubmitLoading(true);
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat: latitude, lng: longitude };

        geocoder.geocode({ location: latlng }, (results, status) => {
          let finalAddress = "";
          if (status === "OK" && results[0]) {
            const components = results[0].address_components;
            const desa = components.find(c => c.types.includes("administrative_area_level_4"));
            const kecamatan = components.find(c => c.types.includes("administrative_area_level_3"));

            if (desa && kecamatan) {
              finalAddress = `${desa.long_name}, ${kecamatan.long_name}`;
            } else if (kecamatan) {
              finalAddress = kecamatan.long_name;
            } else {
              finalAddress = results[0].formatted_address.split(',')[0];
            }
          } else {
            finalAddress = "Lokasi Terdeteksi";
          }

          setFormData({
            ...formData,
            latitude,
            longitude,
            address: finalAddress,
          });
          setSubmitLoading(false);
        });
      }, () => {
        alert("Gagal ambil lokasi, ndes!");
        setSubmitLoading(false);
      });
    }
  };

  // 2. HANDLER MANAJEMEN FOTO
  const handleProductUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (oldProductPhotos.length + productFiles.length + files.length > 5) {
      alert("Waduh ndes, total foto produk maksimal cuma 5 ya!");
      return;
    }

    setSubmitLoading(true);
    try {
      const compressedPromises = files.map(async (file) => {
        const compressed = await compressImage(file);
        return { file: compressed, preview: URL.createObjectURL(compressed) };
      });
      const newFiles = await Promise.all(compressedPromises);
      setProductFiles([...productFiles, ...newFiles]);
    } catch (err) {
      alert("Gagal kompres foto!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleMenuUpload = async (e) => {
    const files = Array.from(e.target.files);
    setSubmitLoading(true);
    try {
      const compressedPromises = files.map(async (file) => {
        const compressed = await compressImage(file);
        return { file: compressed, preview: URL.createObjectURL(compressed) };
      });
      const newFiles = await Promise.all(compressedPromises);
      setMenuFiles([...menuFiles, ...newFiles]);
    } catch (err) {
      alert("Gagal kompres menu!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const removeOldFile = (url, type) => {
    if (type === "product") {
      setOldProductPhotos(oldProductPhotos.filter((item) => item !== url));
    } else {
      setOldMenuPhotos(oldMenuPhotos.filter((item) => item !== url));
    }
  };

  const removeNewFile = (index, type) => {
    if (type === "product") {
      URL.revokeObjectURL(productFiles[index].preview);
      setProductFiles(productFiles.filter((_, i) => i !== index));
    } else {
      URL.revokeObjectURL(menuFiles[index].preview);
      setMenuFiles(menuFiles.filter((_, i) => i !== index));
    }
  };

  // 3. PROSES SIMPAN PERUBAHAN
  const handleUpdateStore = async () => {
    if (!formData.store_name.trim()) return alert("Nama toko wajib diisi!");

    try {
      setSubmitLoading(true);
      const form = new FormData();

      // Masukkan field teks
      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });

      // Kirim sisa foto lama yang TIDAK dihapus oleh admin
      form.append("existing_product_photos", JSON.stringify(oldProductPhotos));
      form.append("existing_menu_photos", JSON.stringify(oldMenuPhotos));

      // Kirim file baru (kalau ada)
      productFiles.forEach((item) => form.append("product_photos", item.file));
      menuFiles.forEach((item) => form.append("menu_photos", item.file));

      const result = await updateStore(id, form);
      if (result.status === "success") {
        alert("Mantap ndes! Toko berhasil diperbarui.");
        navigate("/super-admin/dashboard");
      }
    } catch (err) {
      alert(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-gray-400 animate-pulse">
      Lagi ngambil data toko, bentar ndes...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-black text-gray-800 tracking-tight">EDIT TOKO MITRA</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        {/* SECTION 1: FOTO PRODUK */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">
            Foto Unggulan Produk ({oldProductPhotos.length + productFiles.length}/5)
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2 py-3 scrollbar-hide">
            {oldProductPhotos.length + productFiles.length < 5 && (
              <label className="w-24 h-24 shrink-0 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-100 transition-all">
                <Camera size={24} />
                <span className="text-[9px] font-bold mt-1 uppercase">Tambah</span>
                <input type="file" multiple accept="image/*" onChange={handleProductUpload} className="hidden" />
              </label>
            )}

            {/* Loop Foto Lama dari Database */}
            {oldProductPhotos.map((url, index) => (
              <div key={`old-p-${index}`} className="relative w-24 h-24 shrink-0">
                <img src={url} className="w-full h-full object-cover rounded-2xl border border-gray-200 brightness-95" alt="Old Product" />
                <button onClick={() => removeOldFile(url, "product")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600">
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Loop Foto Baru yang Belum Di-upload */}
            {productFiles.map((item, index) => (
              <div key={`new-p-${index}`} className="relative w-24 h-24 shrink-0">
                <img src={item.preview} className="w-full h-full object-cover rounded-2xl border border-blue-200" alt="New Product" />
                <button onClick={() => removeNewFile(index, "product")} className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1 shadow-lg">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: INFO UTAMA */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">Nama Toko / Warung</label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900" size={18} />
              <input name="store_name" value={formData.store_name} onChange={handleChange} placeholder="Contoh: Warmindo Abadi" className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">Harga Mulai</label>
              <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Rp" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">Jam Operasi</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900" size={18} />
                <input name="operating_hours" value={formData.operating_hours} onChange={handleChange} placeholder="08:00 - 20:00" className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">Kategori</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
              <option>Makanan Berat</option>
              <option>Minuman</option>
              <option>Snack</option>
              <option>Dessert</option>
              <option>Pedas</option>
              <option>Cepat Saji</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">Deskripsi Singkat</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Ceritakan keunggulan toko ini..." className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </section>

        {/* SECTION 3: LOKASI */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
          <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block px-1">Lokasi Toko (Titik Map & Alamat)</label>
          <div className="flex gap-2">
            <div className="flex-1">
              {isLoaded && (
                <Autocomplete onLoad={(auto) => (autocompleteRef.current = auto)} onPlaceChanged={onPlaceChanged}>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900" size={18} />
                    <input name="address" value={formData.address} onChange={handleAddressChange} placeholder="Ketik alamat manual atau cari..." className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                </Autocomplete>
              )}
            </div>
            <button onClick={getMyLocation} type="button" className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all active:scale-90">
              <Navigation size={20} />
            </button>
          </div>

          <div className="h-80 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
            {isLoaded && (
              <MapSection
                adminLocation={{ lat: formData.latitude, lng: formData.longitude }}
                onMapClick={(e) => setFormData({ ...formData, latitude: e.latLng.lat(), longitude: e.latLng.lng() })}
              />
            )}
          </div>
        </section>

        {/* SECTION 4: FOTO MENU */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">
            Foto Daftar Menu / Price List ({oldMenuPhotos.length + menuFiles.length})
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {/* Loop Menu Lama */}
            {oldMenuPhotos.map((url, index) => (
              <div key={`old-m-${index}`} className="relative aspect-square">
                <img src={url} className="w-full h-full object-cover rounded-2xl border border-gray-100" alt="Old Menu" />
                <button onClick={() => removeOldFile(url, "menu")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Loop Menu Baru */}
            {menuFiles.map((item, index) => (
              <div key={`new-m-${index}`} className="relative aspect-square">
                <img src={item.preview} className="w-full h-full object-cover rounded-2xl border border-blue-200" alt="New Menu" />
                <button onClick={() => removeNewFile(index, "menu")} className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1 shadow-lg">
                  <X size={14} />
                </button>
              </div>
            ))}

            <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 transition-all">
              <Plus size={24} />
              <input type="file" multiple accept="image/*" onChange={handleMenuUpload} className="hidden" />
            </label>
          </div>
        </section>

        {/* SUBMIT BUTTON */}
        <button
          className={`w-full text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center gap-2
            ${submitLoading ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700 active:scale-95'}`}
          onClick={handleUpdateStore}
          disabled={submitLoading}
        >
          {submitLoading ? "Memperbarui Toko..." : "Simpan Perubahan Toko"}
        </button>
      </main>
    </div>
  );
}