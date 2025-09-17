// controllers/hotelController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createHotel = async (req, res) => {
  const { title, location, price, imageUrl, rating, bestSeller, description } = req.body;
  const createdBy = req.user?.userId;

  if (!createdBy) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const hotel = await prisma.hotel.create({
      data: {
        title,
        location,
        price: parseFloat(price),
        imageUrl,
        rating: parseFloat(rating),
        bestSeller: bestSeller ?? false,
        description: description || "",
        createdBy,
      },
    });
    res.status(201).json(hotel);
  } catch (err) {
    console.error("Error creating hotel:", err);
    res.status(500).json({ error: "Failed to create hotel" });
  }
};

export const getAllHotels = async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    res.json(hotels);
  } catch (err) {
    console.error("Error fetching hotels:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getHotelById = async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.json(hotel);
  } catch (err) {
    console.error("Error fetching hotel:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getMyHotels = async (req, res) => {
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const hotels = await prisma.hotel.findMany({
      where: { createdBy: userId },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });
    res.json(hotels);
  } catch (err) {
    console.error("Error fetching user hotels:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateHotel = async (req, res) => {
  const { id } = req.params;
  const { title, location, price, imageUrl, rating, bestSeller, description } = req.body;
  const userId = req.user?.userId;

  try {
    // Check if hotel exists and user has permission
    const existingHotel = await prisma.hotel.findUnique({ where: { id } });
    if (!existingHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Check if user is admin or the hotel owner
    if (req.user.role !== "admin" && existingHotel.createdBy !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update the hotel
    const updatedHotel = await prisma.hotel.update({
      where: { id },
      data: {
        title,
        location,
        price: price !== undefined ? parseFloat(price) : undefined,
        imageUrl,
        rating: rating !== undefined ? parseFloat(rating) : undefined,
        bestSeller: bestSeller ?? existingHotel.bestSeller,
        description: description !== undefined ? description : existingHotel.description,
      },
    });

    res.json(updatedHotel);
  } catch (err) {
    console.error("Error updating hotel:", err);
    res.status(500).json({ error: "Failed to update hotel" });
  }
};

export const deleteHotel = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    // Check if hotel exists and user has permission
    const existingHotel = await prisma.hotel.findUnique({ where: { id } });
    if (!existingHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Check if user is admin or the hotel owner
    if (req.user.role !== "admin" && existingHotel.createdBy !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.hotel.delete({ where: { id } });
    res.json({ message: "Hotel deleted" });
  } catch (err) {
    console.error("Error deleting hotel:", err);
    res.status(500).json({ error: "Failed to delete hotel" });
  }
};