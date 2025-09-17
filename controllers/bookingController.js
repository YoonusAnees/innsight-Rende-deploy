import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createBooking = async (req, res) => {
  const { hotelId, checkIn, checkOut, guests } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Calculate number of days and total price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = days * hotel.price;

    // Check for existing booking for the same dates
    const existingBooking = await prisma.booking.findFirst({
      where: {
        hotelId,
        OR: [
          {
            checkIn: { lte: checkOutDate },
            checkOut: { gte: checkInDate }
          }
        ]
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Hotel is already booked for these dates" });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        hotelId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: parseInt(guests),
        totalPrice
      },
      include: {
        hotel: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyBookings = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        hotel: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHotelBookings = async (req, res) => {
  const { hotelId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Check if user owns the hotel or is admin
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    if (req.user.role !== "admin" && hotel.createdBy !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookings = await prisma.booking.findMany({
      where: { hotelId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Check if booking exists and user has permission
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { hotel: true }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // User can cancel their own booking, hotel owner can cancel bookings for their hotel, admin can cancel any
    if (req.user.role !== "admin" && booking.userId !== userId && booking.hotel.createdBy !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" }
    });

    res.json({ message: "Booking cancelled", booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/bookingController.js - Add this new function
export const getAllBookings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        hotel: {
          select: {
            title: true,
            location: true,
            price: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ error: err.message });
  }
};