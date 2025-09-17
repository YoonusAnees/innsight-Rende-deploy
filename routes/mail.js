import express from "express";
import sendEmail from "../utils/email.js";

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields are required" 
    });
  }

  const result = await sendEmail({ name, email, subject, message });
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
});

export default router;