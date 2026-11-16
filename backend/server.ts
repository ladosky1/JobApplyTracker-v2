import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use("/api/opportunities", opportunityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        startReminderScheduler();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exitCode = 1;
    }
};

void startServer();