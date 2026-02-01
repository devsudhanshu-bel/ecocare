import { useEffect, useRef, useState } from "react"

function StatCard({ title, value, subtext }) {
  const [displayValue, setDisplayValue] = useState("0")
  const rafRef = useRef(null)

  useEffect(() => {
    // Ignore transient empty values during fetch
    if (value === undefined || value === null) return

    // Handle placeholder
    if (value === "--") {
      setDisplayValue("--")
      return
    }

    // Extract number + suffix
    const match = value.match(/([\d.]+)/)
    if (!match) {
      setDisplayValue(value)
      return
    }

    const number = parseFloat(match[1])
    const suffix = value.replace(match[1], "")

    // Stop any previous animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    const duration = 500 // fast & smooth
    const startTime = performance.now()

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)

      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * number)

      setDisplayValue(`${current}${suffix}`)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(`${number}${suffix}`)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value]) // 🔑 reacts to LIVE socket updates automatically

  return (
    <div className="
      bg-white border border-gray-200 rounded-xl p-6 shadow-sm
      transition-all duration-500 ease-out
      animate-[slideUp_0.8s_ease-out]
      hover:-translate-y-1 hover:shadow-md
    ">
      <p className="text-sm font-medium text-gray-900">{title}</p>

      <p className="mt-3 text-4xl font-semibold text-black tabular-nums">
        {displayValue}
      </p>

      <p className="mt-2 text-sm text-gray-500">{subtext}</p>
    </div>
  )
}

export default StatCard
