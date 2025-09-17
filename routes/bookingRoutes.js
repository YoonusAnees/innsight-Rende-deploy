// routes/bookingRoutes.js
import express from "express";
import { 
  createBooking, 
  getMyBookings, 
  getHotelBookings, 
  cancelBooking,
  getAllBookings
} from "../controllers/bookingController.js";
import { requireAuth, requireUser, requireAdmin } from "../middleware/authMiddleware.js"; // Add requireAdmin

const router = express.Router();

router.post("/", requireAuth, requireUser, createBooking);
router.get("/my-bookings", requireAuth, requireUser, getMyBookings);
router.get("/all-bookings", requireAuth, requireAdmin, getAllBookings); // Add this route
router.get("/hotel/:hotelId", requireAuth, getHotelBookings);
router.put("/:id/cancel", requireAuth, cancelBooking);

export default router;