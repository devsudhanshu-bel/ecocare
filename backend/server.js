require("dotenv").config()
const http = require("http")
const { Server } = require("socket.io")

const app = require("./app")
const connectDB = require("./config/db")

// Connect to MongoDB
connectDB()

// Create HTTP server from Express app
const server = http.createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // change in production
    methods: ["GET", "POST"],
  },
})

// Attach io to express app (recommended pattern)
app.set("io", io)

// Socket connection listener
io.on("connection", socket => {
  console.log("Client connected:", socket.id)

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
