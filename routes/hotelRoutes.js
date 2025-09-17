// routes/hotelRoutes.js
import express from "express";
import { 
  createHotel, 
  getAllHotels, 
  getHotelById, 
  getMyHotels,
  updateHotel, 
  deleteHotel 
} from "../controllers/hotelController.js";
import { requireAuth, requireAdmin, requireHotelOwnerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Corrected routes - removed duplicate "/hotels" prefix
router.post("/", requireAuth, requireHotelOwnerOrAdmin, createHotel);
router.get("/", getAllHotels); // GET /api/hotels
router.get("/my-hotels", requireAuth, requireHotelOwnerOrAdmin, getMyHotels); // GET /api/hotels/my-hotels
router.get("/:id", getHotelById); // GET /api/hotels/:id
router.put("/:id", requireAuth, updateHotel); // PUT /api/hotels/:id
router.delete("/:id", requireAuth, deleteHotel); // DELETE /api/hotels/:id

export default router;