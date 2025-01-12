const mongoose = require("mongoose");
const Order = require("../models/order");
const HistoryOrder = require("../models/historyOrder");

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "cancelled"], // Nowe statusy
      default: "in-progress", // Domyślny status to 'in-progress'
    },
  },
  {
    timestamps: true, // createdAt i updatedAt
  }
);

// Middleware do obliczania totalPrice
orderSchema.pre("save", async function (next) {
  const Dish = mongoose.model("Dish");
  const dishes = await Dish.find({
    _id: { $in: this.items.map((item) => item.dish) },
  });

  this.totalPrice = this.items.reduce((total, item) => {
    const dish = dishes.find((d) => d._id.toString() === item.dish.toString());
    if (!dish) {
      throw new Error(`Dish with ID ${item.dish} not found`);
    }
    return total + dish.price * item.quantity;
  }, 0);

  next();
});

const createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    const historyOrder = new HistoryOrder({
      orderId: newOrder._id,
      items: newOrder.items,
      totalPrice: newOrder.totalPrice,
      user: newOrder.user,
      status: newOrder.status,
      createdAt: newOrder.createdAt,
      updatedAt: newOrder.updatedAt,
    });
    await historyOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createOrder };

const completeOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "completed";
    await order.save();

    await HistoryOrder.findOneAndUpdate(
      { orderId: order._id },
      { orderId: order._id }, // Aktualizacja tylko orderId, status jest w Order
      { upsert: true }
    );

    res.status(200).json({ message: "Order completed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "cancelled";
    await order.save();

    await HistoryOrder.findOneAndUpdate(
      { orderId: order._id },
      { orderId: order._id }, // Aktualizacja tylko orderId, status jest w Order
      { upsert: true }
    );

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ...existing code...
module.exports = { createOrder, completeOrder, cancelOrder };

module.exports = Order;
