const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sequelize = require("../config/database");
const db = require('../models');
const Notification = db.Notification;
const { Order, Layanan, User } = db;
const { sendMail } = require("../utils/email");
const { sendWhatsappFonnte } = require("../utils/whatsapp");
const Testimoni = require('../models/testimoni'); // pastikan sudah di-import

// Helper
const calculateRentalDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const hitungDurasiSewa = (tanggalMulai, tanggalSelesai) => {
  const diffTime = Math.abs(new Date(tanggalSelesai) - new Date(tanggalMulai));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const deleteFileIfExist = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/payment_proofs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, or PDF are allowed.'), false);
  }
};
exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Format response order
function formatResponOrder(order, car, durasi) {
  return {
    id: order.id,
    order_date: order.order_date,
    pickup_date: order.pickup_date,
    return_date: order.return_date,
    duration: durasi,
    total_price: order.total_price,
    status: order.status,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    payment_proof: order.payment_proof ? `/uploads/payment_proofs/${path.basename(order.payment_proof)}` : null,
    additional_notes: order.additional_notes,
    car: {
      id: car.id,
      name: car.nama || "-",
      license_plate: car.nomor_plat || "-",
      image_url: car.gambar || "/images/default-car.jpg",
      type: car.type || "Standard",
      transmission: car.transmisi || car.transmission || "Automatic",
      fuel_type: car.fuel_type || car.fuel || "Gasoline",
      capacity: car.kapasitas || car.capacity || 4,
      price_per_day: car.harga_per_hari || car.harga || 0,
      promo: car.promo || 0,
      rating: car.rating !== undefined ? car.rating : null,
      jumlah_review: car.jumlah_review || 0,
      fitur: car.fitur || []
    }
  };
};

const cekKetersediaanMobil = async (carId, pickupDate, returnDate, transaction) => {
  const orderConflicts = await Order.findAll({
    where: {
      layanan_id: carId,
      [Op.or]: [
        {
          pickup_date: { [Op.lte]: returnDate },
          return_date: { [Op.gte]: pickupDate },
        },
      ],
      status: { [Op.notIn]: ["cancelled", "completed"] },
    },
    transaction,
  });
  return orderConflicts.length === 0;
};

async function getCarWithRating(car) {
  // Ambil semua testimoni untuk layanan ini
  const testimoni = await Testimoni.findAll({ where: { layanan_id: car.id } });
  let rating = 0;
  let jumlah_review = 0;
  if (testimoni.length > 0) {
    jumlah_review = testimoni.length;
    rating = testimoni.reduce((sum, t) => sum + t.rating, 0) / jumlah_review;
    rating = Math.round(rating * 10) / 10; // 1 desimal
  }
  return {
    id: car.id,
    name: car.nama || "-",
    license_plate: car.nomor_plat || "-",
    image_url: car.gambar || "/images/default-car.jpg",
    type: car.type || "Standard",
    transmission: car.transmisi || car.transmission || "Automatic",
    fuel_type: car.fuel_type || car.fuel || "Gasoline",
    capacity: car.kapasitas || car.capacity || 4,
    price_per_day: car.harga_per_hari || car.harga || 0,
    promo: car.promo || 0,
    rating,
    jumlah_review,
    fitur: car.fitur || []
  };
}

// ========== CONTROLLER FUNCTIONS ==========

exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      layanan_id, 
      pickup_date, 
      return_date, 
      payment_method = 'credit_card', 
      additional_notes,
      total_price
    } = req.body;

    const user_id = req.user.id;
    const payment_proof = req.file ? req.file.path : null;

    // Validasi input
    if (!layanan_id || !pickup_date || !return_date) {
      deleteFileIfExist(payment_proof);
      if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Data yang diperlukan tidak lengkap"
      });
    }

    const pickupDate = new Date(pickup_date);
    const returnDate = new Date(return_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      deleteFileIfExist(payment_proof);
      if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Tanggal pickup tidak boleh di masa lalu"
      });
    }

    if (pickupDate >= returnDate) {
      deleteFileIfExist(payment_proof);
      if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Tanggal pengembalian harus setelah tanggal pickup"
      });
    }

    // Cek ketersediaan mobil
    const car = await Layanan.findByPk(layanan_id, { transaction });
    if (!car) {
      deleteFileIfExist(payment_proof);
      if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      return res.status(404).json({
        success: false,
        message: "Mobil tidak ditemukan"
      });
    }

    const isAvailable = await cekKetersediaanMobil(layanan_id, pickupDate, returnDate, transaction);
    if (!isAvailable) {
      deleteFileIfExist(payment_proof);
      if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Mobil tidak tersedia untuk tanggal yang dipilih"
      });
    }

    // Hitung durasi dan total harga
    const durasi = hitungDurasiSewa(pickupDate, returnDate);
    const total = total_price || (car.harga_per_hari * durasi);

    // Determine payment status
    const payment_status = (payment_method === 'credit_card' || payment_proof) ? 'pending_verification' : 'unpaid';

    // Buat pesanan
    const newOrder = await Order.create({
      user_id,
      layanan_id,
      order_date: new Date(),
      pickup_date: pickupDate,
      return_date: returnDate,
      total_price: total,
      payment_method: payment_method || "credit_card",
      payment_proof: payment_proof,
      payment_status: payment_status,
      additional_notes: additional_notes || null,
      status: "pending"
    }, { transaction });
    // Trigger notifikasi admin
    await Notification.create({
      user_id: null,
      message: `Pesanan baru #${newOrder.id} dari ${req.user.name}`,
      type: 'order'
    });

    await transaction.commit();

    // Kirim email ke admin
    await sendMail({
      to: "rentalhs591@gmail.com", // email admin
      subject: `Pesanan Baru #${newOrder.id} dari ${req.user.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden;">
          <div style="background:#1976d2; color:#fff; padding:24px;">
            <h2 style="margin:0; font-size:1.3rem;">🚗 Pesanan Baru Masuk</h2>
          </div>
          <div style="padding:28px 24px;">
            <p style="margin-bottom:16px;">Halo Admin,</p>
            <p style="margin-bottom:18px;">Ada pesanan baru yang perlu diproses. Berikut detailnya:</p>
            <table style="width:100%; font-size:1rem; margin-bottom:18px;">
              <tr>
                <td style="padding:6px 0; color:#555;">ID Pesanan</td>
                <td style="padding:6px 0;"><b>#${newOrder.id}</b></td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#555;">Nama Pelanggan</td>
                <td style="padding:6px 0;">${req.user.name}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#555;">Email Pelanggan</td>
                <td style="padding:6px 0;">${req.user.email}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#555;">Tanggal Sewa</td>
                <td style="padding:6px 0;">${pickup_date} s/d ${return_date}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#555;">Total</td>
                <td style="padding:6px 0;"><b>Rp${Number(total).toLocaleString("id-ID")}</b></td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#555;">Metode Pembayaran</td>
                <td style="padding:6px 0;">${payment_method}</td>
              </tr>
            </table>
            <div style="margin:18px 0;">
              <a href="http://localhost:3001/admin/orders" style="display:inline-block; background:#1976d2; color:#fff; text-decoration:none; padding:10px 22px; border-radius:5px; font-weight:600;">Lihat di Dashboard Admin</a>
            </div>
            <p style="color:#888; font-size:0.97rem; margin-top:24px;">Segera proses pesanan ini agar pelanggan mendapatkan pelayanan terbaik.</p>
          </div>
          <div style="background:#f8f9fa; color:#888; text-align:center; font-size:0.95rem; padding:12px 0;">
            Rental Mobil &copy; ${new Date().getFullYear()}
          </div>
        </div>
      `,
    });

    // Kirim email ke pelanggan
    await sendMail({
      to: req.user.email,
      subject: `Pesanan Anda Berhasil Dibuat (#${newOrder.id})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden;">
          <div style="background:#1976d2; color:#fff; padding:24px;">
            <h2 style="margin:0; font-size:1.2rem;">Terima Kasih, Pesanan Anda Berhasil!</h2>
          </div>
          <div style="padding:28px 24px;">
            <p style="margin-bottom:10px;">Halo <b>${req.user.name}</b>,</p>
            <p style="margin-bottom:18px;">Pesanan Anda telah berhasil dibuat. Berikut detail pesanan Anda:</p>
            <table style="width:100%; font-size:1rem; margin-bottom:18px;">
              <tr>
                <td style="padding:6px 0; color:#555;">ID Pesanan</td>
                <td style="padding:6px 0;"><b>#${newOrder.id}</b></td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#555;">Tanggal Sewa</td>
                <td style="padding:6px 0;">${pickup_date} s/d ${return_date}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#555;">Total</td>
                <td style="padding:6px 0;"><b>Rp${Number(total).toLocaleString("id-ID")}</b></td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#555;">Metode Pembayaran</td>
                <td style="padding:6px 0;">${payment_method}</td>
              </tr>
            </table>
            <div style="background:#e3f2fd; border-radius:6px; padding:14px 18px; margin-bottom:18px; color:#1976d2;">
              <b>Catatan:</b> Mohon segera lakukan pembayaran sesuai metode yang dipilih.<br>
              Status pesanan dan pembayaran dapat dipantau melalui dashboard akun Anda.
            </div>
            <div style="margin:18px 0;">
              <a href="http://localhost:3000/orders" style="display:inline-block; background:#1976d2; color:#fff; text-decoration:none; padding:10px 22px; border-radius:5px; font-weight:600;">Lihat Pesanan Saya</a>
            </div>
            <p style="color:#888; font-size:0.97rem; margin-top:24px;">Jika ada pertanyaan, silakan hubungi admin melalui kontak yang tersedia di website.</p>
          </div>
          <div style="background:#f8f9fa; color:#888; text-align:center; font-size:0.95rem; padding:12px 0;">
            Rental Mobil &copy; ${new Date().getFullYear()}
          </div>
        </div>
      `,
    });

    // Kirim WhatsApp ke admin
    await sendWhatsappFonnte(
      process.env.ADMIN_WA,
      `🚗 Pesanan Baru Masuk!\n\nID Pesanan: #${newOrder.id}\nNama Pelanggan: ${req.user.name}\nTanggal Sewa: ${pickupDate.toLocaleDateString("id-ID")} s/d ${returnDate.toLocaleDateString("id-ID")}\nMobil: ${car.nama}\nTotal: Rp${Number(total).toLocaleString("id-ID")}\n\nSegera proses pesanan ini di dashboard admin.`
    );

    // Kirim WhatsApp ke user
    if (req.user.no_telp) {
      await sendWhatsappFonnte(
        req.user.no_telp,
        `✅ Pesanan Anda Berhasil!\n\nTerima kasih, ${req.user.name}.\nPesanan Anda (#${newOrder.id}) telah diterima.\n\nDetail Pesanan:\nMobil: ${car.nama}\nTanggal Sewa: ${pickupDate.toLocaleDateString("id-ID")} s/d ${returnDate.toLocaleDateString("id-ID")}\nTotal: Rp${Number(total).toLocaleString("id-ID")}\n\nKami akan segera memproses pesanan Anda.\nCek status pesanan di website atau hubungi admin jika ada pertanyaan.`
      );
    }

    return res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: formatResponOrder(newOrder, car, durasi)
    });

  } catch (error) {
    if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
      await transaction.rollback();
    }
    deleteFileIfExist(req.file?.path);

    console.error("Error membuat pesanan:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

exports.uploadPaymentProof = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diupload"
      });
    }

    const order = await Order.findOne({
      where: { id, user_id },
      transaction
    });

    if (!order) {
      deleteFileIfExist(req.file?.path);
      if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan"
      });
    }

    // Only allow upload if status is unpaid
    if (order.payment_status !== 'unpaid') {
      deleteFileIfExist(req.file?.path);
      if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Bukti pembayaran hanya bisa diupload untuk pesanan yang belum dibayar"
      });
    }

    // Hapus file lama jika ada
    deleteFileIfExist(order.payment_proof);

    await order.update({
      payment_proof: req.file.path,
      payment_status: 'pending_verification',
      status: 'pending'
    }, { transaction });

    const car = await Layanan.findByPk(order.layanan_id, { transaction });
    const durasi = hitungDurasiSewa(order.pickup_date, order.return_date);

    await transaction.commit();

    return res.json({
      success: true,
      message: "Bukti pembayaran berhasil diupload",
      data: formatResponOrder(order, car, durasi)
    });

  } catch (error) {
    if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
      await transaction.rollback();
    }
    deleteFileIfExist(req.file?.path);

    console.error("Error upload bukti pembayaran:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengupload bukti pembayaran"
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body; // 'paid' or 'rejected'

    if (!['paid', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status pembayaran tidak valid"
      });
    }

    const order = await Order.findOne({
      where: { id },
      transaction
    });

    if (!order) {
      if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan"
      });
    }

    // Only allow verification if status is pending_verification
    if (order.payment_status !== 'pending_verification') {
      if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
        await transaction.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Hanya pesanan dengan status pending_verification yang bisa diverifikasi"
      });
    }

    await order.update({
      payment_status: status,
      status: status === 'paid' ? 'confirmed' : 'cancelled'
    }, { transaction });
    // Trigger notifikasi user
    await Notification.create({
      user_id: order.user_id,
      message: `Pembayaran pesanan #${order.id} telah ${status === 'paid' ? 'diterima' : 'ditolak'}`,
      type: 'payment'
    });

    const car = await Layanan.findByPk(order.layanan_id, { transaction });
    const durasi = hitungDurasiSewa(order.pickup_date, order.return_date);

    await transaction.commit();

    // Kirim email ke user
    if (order.user_id) {
      const user = await User.findByPk(order.user_id);
      if (user && user.email) {
        await sendMail({
          to: user.email,
          subject: `Status Pembayaran Pesanan #${order.id}`,
          html: `
            <div style="font-family: Arial,sans-serif;max-width:600px;margin:0 auto;">
              <h2>Status Pembayaran Pesanan Anda</h2>
              <p>Halo <b>${user.name}</b>,</p>
              <p>Pembayaran pesanan Anda untuk mobil <b>${car?.nama || "-"}</b> telah <b>${status === 'paid' ? 'DITERIMA' : 'DITOLAK'}</b>.</p>
              <p>ID Pesanan: <b>#${order.id}</b></p>
              <p>Terima kasih telah menggunakan layanan kami.</p>
            </div>
          `
        });
      }
    }

    return res.json({
      success: true,
      message: `Status pembayaran berhasil diupdate menjadi ${status}`,
      data: formatResponOrder(order, car, durasi)
    });

  } catch (error) {
    if (transaction && transaction.finished !== "commit" && transaction.finished !== "rollback") {
      await transaction.rollback();
    }
    console.error("Error verifikasi pembayaran:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memverifikasi pembayaran"
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Layanan,
          as: 'layanan',
          attributes: [
            'id', 'nama', 'harga', 'gambar', 'deskripsi', 'kategori', 'status',
            'promo', 'rating', 'jumlah_review', 'transmisi', 'kapasitas', 'fitur'
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const formattedOrders = orders.map(order => {
      const durasi = hitungDurasiSewa(order.pickup_date, order.return_date);
      return formatResponOrder(order, order.layanan, durasi);
    });

    return res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error mengambil pesanan:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil pesanan",
    });
  }
};

