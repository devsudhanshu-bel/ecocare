const mongoose = require("mongoose");
const Detection = require("../models/Detection.model");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // clear existing (optional, maybe safe to keep to see volume)
        // await Detection.deleteMany({}); 

        const today = new Date();

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const oldDate = new Date("2023-01-01");

        const detections = [
            { product_type: "Bottle", brand: "Test", model_or_series: "A", createdAt: today, image: "https://placehold.co/200?text=Bottle" },
            { product_type: "Can", brand: "Test", model_or_series: "B", createdAt: today, image: "https://placehold.co/200?text=Can" },
            { product_type: "Unknown", brand: "Test", model_or_series: "C", createdAt: today, image: "" }, // Error item

            { product_type: "Paper", brand: "Test", model_or_series: "D", createdAt: yesterday, image: "https://placehold.co/200?text=Paper" },

            { product_type: "Plastic", brand: "Test", model_or_series: "E", createdAt: lastMonth, image: "https://placehold.co/200?text=Plastic" },

            { product_type: "Glass", brand: "Test", model_or_series: "F", createdAt: oldDate, image: "https://placehold.co/200?text=Glass" },
        ];

        await Detection.insertMany(detections);
        console.log("Seeded test data");

        // Test Queries manually to simulate controller
        const counts = {
            today: await Detection.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lte: new Date(new Date().setHours(23, 59, 59, 999)) } }),
            all: await Detection.countDocuments({})
        };

        console.log("Manual DB Counts:", counts);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
