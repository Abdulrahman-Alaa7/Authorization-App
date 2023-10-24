import express from "express";
import { fileURLToPath } from "url"; // Import the 'fileURLToPath' function
import path from "path";

const __filename = fileURLToPath(import.meta.url); // Get the current module's filename
const __dirname = path.dirname(__filename); // Get the current module's directory name

const router = express.Router();

router.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../views/index.html"));
  } catch (error) {
    console.log(error);
  }
});

export default router;