exports.getOrderByUserId = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const orders = await Order.findAll({
      where: { user_id },
      include: [
        {
          model: Layanan,
          as: 'layanan',
          attributes: ['id', 'nama', 'harga']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'no_telp']
        }
      ],
      order: [['order_date', 'DESC']]
    });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan untuk pengguna ini"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Daftar pesanan ditemukan",
      data: orders
    });

  } catch (error) {
    console.error("Error mengambil pesanan:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    // Admin bisa akses semua, user hanya miliknya sendiri
    const where = { id: req.params.id };
    if (req.user.role !== "admin") {
      where.user_id = req.user.id;
    }

    const order = await Order.findOne({
      where,
      include: [
        {
          model: Layanan,
          as: 'layanan',
          attributes: ['id', 'nama', 'harga']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'no_telp']
        }
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan",
      });
    }

    // Kirim path bukti pembayaran yang bisa diakses frontend
    const paymentProofUrl = order.payment_proof
      ? `/uploads/payment_proofs/${require('path').basename(order.payment_proof)}`
      : null;

    return res.json({
      success: true,
      data: {
        ...order.toJSON(),
        payment_proof: paymentProofUrl
      }
    });
  } catch (error) {
    console.error("Error mengambil pesanan:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail pesanan",
    });
  }
};

