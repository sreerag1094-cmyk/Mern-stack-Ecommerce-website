const Order = require('../models/order');
const Product = require('../models/product');

// POST /api/orders
// Body: { items: [{ product, quantity }], shippingAddress, paymentMethod }
// Prices are always taken from the database, never from the client.
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const orderItems = [];
    let totalPrice = 0;
    for (const it of items) {
      const qty = Number(it.quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        res.status(400);
        throw new Error('Quantity must be a positive integer');
      }
      const product = await Product.findById(it.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${it.product}`);
      }
      if (product.countInStock < qty) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: qty,
      });
      totalPrice += product.price * qty;
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice: Math.round(totalPrice * 100) / 100,
    });

    await Promise.all(
      orderItems.map((i) => Product.updateOne({ _id: i.product }, { $inc: { countInStock: -i.quantity } }))
    );

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/mine
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id  (owner or admin)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    const ownerId = order.user._id ? order.user._id.toString() : order.user.toString();
    if (req.user.role !== 'admin' && ownerId !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Forbidden: not your order');
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders  (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const orders = await Order.find(filter).populate('user', 'name email').sort('-createdAt');
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    order.status = req.body.status;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/cancel  (owner, only while pending)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Forbidden: not your order');
    }
    if (order.status !== 'pending') {
      res.status(400);
      throw new Error('Only pending orders can be cancelled');
    }
    order.status = 'cancelled';
    await order.save();
    await Promise.all(
      order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { countInStock: i.quantity } }))
    );
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id  (admin)
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    res.json({ success: true, message: 'Order removed' });
  } catch (err) {
    next(err);
  }
};
