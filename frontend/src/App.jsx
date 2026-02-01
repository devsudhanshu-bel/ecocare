import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import DetectionHistory from "./pages/DetectionHistory"
import Login from "./pages/Login"
import Signup from "./pages/Signup"   
import Settings from "./pages/Settings"


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<DetectionHistory />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
}

export default App
