import { useEffect, useState, useCallback } from "react"
import socket from "../socket"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

function TopMaterialsChart({ range }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  /* ================= FETCH (STABLE) ================= */
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `http://localhost:5000/api/dashboard/materials?range=${range}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch materials")
      }

      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("❌ MATERIALS FETCH ERROR:", err)
    } finally {
      setLoading(false)
    }
  }, [range])

  /* ================= INITIAL + RANGE CHANGE ================= */
  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  /* ================= LIVE SOCKET UPDATE ================= */
  useEffect(() => {
    const handleLiveUpdate = payload => {
      console.log("📊 TopMaterials LIVE update", payload)
      fetchMaterials()
    }

    // Attach listener
    socket.on("detection:new", handleLiveUpdate)

    // Cleanup
    return () => {
      socket.off("detection:new", handleLiveUpdate)
    }
  }, [fetchMaterials])

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-[360px] flex flex-col">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Top Detected Materials
      </h3>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          Loading chart…
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No data for this range
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />

              <Bar
                dataKey="value"
                fill="#000000"
                radius={[4, 4, 0, 0]}
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default TopMaterialsChart
