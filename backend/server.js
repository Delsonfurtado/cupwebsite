import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import mysql from "mysql2/promise";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse incoming data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ensure the uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Setup Multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Setup MySQL connection
const db = await mysql.createConnection({
  host: "localhost",
  user: "root", // Or your created MySQL user
  password: "your_password", // Replace with your MySQL password
  database: "icym_cup",
});

// Create table if not exists
await db.execute(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(15),
    age INT,
    dob DATE,
    parish VARCHAR(100),
    denary VARCHAR(100),
    captain VARCHAR(100),
    message TEXT,
    aadhar_filename VARCHAR(255)
  )
`);

// Handle form submission
app.post("/submit", upload.single("aadhar"), async (req, res) => {
  const data = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Aadhar file missing" });
  }

  try {
    await db.execute(
      `INSERT INTO submissions (name, email, phone, age, dob, parish, denary, captain, message, aadhar_filename)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name || "",
        data.email || "",
        data.phone || "",
        parseInt(data.age) || null,
        data.dob || null,
        data.parish || "",
        data.denary || "",
        data.captain || "",
        data.message || "",
        file.filename,
      ]
    );

    res.json({ message: "Data saved to MySQL with image" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Error saving to database" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
