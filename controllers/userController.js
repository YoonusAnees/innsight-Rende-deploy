import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const createUser = async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const user = await prisma.user.create({
//       data: { name, email, password },
//     });
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



export const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || "user",
      },

    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName,lastName, email, role, password } = req.body;

  try {
    const updateData = {
      firstName,
      lastName,
      email,
      role,
    };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: "User updated",
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,

        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
