const mongoose = require('mongoose');
const { Schema } = mongoose;

const StockLikesSchema = new Schema({
    symbol: { type: String, required: true },
    likes: { type: Number, default : 0 },
    ipAddresses: { type: [String], default: [] }
});
const StockLikes = mongoose.model("StockLikes", StockLikesSchema);

module.exports = StockLikes;