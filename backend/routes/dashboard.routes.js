const express = require("express")
const {
  getRecentDetections,
  addDetection,
  getTopMaterials,
  getDashboardStats,
  getAlerts,
  getAccuracyTrend,
  getHistory,
  getTimelineStats
} = require("../controllers/dashboard.controller")

const router = express.Router()

router.get("/recent", getRecentDetections)
router.post("/add", addDetection)
router.get("/materials", getTopMaterials)
router.get("/stats", getDashboardStats)
router.get("/alerts", getAlerts)
router.get("/accuracy", getAccuracyTrend)
router.get("/history", getHistory)
router.get("/timeline", getTimelineStats)

module.exports = router
