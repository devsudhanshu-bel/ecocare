const mongoose = require("mongoose");
const Detection = require("../models/Detection.model");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const cleanupDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Delete all items that have no image (empty string, null, or missing)
        const result = await Detection.deleteMany({
            $or: [
                { image: "" },
                { image: { $exists: false } },
                { image: null }
            ]
        });

        console.log("Deleted " + result.deletedCount + " items without images");

        // Show remaining items
        const remaining = await Detection.find({}, "brand model_or_series product_type image");
        console.log("Remaining " + remaining.length + " items:");
        remaining.forEach(item => {
            console.log(`  - ${item.brand} ${item.model_or_series} (${item.product_type}) - Image: ${item.image ? "YES" : "NO"}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

cleanupDB();
