
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js"; 
import bookingRoutes from "./routes/bookingRoutes.js";

import mailRoutes from "./routes/mail.js"; 

import dotenv from "dotenv";
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Allow local development and deployed site
const allowedOrigins = [
  "http://localhost:3000",
  "https://innsight-vite-deploy.vercel.app",
  "https://innsight-vite-deploy-yoonus-projects-26429515.vercel.app"
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelRoutes); 
app.use("/api/bookings", bookingRoutes);
app.use('/api/',mailRoutes);



// Health check
app.get("/", (req, res) => res.send("Backend running ✅"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
