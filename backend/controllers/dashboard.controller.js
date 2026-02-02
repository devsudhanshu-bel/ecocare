const Detection = require("../models/Detection.model")

/* =========================
   DATE RANGE HELPER
========================= */
const getDateRange = (range = "today") => {
  const now = new Date()
  let start, end

  switch (range) {
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      break

    case "year":
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      break

    case "lifetime":
      start = new Date(0)
      end = new Date()
      break

    default: // today
      start = new Date()
      start.setHours(0, 0, 0, 0)
      end = new Date()
      end.setHours(23, 59, 59, 999)
  }

  return { start, end }
}

/* =========================
   HISTORY (FILTER & SEARCH)
========================= */
exports.getHistory = async (req, res) => {
  try {
    const { type, search } = req.query
    const query = {}

    // Filter by Product Type
    if (type && type !== "All Devices") {
      // Use case-insensitive regex for product type match
      query.product_type = { $regex: new RegExp(`^${type}$`, "i") }
    }

    // Search by Brand or Model
    if (search) {
      const searchRegex = new RegExp(search, "i")
      query.$or = [
        { brand: searchRegex },
        { model_or_series: searchRegex },
        { product_type: searchRegex }
      ]
    }

    const data = await Detection.find(query)
      .sort({ createdAt: -1 })
      .limit(50) // Reasonable limit

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* =========================
   RECENT DETECTIONS
========================= */
exports.getRecentDetections = async (req, res) => {
  try {
    const { range = "today" } = req.query
    const { start, end } = getDateRange(range)

    const data = await Detection.find({
      createdAt: { $gte: start, $lte: end }
    })
      .sort({ createdAt: -1 })
      .limit(10)

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* =========================
   ADD DETECTION (LIVE)
========================= */
exports.addDetection = async (req, res) => {
  try {
    const {
      product_type,
      brand,
      model_or_series,

      metals = [],
      semiconductors = [],
      battery_materials = [],
      image = "",

      confidence = 100
    } = req.body

    // Basic validation
    if (!product_type || !brand || !model_or_series) {
      return res.status(400).json({
        message: "product_type, brand, and model_or_series are required"
      })
    }

    // Create detection record
    const detection = await Detection.create({
      product_type,
      brand,
      model_or_series,
      metals,
      semiconductors,
      battery_materials,
      image,
      confidence
    })

    // 🔴 Emit live update via Socket.IO
    const io = req.app.get("io")
    if (io) {
      io.emit("detection:new", {
        id: detection._id,
        product_type: detection.product_type,
        brand: detection.brand,
        model_or_series: detection.model_or_series,
        confidence: detection.confidence,
        createdAt: detection.createdAt
      })
    }

    res.status(201).json(detection)
  } catch (error) {
    console.error("ADD DETECTION ERROR:", error.message)
    res.status(500).json({ error: error.message })
  }
}


/* =========================
   TOP MATERIALS (BAR)
========================= */
exports.getTopMaterials = async (req, res) => {
  try {
    const { range = "today" } = req.query
    const { start, end } = getDateRange(range)

    const result = await Detection.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$product_type",
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } }
    ])

    res.status(200).json(
      result.map(r => ({ name: r._id, value: r.value }))
    )
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* =========================
   DASHBOARD STATS (CARDS)
========================= */
exports.getDashboardStats = async (req, res) => {
  try {
    const { range = "today" } = req.query
    const { start, end } = getDateRange(range)

    const totalItems = await Detection.countDocuments({
      createdAt: { $gte: start, $lte: end }
    })

    const errorItems = await Detection.countDocuments({
      product_type: "Unknown",
      createdAt: { $gte: start, $lte: end }
    })

    const detectionRate =
      totalItems === 0
        ? 0
        : Math.round(((totalItems - errorItems) / totalItems) * 100)

    res.status(200).json({
      detectionRate: {
        value: `${detectionRate}%`
      },
      totalItems: {
        value: totalItems
      },
      errorItems: {
        value: errorItems
      }
    })
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error.message)
    res.status(500).json({ error: error.message })
  }
}

/* =========================
   ALERTS SUMMARY
========================= */
exports.getAlerts = async (req, res) => {
  try {
    const { range = "today" } = req.query
    const { start, end } = getDateRange(range)

    const baseFilter = {
      createdAt: { $gte: start, $lte: end }
    }

    const unknown = await Detection.countDocuments({
      ...baseFilter,
      product_type: "Unknown"
    })

    const lowConfidence = await Detection.countDocuments({
      ...baseFilter,
      confidence: { $lt: 60 }
    })

    const repeatedScan = await Detection.countDocuments({
      ...baseFilter,
      confidence: { $lt: 40 }
    })

    res.status(200).json({
      unknown,
      lowConfidence,
      repeatedScan
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* =========================
   ACCURACY TREND (LINE)
========================= */
exports.getAccuracyTrend = async (req, res) => {
  try {
    const { range = "month" } = req.query
    const { start, end } = getDateRange(range)

    /* =========================
       DETERMINE GROUPING FORMAT
    ========================= */
    let dateFormat
    switch (range) {
      case "today":
        dateFormat = "%H" // Group by Hour (00-23)
        break
      case "year":
      case "lifetime":
        dateFormat = "%m" // Group by Month (01-12)
        break
      default: // month
        dateFormat = "%d" // Group by Day (01-31)
    }

    /* =========================
       CURRENT RANGE DATA
    ========================= */
    const data = await Detection.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$createdAt" }
          },
          total: { $sum: 1 },
          unknown: {
            $sum: {
              $cond: [{ $eq: ["$product_type", "Unknown"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])

    let formatted = data.map(d => ({
      day: d._id,
      value:
        d.total === 0
          ? 0
          : Math.round(((d.total - d.unknown) / d.total) * 100)
    }))

    /* =========================
       PREVIOUS DATE BASELINE
    ========================= */
    const prevStart = new Date(start)
    prevStart.setDate(prevStart.getDate() - 1)
    prevStart.setHours(0, 0, 0, 0)

    const prevEnd = new Date(start)
    prevEnd.setMilliseconds(-1)

    const prevAgg = await Detection.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStart, $lte: prevEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unknown: {
            $sum: {
              $cond: [{ $eq: ["$product_type", "Unknown"] }, 1, 0]
            }
          }
        }
      }
    ])

    if (prevAgg.length > 0) {
      const p = prevAgg[0]
      const prevAccuracy =
        p.total === 0
          ? 0
          : Math.round(((p.total - p.unknown) / p.total) * 100)

      // 🔑 PREPEND previous date accuracy
      formatted = [
        { day: "Prev", value: prevAccuracy },
        ...formatted
      ]
    }

    /* =========================
       SAFETY: ENSURE LINE RENDERS
    ========================= */
    if (formatted.length === 1) {
      formatted = [
        { day: "00", value: formatted[0].value },
        formatted[0]
      ]
    }

    res.status(200).json(formatted)
  } catch (error) {
    console.error("ACCURACY TREND ERROR:", error.message)
    res.status(500).json({ error: error.message })
  }
}

/* =========================
   TIMELINE GRAPH (COUNTS)
========================= */
exports.getTimelineStats = async (req, res) => {
  try {
    const { range = "today" } = req.query
    const { start, end } = getDateRange(range)

    let dateFormat
    let countType = "products" // default

    switch (range) {
      case "today":
        dateFormat = "%H" // Hour
        countType = "components"
        break
      case "month":
        dateFormat = "%d" // Day
        countType = "products"
        break
      case "year":
        dateFormat = "%m" // Month
        countType = "products"
        break
      case "lifetime":
        dateFormat = "%Y" // Year
        countType = "components"
        break
      default:
        dateFormat = "%d"
    }

    // Aggregation Pipeline
    const pipeline = [
      { $match: { createdAt: { $gte: start, $lte: end } } }
    ]

    // If counting components, we need to calculate the sum of array lengths
    if (countType === "components") {
      pipeline.push({
        $project: {
          createdAt: 1,
          componentCount: {
            $add: [
              { $size: { $ifNull: ["$metals", []] } },
              { $size: { $ifNull: ["$semiconductors", []] } },
              { $size: { $ifNull: ["$battery_materials", []] } },
              { $size: { $ifNull: ["$structural_materials", []] } }
            ]
          }
        }
      })
    }

    // Grouping
    pipeline.push({
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        value: { $sum: countType === "components" ? "$componentCount" : 1 }
      }
    })

    // Sorting
    pipeline.push({ $sort: { _id: 1 } })

    const data = await Detection.aggregate(pipeline)

    const formatted = data.map(d => ({
      day: d._id,
      value: d.value
    }))

    res.status(200).json({
      data: formatted,
      type: countType
    })

  } catch (error) {
    console.error("TIMELINE STATS ERROR:", error.message)
    res.status(500).json({ error: error.message })
  }
}

