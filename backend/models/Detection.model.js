const mongoose = require("mongoose")

const DetectionSchema = new mongoose.Schema({
  /* ================= BASIC INFO ================= */
  product_type: {
    type: String,
    required: true,
    index: true
  },

  brand: {
    type: String,
    required: true
  },

  model_or_series: {
    type: String,
    required: true
  },

  image: {
    type: String,
    default: ""
  },

  /* ================= MATERIAL ANALYSIS ================= */
  metals: {
    type: [String],
    default: []
  },

  semiconductors: {
    type: [String],
    default: []
  },

  battery_materials: {
    type: [String],
    default: []
  },

  structural_materials: {
    type: [String],
    default: []
  },

  /* ================= METADATA ================= */
  confidence: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },

  /* ================= TIMESTAMPS ================= */
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
})

module.exports = mongoose.model("Detection", DetectionSchema)
