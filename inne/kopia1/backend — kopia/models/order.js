const mongoose = require("mongoose");

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
  },
  {
    timestamps: true, // createdAt i updatedAt
  }
);

// Middleware do obliczania totalPrice
orderSchema.pre("save", async function (next) {
  // Pobierz szczegóły wszystkich dań w zamówieniu
  const Dish = mongoose.model("Dish"); // Aby uniknąć circular dependencies
  const dishes = await Dish.find({
    _id: { $in: this.items.map((item) => item.dish) },
  });

  // Oblicz totalPrice
  this.totalPrice = this.items.reduce((total, item) => {
    const dish = dishes.find((d) => d._id.toString() === item.dish.toString());
    if (!dish) {
      throw new Error(`Dish with ID ${item.dish} not found`);
    }
    return total + dish.price * item.quantity;
  }, 0);

  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
