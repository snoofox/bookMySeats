import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import initDB from "./config/init";
import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes"
import seatsRoutes from "./routes/seats.routes"

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL
}))

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/booking", bookingRoutes)
app.use("/seats", seatsRoutes)


app.listen(port, async () => {
    await initDB();
    console.log(`Server running at ${port}`);
});
