import express from "express";
import cors from "cors"
import uploadRoutes from "./routes/upload.routes"
import authROutes from "./routes/auth.routes"
import TripRoutes from "./routes/trip.routes"
import { connectDB } from "./config/db";
import dotenv from "dotenv"

const app = express()
const PORT = process.env.PORT || 5000
dotenv.config()
connectDB()
app.use(cors())
app.use(express.json());
app.use('/api', uploadRoutes)
app.use("/api/auth",authROutes);
app.use("/api/trips",TripRoutes)






app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
});