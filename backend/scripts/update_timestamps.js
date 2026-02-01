const mongoose = require("mongoose");
const Detection = require("../models/Detection.model");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const updateTimestamps = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const items = await Detection.find({}).sort({ brand: 1 });

        const now = new Date();

        // Define different time periods
        const today = new Date();

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);

        // Distribute items across time periods
        const timestamps = [
            today,       // Item 0 - Today
            today,       // Item 1 - Today
            yesterday,   // Item 2 - Yesterday
            lastWeek,    // Item 3 - Last week (still this month)
            lastWeek,    // Item 4 - Last week
            lastMonth,   // Item 5 - Last month
            lastMonth,   // Item 6 - Last month
            lastYear,    // Item 7 - Last year
            lastYear,    // Item 8 - Last year
            lastYear,    // Item 9 - Last year
        ];

        for (let i = 0; i < items.length; i++) {
            await Detection.updateOne(
                { _id: items[i]._id },
                { $set: { createdAt: timestamps[i] || today } }
            );
            console.log(`Updated ${items[i].brand} ${items[i].model_or_series} -> ${timestamps[i].toISOString().split('T')[0]}`);
        }

        console.log("\n✅ Timestamps updated successfully!");
        console.log("Now filters will show different data:");
        console.log("  - Today: 2 items");
        console.log("  - Month: 5 items (today + yesterday + last week)");
        console.log("  - Year: 7 items (month + last month items)");
        console.log("  - Lifetime: 10 items (all)");

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateTimestamps();
