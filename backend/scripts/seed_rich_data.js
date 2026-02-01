const mongoose = require("mongoose");
const Detection = require("../models/Detection.model");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const seedRichData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Read products_data.json
        const jsonPath = path.join(__dirname, "../../frontend/src/assets/products_data.json");
        const rawData = fs.readFileSync(jsonPath, "utf-8");
        const productsData = JSON.parse(rawData);

        if (!Array.isArray(productsData.samples)) {
            throw new Error("Invalid products_data.json structure");
        }

        // Transform to DB Schema
        const newDetections = productsData.samples.map(item => ({
            product_type: item.device_category || "Unknown",
            brand: item.brand,
            model_or_series: item.model_or_series,
            // Map minerals object to arrays for DB schema
            metals: item.minerals_present?.metals || [],
            semiconductors: item.minerals_present?.semiconductors || [],
            battery_materials: item.minerals_present?.battery_materials || [],
            structural_materials: item.minerals_present?.structural_materials || [],
            confidence: (item.confidence || 0) * 100, // Convert 0.9 to 90
            image: item.image, // Uses local path like "/products_dummy/..."
            createdAt: new Date()
        }));

        // Clear ALL existing data to reset to clean demo state
        await Detection.deleteMany({});
        console.log("Cleared all existing detections");

        // Insert new data
        await Detection.insertMany(newDetections);
        console.log(`Seeded ${newDetections.length} demo items from JSON`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedRichData();
