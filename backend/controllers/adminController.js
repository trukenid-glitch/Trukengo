const pool = require("../db");
const { uploadToR2, deleteFromR2 } = require("../utils/s3Upload");

// Ambil lokasi basecamp saat ini
exports.getBaseLocation = async (req, res) => {
  try {
    // Kita ambil dari user yang rolenya admin (asumsi cuma ada 1 super admin)
    const result = await pool.query(
      "SELECT latitude, longitude, base_address FROM users WHERE role = 'admin' LIMIT 1",
    );
    res.json({ status: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update lokasi basecamp
exports.updateLocation = async (req, res) => {
  const { lat, lng, address } = req.body;
  try {
    // Update koordinat untuk semua user admin (atau admin tertentu)
    await pool.query(
      "UPDATE users SET latitude = $1, longitude = $2, base_address = $3 WHERE role = 'admin'",
      [lat, lng, address],
    );
    res.json({ status: "success", message: "Lokasi diperbarui!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update konfigurasi tarif jastip
exports.updateAppConfig = async (req, res) => {
  const { pickup_fee_per_km, delivery_fee_per_km, fixed_jastip_fee } = req.body;
  try {
    const result = await pool.query(
      `UPDATE app_configs
             SET pickup_fee_per_km = $1,
                 delivery_fee_per_km = $2,
                 fixed_jastip_fee = $3,
                 updated_at = NOW()
             WHERE id = 1
             RETURNING *`,
      [pickup_fee_per_km, delivery_fee_per_km, fixed_jastip_fee],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "Konfigurasi pricing tidak ditemukan.",
        });
    }

    res.json({
      status: "success",
      message: "Tarif Jastip berhasil diperbarui.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error Update App Config:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.addStore = async (req, res) => {
  try {
    const {
      store_name,
      category,
      description,
      operating_hours,
      address,
      latitude,
      longitude,
      price,
      estimate,
    } = req.body;

    // Validasi field wajib
    if (!store_name || !category || !address || !latitude || !longitude) {
      return res.status(400).json({
        status: "error",
        message:
          "Field store_name, category, address, latitude, longitude wajib diisi!",
      });
    }

    // Ambil file dari Multer - dengan validasi jika undefined
    const productFiles = req.files?.["product_photos"] || [];
    const menuFiles = req.files?.["menu_photos"] || [];

    // Proses Upload ke R2 secara paralel (jika ada file)
    const product_urls =
      productFiles.length > 0
        ? await Promise.all(
            productFiles.map((file) => uploadToR2(file, "product_photos")),
          )
        : [];

    const menu_urls =
      menuFiles.length > 0
        ? await Promise.all(
            menuFiles.map((file) => uploadToR2(file, "menu_photos")),
          )
        : [];

    // Logging hasil upload untuk memudahkan debug wsrv/R2 URL
    const query = `
            INSERT INTO stores (
                store_name, category, description, operating_hours, 
                address, latitude, longitude, price, estimate, 
                product_photos, menu_photos
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;

    const values = [
      store_name,
      category,
      description,
      operating_hours,
      address,
      latitude,
      longitude,
      price || 0,
      estimate || null,
      product_urls, // Hasil array URL dari R2 (bisa kosong)
      menu_urls, // Hasil array URL dari R2 (bisa kosong)
    ];

    const result = await pool.query(query, values);

    // Sertakan juga url hasil upload di response untuk verifikasi cepat
    res.status(201).json({
      status: "success",
      message: "Toko dan Foto berhasil disimpan ke Cloudflare R2!",
      data: result.rows[0],
      uploaded: {
        product_urls,
        menu_urls,
      },
    });
  } catch (err) {
    console.error("Error Add Store:", err.message);
    res.status(500).json({
      status: "error",
      message: "Gagal simpan toko: " + err.message,
    });
  }
};

// Ambil semua daftar toko untuk admin
exports.getAllStores = async (req, res) => {
  try {
    const query = `
            SELECT id, store_name, address, latitude, longitude, category, is_open 
            FROM stores 
            ORDER BY created_at DESC;
        `;
    const result = await pool.query(query);

    res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (err) {
    console.error("Error Get All Stores:", err.message);
    res.status(500).json({
      status: "error",
      message: "Aduh ndes, gagal ambil data toko dari database!",
    });
  }
};

exports.deleteStore = async (req, res) => {
  const { id } = req.params;

  try {
    const selectQuery = `SELECT product_photos, menu_photos FROM stores WHERE id = $1;`;
    const selectResult = await pool.query(selectQuery, [id]);

    if (!selectResult.rows.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Toko tidak ditemukan." });
    }

    const {
      product_photos: dbProductPhotos = [],
      menu_photos: dbMenuPhotos = [],
    } = selectResult.rows[0];
    const filesToDelete = [...dbProductPhotos, ...dbMenuPhotos].filter(Boolean);

    await Promise.all(
      filesToDelete.map(async (fileUrl) => {
        try {
          await deleteFromR2(fileUrl);
        } catch (err) {
          console.error(`Gagal menghapus file R2 ${fileUrl}:`, err.message);
        }
      }),
    );

    const deleteQuery = `DELETE FROM stores WHERE id = $1 RETURNING *;`;
    const result = await pool.query(deleteQuery, [id]);

    if (!result.rows.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Toko tidak ditemukan." });
    }

    res.json({
      status: "success",
      message: "Toko berhasil dihapus.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error Delete Store:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.updateStore = async (req, res) => {
  const { id } = req.params;
  const {
    store_name,
    price,
    operating_hours,
    address,
    category,
    description,
    latitude,
    longitude,
    existing_product_photos,
    existing_menu_photos,
  } = req.body;

  try {
    const selectQuery = `SELECT product_photos, menu_photos FROM stores WHERE id = $1;`;
    const selectResult = await pool.query(selectQuery, [id]);

    if (!selectResult.rows.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Toko tidak ditemukan." });
    }

    const {
      product_photos: dbProductPhotos = [],
      menu_photos: dbMenuPhotos = [],
    } = selectResult.rows[0];
    const previousProductPhotos = Array.isArray(existing_product_photos)
      ? existing_product_photos
      : JSON.parse(existing_product_photos || "[]");
    const previousMenuPhotos = Array.isArray(existing_menu_photos)
      ? existing_menu_photos
      : JSON.parse(existing_menu_photos || "[]");

    const removedProductPhotos = dbProductPhotos.filter(
      (url) => !previousProductPhotos.includes(url),
    );
    const removedMenuPhotos = dbMenuPhotos.filter(
      (url) => !previousMenuPhotos.includes(url),
    );

    await Promise.all(
      [...removedProductPhotos, ...removedMenuPhotos]
        .filter(Boolean)
        .map(async (fileUrl) => {
          try {
            await deleteFromR2(fileUrl);
          } catch (err) {
            console.error(
              `Gagal menghapus file R2 yang tidak lagi dipakai ${fileUrl}:`,
              err.message,
            );
          }
        }),
    );

    let finalProductPhotos = [...previousProductPhotos];
    let finalMenuPhotos = [...previousMenuPhotos];

    if (req.files && req.files.product_photos) {
      const newProductUrls = await Promise.all(
        req.files.product_photos.map((file) =>
          uploadToR2(file, "product_photos"),
        ),
      );
      finalProductPhotos = [...finalProductPhotos, ...newProductUrls];
    }

    if (req.files && req.files.menu_photos) {
      const newMenuUrls = await Promise.all(
        req.files.menu_photos.map((file) => uploadToR2(file, "menu_photos")),
      );
      finalMenuPhotos = [...finalMenuPhotos, ...newMenuUrls];
    }

    const query = `
            UPDATE stores 
            SET store_name = $1, price = $2, operating_hours = $3, address = $4, 
                category = $5, description = $6, latitude = $7, longitude = $8, 
                product_photos = $9, menu_photos = $10, updated_at = NOW()
            WHERE id = $11 RETURNING *;
        `;

    const values = [
      store_name,
      price,
      operating_hours,
      address,
      category,
      description,
      latitude,
      longitude,
      finalProductPhotos,
      finalMenuPhotos,
      id,
    ];
    const result = await pool.query(query, values);

    res.json({ status: "success", data: result.rows[0] });
  } catch (err) {
    console.error("Error Update Store:", err.message);
    res.status(500).json({ message: err.message });
  }
};
