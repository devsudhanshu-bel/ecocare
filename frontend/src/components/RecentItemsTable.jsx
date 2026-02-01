import { useEffect, useState, useCallback } from "react"
import socket from "../socket" // ✅ shared socket instance

function RecentItemsTable({ range }) {
  const [items, setItems] = useState([])
  const [animate, setAnimate] = useState(false)
  const [loading, setLoading] = useState(true)

  /* ================= FETCH FUNCTION (STABLE) ================= */
  const fetchRecent = useCallback(async () => {
    try {
      setLoading(true)
      setAnimate(false)

      const res = await fetch(
        `http://localhost:5000/api/dashboard/recent?range=${range}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch recent items")
      }

      const data = await res.json()
      setItems(data)

      // trigger animation after render
      setTimeout(() => setAnimate(true), 120)
    } catch (err) {
      console.error("❌ RECENT FETCH ERROR:", err)
    } finally {
      setLoading(false)
    }
  }, [range])

  /* ================= INITIAL + RANGE CHANGE ================= */
  useEffect(() => {
    fetchRecent()
  }, [fetchRecent])

  /* ================= LIVE SOCKET UPDATE ================= */
  useEffect(() => {
    const handleLiveUpdate = payload => {
      console.log("📥 RecentItems LIVE update", payload)
      fetchRecent()
    }

    socket.on("detection:new", handleLiveUpdate)

    return () => {
      socket.off("detection:new", handleLiveUpdate)
    }
  }, [fetchRecent])

  return (
    <div
      className="
        bg-white border border-gray-200 rounded-xl p-6 shadow-sm
        transition-all duration-500 ease-out
        animate-[slideUp_0.5s_ease-out]
        hover:-translate-y-1 hover:shadow-md
        h-[360px] flex flex-col
      "
    >
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Recent Items Detected
      </h3>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 font-medium">Source</th>
              <th className="pb-2 font-medium text-right">Timestamp</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan="2" className="py-4 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan="2" className="py-4 text-center text-gray-400">
                  No detections for this range
                </td>
              </tr>
            )}

            {items.map((item, i) => (
              <tr
                key={item._id}
                className={`
                  transition-all duration-500 ease-out
                  ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                  hover:bg-gray-50
                `}
                style={{ transitionDelay: `${i * 60 + 120}ms` }}
              >
                <td className="py-2 text-gray-800">
                  {item.brand} {item.model_or_series}
                  <span className="ml-2 text-xs text-gray-400">
                    ({item.product_type})
                  </span>
                </td>
                <td className="py-2 text-right text-gray-600">
                  {new Date(item.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentItemsTable
