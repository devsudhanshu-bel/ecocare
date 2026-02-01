import { useEffect, useState, useCallback } from "react"
import socket from "../socket"
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline"

function AlertsBox({ range }) {
  const [animate, setAnimate] = useState(false)
  const [alerts, setAlerts] = useState(null)
  const [loading, setLoading] = useState(true)

  /* ================= FETCH ALERTS (STABLE) ================= */
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `http://localhost:5000/api/dashboard/alerts?range=${range}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch alerts")
      }

      const data = await res.json()
      setAlerts(data)
    } catch (err) {
      console.error("❌ ALERT FETCH ERROR:", err)
    } finally {
      setLoading(false)
    }
  }, [range])

  /* ================= RANGE CHANGE ================= */
  useEffect(() => {
    setAnimate(false)
    fetchAlerts()

    const t = setTimeout(() => setAnimate(true), 150)
    return () => clearTimeout(t)
  }, [fetchAlerts])

  /* ================= LIVE SOCKET UPDATE ================= */
  useEffect(() => {
    const handleLiveUpdate = payload => {
      console.log("🚨 Alerts LIVE update", payload)
      fetchAlerts()
    }

    socket.on("detection:new", handleLiveUpdate)

    return () => {
      socket.off("detection:new", handleLiveUpdate)
    }
  }, [fetchAlerts])

  return (
    <div
      className="
        bg-white border border-gray-200 rounded-xl p-6 shadow-sm
        h-full flex flex-col
        transition-all duration-500 ease-out
        animate-[slideUp_0.5s_ease-out]
        hover:-translate-y-1 hover:shadow-md
      "
    >
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Alerts & Notifications
      </h3>

      {loading && (
        <p className="text-sm text-gray-400">Loading alerts…</p>
      )}

      {!loading && alerts && (
        <ul className="space-y-4">

          {alerts.lowConfidence > 0 && (
            <li
              className={`flex items-center gap-3 transition-all duration-500
                ${animate ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}
              `}
            >
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-800">
                Low Confidence Detection ({alerts.lowConfidence})
              </span>
            </li>
          )}

          {alerts.repeatedScan > 0 && (
            <li
              className={`flex items-center gap-3 transition-all duration-500
                ${animate ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}
              `}
            >
              <ArrowPathIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-800">
                Repeated Scan Required ({alerts.repeatedScan})
              </span>
            </li>
          )}

          {alerts.unknown > 0 && (
            <li
              className={`flex items-center gap-3 transition-all duration-500
                ${animate ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}
              `}
            >
              <XCircleIcon className="h-5 w-5 text-black" />
              <span className="text-sm text-gray-800">
                Error / Unknown Item Detected ({alerts.unknown})
              </span>
            </li>
          )}

          {alerts.lowConfidence === 0 &&
            alerts.repeatedScan === 0 &&
            alerts.unknown === 0 && (
              <p className="text-sm text-gray-400">
                No active alerts 🎉
              </p>
            )}
        </ul>
      )}
    </div>
  )
}

export default AlertsBox