// Fungsi untuk format response pesanan
const formatReceiptResponse = (order, car, user) => {
  const duration = calculateRentalDuration(order.pickup_date, order.return_date);
  return {
    order: {
      id: order.id,
      order_date: order.order_date,
      pickup_date: order.pickup_date,
      return_date: order.return_date,
      duration: duration,
      total_price: order.total_price,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      payment_proof: order.payment_proof ? `/uploads/payment_proofs/${path.basename(order.payment_proof)}` : null,
      additional_notes: order.additional_notes
    },
    car: {
      id: car.id,
      name: car.nama || `${car.merek || ""} ${car.model || ""}`,
      license_plate: car.nomor_plat || "-",
      image_url: car.image || "/images/default-car.jpg",
      type: car.type || "Standard",
      transmission: car.transmission || "Automatic",
      fuel_type: car.fuel || "Gasoline",
      capacity: car.kapasitas || 4,
      price_per_day: car.harga_per_hari || car.harga || 0
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email || "-",
      phone: user.phone || user.no_telp || "-",
      id_number: user.id_number || "-",
      address: user.address || "-"
    }
  };
};


// Fungsi untuk mendapatkan struk pesanan
exports.getOrderReceipt = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id },
      include: [
        { model: Layanan, as: 'layanan' },
        { model: User, as: 'user' }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const response = formatReceiptResponse(order, order.layanan, order.user);

    return res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error("Error getOrderReceipt:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// Fungsi lainnya yang sudah ada
exports.cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const order = await Order.findOne({
      where: { id, user_id },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan"
      });
    }

    // Hanya bisa cancel jika status masih unpaid/pending
    if (!['unpaid', 'pending'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Pesanan hanya bisa dibatalkan jika status unpaid/pending"
      });
    }

    await order.update({
      status: 'cancelled',
      payment_status: 'refunded'
    }, { transaction });

    await transaction.commit();

    const car = await Layanan.findByPk(order.layanan_id);
    const durasi = calculateRentalDuration(order.pickup_date, order.return_date);

    return res.json({
      success: true,
      message: "Pesanan berhasil dibatalkan",
      data: formatReceiptResponse(order, car, durasi)
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error membatalkan pesanan:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal membatalkan pesanan"
    });
  }
};

