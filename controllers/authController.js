import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register
export const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  
  // Validate role
  const validRoles = ["user", "admin", "hotelOwner"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        firstName, 
        lastName, 
        email, 
        password: hashedPassword, 
        role: role || "user" 
      },
    });

    res.status(201).json({ 
      message: "User registered", 
      user: { 
        id: user.id, 
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ 
      userId: user.id, 
      role: user.role 
    }, SECRET, { expiresIn: "1h" });

    res.json({ 
      message: "Login successful", 
      token, 
      user: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName,
        email: user.email,
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};