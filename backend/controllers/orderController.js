const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const Order = require('../models/order');
const Layanan = require('../models/layanan');

// Helper Functions
const calculateRentalDuration = (startDate, endDate) => {
  const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatOrderResponse = (order, car, duration) => ({
  id: order.id,
  user_id: order.user_id,
  car: {
    id: car.id,
    name: `${car.merek} ${car.model}`,
    license_plate: car.nomor_plat,
    image: car.image || '/images/default-car.jpg'
  },
  order_date: order.order_date,
  dates: {
    pickup: order.pickup_date,
    return: order.return_date,
  },
  duration,
  price_details: {
    per_day: car.harga_per_hari,
    total: order.total_price,
  },
  payment: {
    method: order.payment_method,
    status: order.payment_status,
  },
  status: order.status,
  additional_notes: order.additional_notes,
  created_at: order.createdAt,
  updated_at: order.updatedAt
});

const checkCarAvailability = async (carId, pickupDate, returnDate, transaction) => {
  const conflictingOrders = await Order.findAll({
    where: {
      car_id: carId,
      [Op.or]: [
        {
          pickup_date: { [Op.lte]: returnDate },
          return_date: { [Op.gte]: pickupDate },
        },
      ],
      status: { [Op.notIn]: ['cancelled', 'completed'] },
    },
    transaction,
  });
  return conflictingOrders.length === 0;
};

// CREATE ORDER
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { car_id, pickup_date, return_date, payment_method, additional_notes } = req.body;
    const user_id = req.user.id;

    // Basic validation
    if (!car_id || !pickup_date || !return_date) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Date validation
    const pickupDate = new Date(pickup_date);
    const returnDate = new Date(return_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Pickup date cannot be in the past'
      });
    }

    if (pickupDate >= returnDate) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Return date must be after pickup date'
      });
    }

    // Check car availability
    const car = await Layanan.findByPk(car_id, { transaction });
    if (!car) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    const isAvailable = await checkCarAvailability(car_id, pickupDate, returnDate, transaction);
    if (!isAvailable) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Car not available for selected dates'
      });
    }

    // Calculate price
    const duration = calculateRentalDuration(pickupDate, returnDate);
    const total_price = car.harga_per_hari * duration;

    // Create order
    const newOrder = await Order.create({
      user_id,
      car_id,
      order_date: new Date(),
      pickup_date: pickupDate,
      return_date: returnDate,
      total_price,
      payment_method: payment_method || 'credit_card',
      additional_notes: additional_notes || null,
      status: 'pending',
      payment_status: 'unpaid'
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: formatOrderResponse(newOrder, car, duration)
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const whereClause = { user_id: req.user.id };
    
    const orders = await Order.findAll({
      where: whereClause,
      include: [{
        model: Layanan,
        as: 'car',
        attributes: ['id', 'merek', 'model', 'nomor_plat', 'harga_per_hari', 'image']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedOrders = orders.map(order => 
      formatOrderResponse(
        order,
        order.car,
        calculateRentalDuration(order.pickup_date, order.return_date)
    ));

    return res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get orders'
    });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [{
        model: Layanan,
        as: 'car',
        attributes: ['id', 'merek', 'model', 'nomor_plat', 'harga_per_hari', 'image']
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const duration = calculateRentalDuration(order.pickup_date, order.return_date);

    return res.json({
      success: true,
      data: formatOrderResponse(order, order.car, duration)
    });
  } catch (error) {
    console.error('Error getting order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get order details'
    });
  }
};