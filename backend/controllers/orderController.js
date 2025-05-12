const { Op } = require("sequelize");
const Order = require("../models/order");
const Layanan = require("../models/layanan");
const User = require("../models/user");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sequelize = require("../config/database");

const calculateRentalDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Dalam hari
};
// Konfigurasi Multer untuk upload file
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

// Fungsi Pembantu
const hitungDurasiSewa = (tanggalMulai, tanggalSelesai) => {
  const diffTime = Math.abs(new Date(tanggalSelesai) - new Date(tanggalMulai));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const deleteFileIfExist = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const formatResponOrder = (order, mobil, durasi) => {
  const namaMobil = `${mobil.merek} ${mobil.model}`;
  
  return {
    id: order.id,
    user_id: order.user_id,
    user: order.user ? {
      name: order.user.name,
      phone: order.user.phone,
      address: order.user.address
    } : null,
    mobil: {
      id: mobil.id,
      nama: namaMobil,
      nomor_plat: mobil.nomor_plat,
      image: mobil.image || "/images/default-car.jpg",
    },
    tanggal_pesan: order.order_date,
    tanggal: {
      pickup: order.pickup_date,
      return: order.return_date,
    },
    durasi,
    detail_harga: {
      per_hari: mobil.harga_per_hari,
      total: order.total_price,
      pajak: order.total_price * 0.1,
      sub_total: order.total_price - (order.total_price * 0.1)
    },
    pembayaran: {
      metode: order.payment_method,
      status: order.payment_status,
      bukti: order.payment_proof ? `/uploads/payment_proofs/${path.basename(order.payment_proof)}` : null,
    },
    status: order.status,
    catatan_tambahan: order.additional_notes,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
};

const cekKetersediaanMobil = async (carId, pickupDate, returnDate, transaction) => {
  const orderConflicts = await Order.findAll({
    where: {
      car_id: carId,
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

// Controller Functions
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      car_id, 
      pickup_date, 
      return_date, 
      payment_method = 'credit_card', 
      additional_notes,
      total_price
    } = req.body;

    const user_id = req.user.id;
    const payment_proof = req.file ? req.file.path : null;

    // Validasi input
    if (!car_id || !pickup_date || !return_date) {
      deleteFileIfExist(payment_proof);
      await transaction.rollback();
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
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Tanggal pickup tidak boleh di masa lalu"
      });
    }

    if (pickupDate >= returnDate) {
      deleteFileIfExist(payment_proof);
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Tanggal pengembalian harus setelah tanggal pickup"
      });
    }

    // Cek ketersediaan mobil
    const car = await Layanan.findByPk(car_id, { transaction });
    if (!car) {
      deleteFileIfExist(payment_proof);
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Mobil tidak ditemukan"
      });
    }

    const isAvailable = await cekKetersediaanMobil(car_id, pickupDate, returnDate, transaction);
    if (!isAvailable) {
      deleteFileIfExist(payment_proof);
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Mobil tidak tersedia untuk tanggal yang dipilih"
      });
    }

    // Hitung durasi dan total harga
    const durasi = hitungDurasiSewa(pickupDate, returnDate);
    const total = total_price || (car.harga_per_hari * durasi);

    // Determine payment status
    let paymentStatus = 'unpaid';
    if (payment_method === 'credit_card') {
      paymentStatus = 'pending_verification';
    } else if (payment_proof) {
      paymentStatus = 'pending_verification';
    }

    // Buat pesanan
    const newOrder = await Order.create({
      user_id,
      car_id,
      order_date: new Date(),
      pickup_date: pickupDate,
      return_date: returnDate,
      total_price: total,
      payment_method: payment_method || "credit_card",
      payment_proof: payment_proof,
      payment_status: "unpaid",
      additional_notes: additional_notes || null,
      status: "pending"
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: formatResponOrder(newOrder, car, durasi)
    });

  } catch (error) {
    await transaction.rollback();
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
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan"
      });
    }

    // Only allow upload if status is unpaid
    if (order.payment_status !== 'unpaid') {
      deleteFileIfExist(req.file?.path);
      await transaction.rollback();
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

    const car = await Layanan.findByPk(order.car_id, { transaction });
    const durasi = hitungDurasiSewa(order.pickup_date, order.return_date);

    await transaction.commit();

    return res.json({
      success: true,
      message: "Bukti pembayaran berhasil diupload",
      data: formatResponOrder(order, car, durasi)
    });

  } catch (error) {
    await transaction.rollback();
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
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan"
      });
    }

    // Only allow verification if status is pending_verification
    if (order.payment_status !== 'pending_verification') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Hanya pesanan dengan status pending_verification yang bisa diverifikasi"
      });
    }

    await order.update({
      payment_status: status,
      status: status === 'paid' ? 'confirmed' : 'cancelled'
    }, { transaction });

    const car = await Layanan.findByPk(order.car_id, { transaction });
    const durasi = hitungDurasiSewa(order.pickup_date, order.return_date);

    await transaction.commit();

    return res.json({
      success: true,
      message: `Status pembayaran berhasil diupdate menjadi ${status}`,
      data: formatResponOrder(order, car, durasi)
    });

  } catch (error) {
    await transaction.rollback();
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
          as: 'car',
          attributes: ['id', 'merek', 'model', 'nomor_plat', 'harga_per_hari', 'image']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const formattedOrders = orders.map(order => {
      const durasi = hitungDurasiSewa(order.pickup_date, order.return_date);
      return formatResponOrder(order, order.car, durasi);
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

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
      include: [
        {
          model: Layanan,
          as: 'car',
          attributes: ['id', 'merek', 'model', 'nomor_plat', 'harga_per_hari', 'image']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'phone', 'address']
        }
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan",
      });
    }

    const durasi = hitungDurasiSewa(order.pickup_date, order.return_date);

    return res.json({
      success: true,
      data: formatResponOrder(order, order.car, durasi),
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
  const subtotal = car.harga_per_hari * duration;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return {
    order: {
      id: order.id,
      order_date: order.createdAt,
      pickup_date: order.pickup_date,
      return_date: order.return_date,
      duration: duration,
      total_price: total,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      payment_proof: order.payment_proof ? `/uploads/payment_proofs/${path.basename(order.payment_proof)}` : null,
      additional_notes: order.additional_notes || null,
      status: order.status
    },
    car: {
      id: car.id,
      name: `${car.merek} ${car.model}`,
      license_plate: car.nomor_plat,
      image_url: car.image || "/images/default-car.jpg",
      type: car.type || "Standard",
      transmission: car.transmission || "Automatic",
      fuel_type: car.fuel || "Gasoline",
      capacity: car.kapasitas || 4,
      price_per_day: car.harga_per_hari
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      id_number: user.id_number || "N/A",
      address: user.address || "N/A"
    }
  };
};

// Fungsi untuk mendapatkan struk pesanan
exports.getOrderReceipt = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Validasi input ID pesanan
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    // Mencari pesanan berdasarkan ID dan user_id untuk memastikan hanya pemilik yang dapat mengaksesnya
    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId
      },
      include: [
        {
          model: Layanan,
          as: 'car',
          attributes: ['id', 'merek', 'model', 'nomor_plat', 'harga_per_hari', 'image', 'type', 'transmission', 'fuel', 'kapasitas']
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'id_number', 'address']
        }
      ],
      transaction
    });

    // Jika pesanan tidak ditemukan
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have access"
      });
    }

    // Format data untuk struk
    const receiptData = formatReceiptResponse(order, order.car, order.user);

    // Commit transaksi jika data berhasil diambil
    await transaction.commit();

    return res.json({
      success: true,
      message: "Receipt data retrieved successfully",
      data: receiptData
    });

  } catch (error) {
    // Rollback transaksi jika terjadi error
    await transaction.rollback();
    console.error("Error in getOrderReceipt:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
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

    const car = await Layanan.findByPk(order.car_id);
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
exports.getReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const order = await Order.findOne({
      where: { id, user_id },
      include: [
        { model: Layanan, as: 'mobil' },
        { model: User, as: 'user' }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan"
      });
    }

    const durasi = hitungDurasiSewa(order.pickup_date, order.return_date);
    const mobil = order.mobil;

    const response = formatResponOrder(order, mobil, durasi);

    return res.json({
      success: true,
      message: "Data struk ditemukan",
      data: {
        receipt: {
          nama_pelanggan: response.user?.name,
          alamat: response.user?.address,
          telepon: response.user?.phone,
          mobil: response.mobil.nama,
          nomor_plat: response.mobil.nomor_plat,
          tanggal_pesan: response.tanggal_pesan,
          tanggal_pickup: response.tanggal.pickup,
          tanggal_kembali: response.tanggal.return,
          durasi: response.durasi + ' hari',
          harga_per_hari: `Rp ${response.detail_harga.per_hari.toLocaleString()}`,
          total: `Rp ${response.detail_harga.total.toLocaleString()}`,
          pajak: `Rp ${response.detail_harga.pajak.toLocaleString()}`,
          sub_total: `Rp ${response.detail_harga.sub_total.toLocaleString()}`,
          metode_pembayaran: response.pembayaran.metode,
          status_pembayaran: response.pembayaran.status,
          status_pesanan: response.status,
          bukti_pembayaran: response.pembayaran.bukti
        }
      }
    });

  } catch (error) {
    console.error("Error saat mengambil struk:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data struk"
    });
  }
};

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

    const car = await Layanan.findByPk(order.car_id);
    const durasi = hitungDurasiSewa(order.pickup_date, order.return_date);

    return res.json({
      success: true,
      message: "Pesanan berhasil dibatalkan",
      data: formatResponOrder(order, car, durasi)
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