// Ambil semua pesanan untuk admin
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    // Ambil query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const offset = (page - 1) * limit;

    // Filter pencarian dan status
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { '$user.name$': { [Op.iLike]: `%${search}%` } },
        { '$layanan.nama$': { [Op.iLike]: `%${search}%` } },
        { id: { [Op.eq]: Number(search) || 0 } }
      ];
    }

    // Query dengan relasi user & layanan
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Layanan, as: 'layanan', attributes: ['id', 'nama', 'harga', 'promo'] },
        { model: User, as: 'user', attributes: ['id', 'name'] }
      ],
      order: [['order_date', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error getAllOrdersAdmin:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: Layanan, as: 'layanan', attributes: ['nama'] }
      ]
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
    }
    order.status = status;
    await order.save();

    // Kirim email notifikasi ke user
    if (order.user && order.user.email) {
      let statusLabel = "";
      switch (status) {
        case "pending": statusLabel = "Menunggu"; break;
        case "confirmed": statusLabel = "Dikonfirmasi"; break;
        case "completed": statusLabel = "Selesai"; break;
        case "cancelled": statusLabel = "Dibatalkan"; break;
        case "rejected": statusLabel = "Ditolak"; break;
        default: statusLabel = status;
      }
      await sendMail({
        to: order.user.email,
        subject: `Status Pesanan #${order.id} Diubah Menjadi ${statusLabel}`,
        html: `
          <div style="font-family: Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2>Status Pesanan Anda Telah Diubah</h2>
            <p>Halo <b>${order.user.name}</b>,</p>
            <p>Status pesanan Anda untuk mobil <b>${order.layanan?.nama || "-"}</b> telah diubah menjadi <b>${statusLabel}</b>.</p>
            <p>ID Pesanan: <b>#${order.id}</b></p>
            <p>Terima kasih telah menggunakan layanan kami.</p>
          </div>
        `
      });
    }

    res.json({ success: true, message: "Status pesanan berhasil diupdate", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal update status pesanan" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
    }
    await order.destroy();
    res.json({ success: true, message: "Pesanan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menghapus pesanan" });
  }
};