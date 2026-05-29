import imageCompression from 'browser-image-compression';

export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.5,           // Maksimal 500KB (biar hemat tapi tetap tajam)
    maxWidthOrHeight: 1280,   // Resolusi cukup di 1280px (HD)
    useWebWorker: true,
    fileType: "image/webp"    // PAKSA ke format WebP, ndes!
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // Kita buat nama file baru dengan ekstensi .webp
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    
    return new File([compressedFile], newFileName, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Gagal kompres foto:", error);
    return file; // Kalau gagal, kirim file asli (opsional)
  }
};