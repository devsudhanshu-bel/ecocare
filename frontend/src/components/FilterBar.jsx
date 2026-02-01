import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

function FilterBar({ onTimeChange, onProductChange }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isHistoryPage = location.pathname === "/history"

  /* ================= TIME FILTER ================= */
  const timeOptions = ["Today", "Month", "Year", "Lifetime"]
  const [timeFilter, setTimeFilter] = useState("Today")
  const timeBtnRefs = useRef([])
  const [timeStyle, setTimeStyle] = useState({})

  /* ================= HISTORY FILTER ================= */
  const productOptions = [
    "All Devices",
    "Laptop",
    "Smartphone",
    "Tablet",
    "Smartwatch",
    "Earbuds",
    "Keyboard",
    "Mouse",
  ]

  const [productFilter, setProductFilter] = useState("All Devices")
  const [open, setOpen] = useState(false)

  /* ================= MODE FILTER ================= */
  const modeOptions = ["General", "History"]

  const resolveModeFromPath = () =>
    location.pathname === "/history" ? "History" : "General"

  const [mode, setMode] = useState(resolveModeFromPath)
  const modeBtnRefs = useRef([])
  const [modeStyle, setModeStyle] = useState({})

  /* ================= HELPERS ================= */
  const updateIndicator = (refs, value, options, setter) => {
    const index = options.indexOf(value)
    const btn = refs.current[index]
    if (!btn) return

    setter({
      width: btn.offsetWidth,
      height: btn.offsetHeight,
      left: btn.offsetLeft,
      top: btn.offsetTop,
    })
  }

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (!isHistoryPage) {
      updateIndicator(timeBtnRefs, timeFilter, timeOptions, setTimeStyle)
    }
  }, [timeFilter, isHistoryPage])

  useEffect(() => {
    updateIndicator(modeBtnRefs, mode, modeOptions, setModeStyle)
  }, [mode])

  useEffect(() => {
    setMode(resolveModeFromPath())
  }, [location.pathname])

  /* ================= HANDLERS ================= */
  const handleTimeChange = (option) => {
    setTimeFilter(option)
    onTimeChange?.(option.toLowerCase())
  }

  const handleModeChange = (option) => {
    setMode(option)
    if (option === "General") navigate("/")
    if (option === "History") navigate("/history")
  }

  /* ================= TITLE ================= */
  const pageTitle = isHistoryPage ? "Detection History" : "Dashboard"

  /* ================= UI ================= */
  return (
    <div className="w-full h-16 flex items-center bg-white px-6">

      {/* LEFT GROUP */}
      <div className="flex items-center gap-6">

        {/* TIME FILTER (Dashboard only) */}
        {!isHistoryPage && (
          <>
            <div className="relative flex bg-gray-100 rounded-lg p-1">
              <div
                className="absolute bg-white rounded-md shadow transition-all duration-300"
                style={timeStyle}
              />

              {timeOptions.map((option, i) => (
                <button
                  key={option}
                  ref={(el) => (timeBtnRefs.current[i] = el)}
                  onClick={() => handleTimeChange(option)}
                  className={`relative z-10 px-4 py-1.5 text-sm rounded-md transition-colors
                    ${timeFilter === option ? "text-black" : "text-gray-500"}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>

            <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">
              {pageTitle}
            </h2>
          </>
        )}

        {/* HISTORY FILTER */}
        {isHistoryPage && (
          <>
            <div className="relative">
              <span className="text-xs text-gray-500 block mb-1">
                Filter by
              </span>

              <button
                onClick={() => setOpen(!open)}
                className="w-[240px] flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-800"
              >
                {productFilter}
                <span className="text-gray-400">▾</span>
              </button>

              {open && (
                <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg">
                  {productOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setProductFilter(option)
                        if (onProductChange) onProductChange(option)
                        setOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${productFilter === option
                        ? "font-medium text-black"
                        : "text-gray-600"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-gray-900 mt-5 whitespace-nowrap">
              Detection History
            </h2>
          </>
        )}
      </div>

      {/* RIGHT — MODE FILTER */}
      <div className="relative flex bg-gray-100 rounded-lg p-1 ml-auto">
        <div
          className="absolute bg-white rounded-md shadow transition-all duration-300"
          style={modeStyle}
        />

        {modeOptions.map((option, i) => (
          <button
            key={option}
            ref={(el) => (modeBtnRefs.current[i] = el)}
            onClick={() => handleModeChange(option)}
            className={`relative z-10 px-5 py-1.5 text-sm rounded-md transition-colors
              ${mode === option ? "text-black" : "text-gray-500"}
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FilterBar
