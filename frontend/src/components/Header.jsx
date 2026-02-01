import { ArrowPathIcon, MagnifyingGlassIcon, ShareIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import html2canvas from "html2canvas"
import logo from "../assets/logo.png"
import profilePlaceholder from "../assets/profile.jpg"
import { useState, useRef, useEffect } from "react"
import { getUserProfile } from "../api/user"

function Header({ onRefresh, variant = "default" }) {
  const [refreshing, setRefreshing] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [userImage, setUserImage] = useState(profilePlaceholder)

  const navigate = useNavigate()
  const profileRef = useRef(null)
  const shareRef = useRef(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getUserProfile()
        if (data.image) {
          setUserImage(data.image)
        }
      } catch (err) {
        console.error("Header profile fetch error:", err)
      }
    }
    fetchUser()
  }, [])

  /* ---------------- Refresh ---------------- */
  const handleRefreshClick = () => {
    if (refreshing) return
    setRefreshing(true)
    onRefresh?.()
    setTimeout(() => setRefreshing(false), 800)
  }

  /* ---------------- Screenshot ---------------- */
  const captureDashboard = async () => {
    const target = document.getElementById("dashboard-capture")
    if (!target) throw new Error("Capture target not found")

    return await html2canvas(target, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    })
  }

  const handleDownload = async () => {
    const canvas = await captureDashboard()
    const link = document.createElement("a")
    link.download = "dashboard.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
    setShareOpen(false)
  }

  const handleCopy = async () => {
    const canvas = await captureDashboard()
    const blob = await new Promise((res) => canvas.toBlob(res))
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ])
    setShareOpen(false)
  }

  const handleShare = async () => {
    const canvas = await captureDashboard()
    const blob = await new Promise((res) => canvas.toBlob(res))
    const file = new File([blob], "dashboard.png", { type: "image/png" })

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Dashboard Snapshot",
      })
    } else {
      alert("System sharing not supported on this device")
    }
    setShareOpen(false)
  }

  /* ---------------- Outside Click ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) setProfileOpen(false)

      if (
        shareRef.current &&
        !shareRef.current.contains(e.target)
      ) setShareOpen(false)
    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <header className="h-16 w-full bg-white border-b border-gray-200 relative z-50">
      <div className="h-full flex items-center px-6">

        {/* LEFT */}
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-14" />
          <p className="ml-3 text-lg font-semibold text-gray-800">
            Dashboard App
          </p>
        </div>

        {/* CENTER */}
        <div className="absolute left-1/2 -translate-x-1/2">
          {variant === "settings" ? (
            <button
              onClick={() => navigate("/")}
              className="px-4 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              ← Back to Dashboard
            </button>
          ) : (
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-80 text-sm border border-gray-300 rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // Navigate to history with search query
                    const query = e.target.value.trim()
                    if (query) {
                      navigate(`/history?search=${encodeURIComponent(query)}`)
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-4">

          {/* Refresh */}
          <button
            onClick={handleRefreshClick}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200"
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

          {/* Share */}
          <div className="relative" ref={shareRef}>
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 flex items-center gap-2"
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </button>

            {shareOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-200 rounded-lg shadow-lg animate-[blockUp_0.2s_ease-out]">
                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Download image
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Copy to clipboard
                </button>
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Share via apps
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                src={userImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-gray-500">▾</span>
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-200 rounded-lg shadow-lg animate-[blockUp_0.2s_ease-out]">
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Settings
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header
