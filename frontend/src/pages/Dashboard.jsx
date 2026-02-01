import { useEffect, useState } from "react"

import Header from "../components/Header"
import FilterBar from "../components/FilterBar"
import StatCard from "../components/StatCard"
import DetectionChart from "../components/DetectionChart"
import AlertsBox from "../components/AlertsBox"
import RecentItemsTable from "../components/RecentItemsTable"
import TopMaterialsChart from "../components/TopMaterialsChart"

// ✅ single socket + connect helper
import socket, { connectSocket } from "../socket"

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // global time filter
  const [timeRange, setTimeRange] = useState("today")

  /* ================= SOCKET CONNECT (ONCE) ================= */
  useEffect(() => {
    connectSocket()

    return () => {
      socket.off() // cleanup listeners on unmount
    }
  }, [])

  /* ================= FETCH STATS ================= */
  const fetchStats = async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `http://localhost:5000/api/dashboard/stats?range=${timeRange}`
      )
      const data = await res.json()

      setStats(data)
    } catch (err) {
      console.error("STATS FETCH ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= INITIAL + FILTER CHANGE ================= */
  useEffect(() => {
    fetchStats()
  }, [timeRange])

  /* ================= LIVE SOCKET UPDATES ================= */
  useEffect(() => {
    const handleLiveUpdate = payload => {
      console.log("🔥 detection:new received", payload)
      fetchStats()
    }

    socket.on("detection:new", handleLiveUpdate)

    return () => {
      socket.off("detection:new", handleLiveUpdate)
    }
  }, [timeRange])

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* HEADER */}
        <Header />

        {/* FILTER BAR */}
        <div className="mt-4">
          <FilterBar onTimeChange={setTimeRange} />
        </div>

        {/* STATS */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading || !stats ? (
            <>
              <StatCard title="Detection Rate" value="--" subtext="Loading..." />
              <StatCard title="Total Items Analysed" value="--" subtext="Loading..." />
              <StatCard title="Error / Unknown Items" value="--" subtext="Loading..." />
            </>
          ) : (
            <>
              <StatCard
                title="Detection Rate"
                value={stats.detectionRate.value}
                subtext="For selected range"
              />
              <StatCard
                title="Total Items Analysed"
                value={String(stats.totalItems.value)}
                subtext="For selected range"
              />
              <StatCard
                title="Error / Unknown Items"
                value={String(stats.errorItems.value)}
                subtext="For selected range"
              />
            </>
          )}
        </div>

        {/* CHART + ALERTS */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[380px]">
            <DetectionChart range={timeRange} />
          </div>

          <div className="h-[380px]">
            <AlertsBox range={timeRange} />
          </div>
        </div>

        {/* TABLES */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[360px] overflow-hidden">
            <RecentItemsTable range={timeRange} />
          </div>

          <div className="h-[360px] overflow-hidden">
            <TopMaterialsChart range={timeRange} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
