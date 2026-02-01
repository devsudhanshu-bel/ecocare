const mongoose = require("mongoose")
const Detection = require("../models/Detection.model")
require("dotenv").config()

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI)

  const detections = await Detection.find()

  for (const d of detections) {
    await Detection.updateOne(
      { _id: d._id },
      {
        $set: {
          metals: d.metals || [],
          semiconductors: d.semiconductors || [],
          battery_materials: d.battery_materials || []
        }
      }
    )
  }

  console.log("Migration completed")
  process.exit()
}

migrate()
