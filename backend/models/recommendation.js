const mongoose = require('mongoose');

// One document per "antecedent" product. `recommended` is filled by importing
// RapidMiner association-rule output (see /rapidminer/README.md).
const recommendationSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    recommended: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        confidence: { type: Number, default: 0 },
        lift: { type: Number, default: 0 },
      },
    ],
    source: { type: String, default: 'rapidminer' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
