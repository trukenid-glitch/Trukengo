import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import {
  Camera,
  Store,
  MapPin,
  Clock,
  Tag,
  ChevronLeft,
  Navigation,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react";
import MapSection from "../../components/MapSection";
import { addStore } from "../../api/adminService";

const libraries = ["places"];

export default function AddStore() {
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);

  // State Form
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

  const [productPhotos, setProductPhotos] = useState([]);
  const [menuPhotos, setMenuPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productFiles, setProductFiles] = useState([]); // [ {file, preview}, ... ]
  const [menuFiles, setMenuFiles] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  // Handler Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData({
          ...formData,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      });
    }
  };

  const handleProductUpload = (e) => {
    const files = Array.from(e.target.files);

    if (productFiles.length + files.length > 5) {
      alert("Waduh ndes, foto produk maksimal cuma 5 ya!");
      return;
    }

    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file), // Buat URL sementara buat preview
    }));

    setProductFiles([...productFiles, ...newFiles]);
  };

  // Handler Upload Foto Menu (Tanpa Limit)
  const handleMenuUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setMenuFiles([...menuFiles, ...newFiles]);
  };

  // Fungsi Hapus Preview (Penting biar memori gak bengkak)
  const removeFile = (index, type) => {
    if (type === "product") {
      const filtered = productFiles.filter((_, i) => i !== index);
      URL.revokeObjectURL(productFiles[index].preview); // Hapus memori preview
      setProductFiles(filtered);
    } else {
      const filtered = menuFiles.filter((_, i) => i !== index);
      URL.revokeObjectURL(menuFiles[index].preview);
      setMenuFiles(filtered);
    }
  };
  const handleSaveStore = async () => {
    try {
      setLoading(true);

      // Validasi minimal
      if (!formData.store_name.trim()) {
        alert("Nama toko tidak boleh kosong!");
        setLoading(false);
        return;
      }

      // Buat FormData baru
      const form = new FormData();

      // Append field text
      form.append("store_name", formData.store_name);
      form.append("price", formData.price);
      form.append("operating_hours", formData.operating_hours);
      form.append("address", formData.address);
      form.append("category", formData.category);
      form.append("description", formData.description);
      form.append("latitude", formData.latitude);
      form.append("longitude", formData.longitude);

      // Append file produk (ambil dari item.file, bukan preview)
      productFiles.forEach((item) => {
        form.append("product_photos", item.file);
      });

      // Append file menu
      menuFiles.forEach((item) => {
        form.append("menu_photos", item.file);
      });

      const result = await addStore(form);

      if (result.status === "success") {
        alert("Mantap ndes! Toko berhasil disimpan.");
        navigate("/super-admin/dashboard");
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* HEADER FIXED TOP */}
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-black text-gray-800 tracking-tight">
          TAMBAH TOKO BARU
        </h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        {/* SECTION 1: FOTO PRODUK */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">
            Foto Unggulan Produk ({productFiles.length}/5)
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2 py-3 scrollbar-hide">
            {/* Tombol Upload (Hanya muncul kalau < 5) */}
            {productFiles.length < 5 && (
              <label className="w-24 h-24 shrink-0 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-100 transition-all">
                <Camera size={24} />
                <span className="text-[9px] font-bold mt-1 uppercase">
                  Upload
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleProductUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Loop Preview Gambar */}
            {productFiles.map((item, index) => (
              <div key={index} className="relative w-24 h-24 shrink-0 ">
                <img
                  src={item.preview}
                  className="w-full h-full object-cover rounded-2xl border border-gray-100"
                  alt="Preview"
                />
                <button
                  onClick={() => removeFile(index, "product")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: INFO UTAMA */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">
              Nama Toko / Warung
            </label>
            <div className="relative">
              <Store
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900"
                size={18}
              />
              <input
                name="store_name"
                onChange={handleChange}
                placeholder="Contoh: Warmindo Abadi"
                className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">
                Harga Mulai
              </label>
              <input
                name="price"
                type="number"
                onChange={handleChange}
                placeholder="Rp"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">
                Jam Operasi
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900"
                  size={18}
                />
                <input
                  name="operating_hours"
                  onChange={handleChange}
                  placeholder="08:00 - 20:00"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">
              Kategori
            </label>
            <div className="relative">
              <Tag
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900"
                size={18}
              />
              <select
                name="category"
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
              >
                <option>Makanan Berat</option>
                <option>Minuman</option>
                <option>Snack</option>
                <option>Dessert</option>
                <option>Pedas</option>
                <option>Cepat Saji</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block mb-2 px-1">
              Deskripsi Singkat
            </label>
            <textarea
              name="description"
              onChange={handleChange}
              rows="3"
              placeholder="Ceritakan keunggulan toko ini..."
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </section>

        {/* SECTION 3: LOKASI */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
          <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest block px-1">
            Lokasi Toko
          </label>

          <div className="flex gap-2">
            <div className="flex-1">
              {isLoaded && (
                <Autocomplete
                  onLoad={(auto) => (autocompleteRef.current = auto)}
                  onPlaceChanged={onPlaceChanged}
                >
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900"
                      size={18}
                    />
                    <input
                      placeholder="Cari alamat toko..."
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </Autocomplete>
              )}
            </div>
            <button
              onClick={getMyLocation}
              type="button"
              className="bg-blue-50 text-blue-600 p-4 rounded-2xl hover:bg-blue-100 transition-all active:scale-90"
            >
              <Navigation size={20} />
            </button>
          </div>

          <div className="h-48 rounded-2xl overflow-hidden border border-gray-100">
            {isLoaded && (
              <MapSection
                adminLocation={{
                  lat: formData.latitude,
                  lng: formData.longitude,
                }}
                onMapClick={(e) =>
                  setFormData({
                    ...formData,
                    latitude: e.latLng.lat(),
                    longitude: e.latLng.lng(),
                  })
                }
              />
            )}
          </div>
        </section>

        {/* SECTION 4: FOTO MENU */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">
            Foto Daftar Menu / Price List ({menuFiles.length})
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {/* Loop Preview Gambar Menu */}
            {menuFiles.map((item, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={item.preview}
                  className="w-full h-full object-cover rounded-2xl border border-gray-100"
                  alt="Menu"
                />
                <button
                  onClick={() => removeFile(index, "menu")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Tombol Tambah Menu */}
            <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-all">
              <Plus size={24} />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMenuUpload}
                className="hidden"
              />
            </label>
          </div>
        </section>

        {/* SUBMIT BUTTON */}
       <button
          className={`w-full text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center gap-2
            ${loading 
              ? 'bg-blue-400 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700 active:scale-95'
            }`}
          onClick={handleSaveStore}
          disabled={loading} // Mencegah klik ganda saat loading
        >
          {loading ? (
            <>
              {/* Animasi Spinner Muter */}
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Menyimpan...</span>
            </>
          ) : (
            "Simpan Toko Mitra"
          )}
        </button>
      </main>
    </div>
  );
}
