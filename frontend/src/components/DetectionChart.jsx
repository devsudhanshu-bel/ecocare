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
  const [loading, setLoading] = useState(true)

  /* ================= FETCH FUNCTION (STABLE) ================= */
  const fetchAccuracy = useCallback(async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `http://localhost:5000/api/dashboard/accuracy?range=${range}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch accuracy trend")
      }

      const result = await res.json()
      console.log("📈 ACCURACY TREND:", result)

      if (!Array.isArray(result) || result.length === 0) {
        setData([])
      } else {
        setData(result)
      }
    } catch (err) {
      console.error("Accuracy fetch failed:", err)
    } finally {
      setLoading(false)
    }
  }, [range])

  /* ================= INITIAL + RANGE CHANGE ================= */
  useEffect(() => {
    fetchAccuracy()
  }, [fetchAccuracy])

  /* ================= LIVE SOCKET UPDATE ================= */
  useEffect(() => {
    const handleLiveUpdate = () => {
      console.log("📈 Accuracy LIVE update")
      fetchAccuracy()
    }

    socket.on("detection:new", handleLiveUpdate)

    return () => {
      socket.off("detection:new", handleLiveUpdate)
    }
  }, [fetchAccuracy])

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-900 mb-6">
        Detection Accuracy Trend
      </h3>

      <div className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Loading accuracy trend...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            No accuracy data available
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
                domain={[0, 100]}
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
