import { useEffect, useState, useCallback } from "react"
import socket from "../socket"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

function DetectionChart({ range }) {
  const [data, setData] = useState([])
  const [type, setType] = useState("products")
  const [loading, setLoading] = useState(true)

  /* ================= HELPER: GENERATE FULL X-AXIS ================= */
  const generateFullAxis = (rangeType) => {
    const now = new Date()

    switch (rangeType) {
      case "today":
        // 24 hours: 00 to 23
        return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))

      case "month":
        // All days of current month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        return Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"))

      case "year":
        // 12 months: 01 to 12
        return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))

      case "lifetime":
        // Last 5 years
        const currentYear = now.getFullYear()
        return Array.from({ length: 5 }, (_, i) => String(currentYear - 4 + i))

      default:
        return []
    }
  }

  /* ================= HELPER: MERGE DATA WITH FULL AXIS ================= */
  const mergeWithFullAxis = (apiData, rangeType) => {
    const fullAxis = generateFullAxis(rangeType)
    const dataMap = new Map(apiData.map(d => [d.day, d.value]))

    return fullAxis.map(label => ({
      day: label,
      value: dataMap.get(label) || 0
    }))
  }

  /* ================= FETCH FUNCTION (STABLE) ================= */
  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `http://localhost:5000/api/dashboard/timeline?range=${range}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch timeline stats")
      }

      const result = await res.json()
      console.log("📈 TIMELINE STATS:", result)

      if (!result.data || !Array.isArray(result.data)) {
        // Even with no data, show empty axis
        setData(mergeWithFullAxis([], range))
      } else {
        // Merge API data with full axis
        setData(mergeWithFullAxis(result.data, range))
        setType(result.type)
      }
    } catch (err) {
      console.error("Timeline fetch failed:", err)
      setData(mergeWithFullAxis([], range))
    } finally {
      setLoading(false)
    }
  }, [range])

  /* ================= INITIAL + RANGE CHANGE ================= */
  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline])

  /* ================= LIVE SOCKET UPDATE ================= */
  useEffect(() => {
    const handleLiveUpdate = () => {
      console.log("📈 Timeline LIVE update")
      fetchTimeline()
    }

    socket.on("detection:new", handleLiveUpdate)

    return () => {
      socket.off("detection:new", handleLiveUpdate)
    }
  }, [fetchTimeline])

  // Dynamic Title
  const getTitle = () => {
    if (type === "components") return "Components Detected Timeline"
    return "Products Detected Timeline"
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-900 mb-6">
        {getTitle()}
      </h3>

      <div className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Loading timeline...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            No data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#000000"
                strokeWidth={2}
                dot={{
                  r: 4,
                  stroke: "#000000",
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
                activeDot={{
                  r: 6,
                  stroke: "#000000",
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
                animationDuration={900}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default DetectionChart
