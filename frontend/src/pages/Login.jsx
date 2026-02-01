import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"
import { login } from "../api/auth"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login({ email, password })
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  // helper for stagger
  const block = (delay) => ({
    animation: "blockUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
    animationDelay: delay,
    opacity: 0,
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm px-6">

        {/* LOGO */}
        <div style={block("0ms")} className="text-center">
          <img src={logo} alt="EcoCare" className="mx-auto h-40 mb-3" />
        </div>

        {/* TITLE */}
        <div style={block("120ms")} className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to continue to EcoCare
          </p>
        </div>

        {/* FORM */}
        <div style={block("240ms")}>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <input
              type="email"
              required
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full px-4 py-2 text-sm
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-1 focus:ring-black
              "
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full px-4 py-2 text-sm
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-1 focus:ring-black
              "
            />

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-2 rounded-lg
                bg-black text-white text-sm font-medium
                hover:bg-gray-800
                active:scale-95
                transition
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? "Signing in..." : "Sign in with email"}
            </button>
          </form>
        </div>

        {/* DIVIDER */}
        <div style={block("360ms")}>
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-xs text-gray-400">
              or continue with
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>

        {/* GOOGLE */}
        <div style={block("480ms")}>
          <button
            type="button"
            className="
              w-full py-2 rounded-lg
              bg-gray-100 text-sm font-medium
              flex items-center justify-center gap-2
              hover:bg-gray-200
              active:scale-95
              transition
            "
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-4 w-4"
            />
            Google
          </button>
        </div>

        {/* SIGNUP */}
        <div style={block("600ms")}>
          <p className="mt-6 text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-black font-medium cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </div>

        {/* FOOTER */}
        <div style={block("720ms")}>
          <p className="mt-4 text-xs text-gray-500 text-center">
            By continuing, you agree to our{" "}
            <span className="text-gray-900 font-medium cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-gray-900 font-medium cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login
