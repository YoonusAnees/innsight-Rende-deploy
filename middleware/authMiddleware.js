import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

// Verify JWT and attach user to req
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // decoded contains userId and role
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Check for admin role
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// Check for hotel owner or admin role
export const requireHotelOwnerOrAdmin = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "hotelOwner") {
    return res.status(403).json({ message: "Access denied. Hotel owners or admins only." });
  }
  next();
};

// Check for authenticated user (any role)
export const requireUser = (req, res, next) => {
  if (!req.user?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};