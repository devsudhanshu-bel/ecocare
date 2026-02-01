import { io } from "socket.io-client"

// Create a SINGLE socket instance
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  autoConnect: false, // 🔑 prevent multiple connections
})

// Explicit connect function
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect()
  }
}

// Debug logs (keep for now)
socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id)
})

socket.on("disconnect", (reason) => {
  console.log("🔴 Socket disconnected:", reason)
})

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message)
})

export default socket
