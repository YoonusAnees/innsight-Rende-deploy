
import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js"; // Make sure this path is correct
import bookingRoutes from "./routes/bookingRoutes.js";

import mailRoutes from "./routes/mail.js"; 

import dotenv from "dotenv";
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelRoutes); // This should work for /api/hotels and /api/hotels/my-hotels
app.use("/api/bookings", bookingRoutes);
app.use('/api/',mailRoutes);



// Health check
app.get("/", (req, res) => res.send("Backend running ✅"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
