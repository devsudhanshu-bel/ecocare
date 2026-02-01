import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Header from "../components/Header"
import FilterBar from "../components/FilterBar"
import { getHistory } from "../api/dashboard"
import socket from "../socket"

function DetectionHistory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get("search") || ""

  const [productFilter, setProductFilter] = useState("All Devices")

  /* ================= FETCH DATA (INITIAL + FILTER/SEARCH) ================= */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch from Backend
        const data = await getHistory({
          type: productFilter,
          search: searchQuery
        })

        if (data) {
          setProducts(data)
        }
      } catch (err) {
        console.error("History fetch error:", err)
        setError("Failed to load history")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productFilter, searchQuery])

  /* ================= REAL-TIME UPDATES ================= */
  useEffect(() => {
    const handleNewDetection = (newItem) => {
      // Only prepend if it matches current filter (basic client-side check)
      // If filter is specific, we might skip. But "All Devices" is default.

      const matchType = productFilter === "All Devices" || newItem.product_type === productFilter

      // Basic search match (case-insensitive)
      let matchSearch = true
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const text = (newItem.brand + " " + newItem.model_or_series + " " + newItem.product_type).toLowerCase()
        matchSearch = text.includes(q)
      }

      if (matchType && matchSearch) {
        setProducts(prev => [newItem, ...prev])
      }
    }

    socket.on("detection:new", handleNewDetection)

    return () => {
      socket.off("detection:new", handleNewDetection)
    }
  }, [productFilter, searchQuery])

  return (
    <div className="min-h-screen bg-white pb-12 animate-fadeIn">

      {/* HEADER */}
      <Header />

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-4">
        <FilterBar onProductChange={setProductFilter} />
      </div>

      {/* PAGE CONTENT */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-10">

        {/* HEADING / SEARCH RESULT INFO */}
        {searchQuery && (
          <div className="mb-6 text-gray-600">
            Results for <span className="font-semibold">"{searchQuery}"</span>
            {products.length === 0 && !loading && " (No matches found)"}
          </div>
        )}

        {/* LOADING / ERROR */}
        {loading && <div className="text-center text-gray-500 mt-20">Loading...</div>}
        {error && <div className="text-center text-red-500 mt-20">{error}</div>}

        {/* EMPTY STATE */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            No detected items available.
          </div>
        )}

        {/* GRID */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((item) => (
              <div
                key={item._id || item.id}
                className="bg-white border rounded-xl shadow-sm hover:shadow-md transition hover:scale-[1.02]"
              >
                {/* IMAGE */}
                <div className="h-44 bg-gray-100 rounded-t-xl flex items-center justify-center relative">
                  {/* Fallback items often have 'id' not '_id'. API items have '_id'. */}
                  {/* Optional: Add a badge if it's from fallback/local data */}
                  {!item._id && (
                    <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded-full">
                      Catalog
                    </span>
                  )}

                  <img
                    src={item.image || "/placeholder.png"}
                    alt={`${item.brand} ${item.model_or_series}`}
                    className="h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png"
                    }}
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4">

                  {/* TITLE */}
                  <div className="mb-3">
                    <h2 className="font-semibold text-gray-900">
                      {item.brand} {item.model_or_series}
                    </h2>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                      {item.product_type || item.device_category}
                    </span>
                  </div>

                  {/* SPECIFICATIONS (Only present in static data typically, unless we add to DB logic) */}
                  {item.visible_specs && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-800 mb-1">
                        Specifications
                      </h3>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Form Factor: {item.visible_specs.form_factor}</div>
                        <div>Material: {item.visible_specs.material}</div>
                      </div>
                    </div>
                  )}

                  {/* MATERIALS (Support both DB schema and Static schema) */}
                  <div className="mb-4">
                    {/* Database Schema uses arrays: metals, semiconductors etc */}
                    {item.metals && item.metals.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[11px] font-medium text-gray-700">Metals</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.metals.map((v, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-600 capitalize">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Static Schema uses minerals_present object */}
                    {item.minerals_present && Object.entries(item.minerals_present).map(
                      ([category, values]) =>
                        values.length > 0 && (
                          <div key={category} className="mb-2">
                            <p className="text-[11px] font-medium text-gray-700 capitalize">
                              {category.replace("_", " ")}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {values.map((v, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-600 capitalize"
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                    )}
                  </div>

                  {/* CONFIDENCE */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Confidence</span>
                      {/* Handle 0-1 range (static) vs 0-100 range (db) */}
                      <span>{item.confidence > 1 ? item.confidence : Math.round(item.confidence * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${(item.confidence > 1 ? item.confidence : item.confidence * 100) >= 85
                          ? "bg-green-500"
                          : (item.confidence > 1 ? item.confidence : item.confidence * 100) >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          }`}
                        style={{ width: `${item.confidence > 1 ? item.confidence : item.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default DetectionHistory
