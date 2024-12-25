
import upload from "../fileshr/fileShare.js";
import express from 'express'

const aps = express();


aps.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;
  
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      const fileMessage = {
        senderId,
        receiverId,
        text: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`, // File path
        fileType: req.file.mimetype,
      };
  
      // Save file metadata as a message
      const newMessage1 = new Message(fileMessage);
      await newMessage1.save();
  
      res.status(201).json(newMessage1);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });
  
  // Serve static files
  aps.use("/uploads", express.static(path.join(__dirname, "uploads")));