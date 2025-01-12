const mongoose = require('mongoose');

const historyOrderSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  // Dodaj inne pola, które chcesz przechowywać w historii zamówień, jeśli są potrzebne
}, { timestamps: true });

const HistoryOrder = mongoose.model('HistoryOrder', historyOrderSchema);

module.exports = HistoryOrder;