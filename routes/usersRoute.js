import express from "express";
import { User } from "../models/Uesr.js";
import { verifyJwT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJwT);

// Get All Users
router.get("/allusers", async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();

    if (!users.length) {
      return res.status(400).json({ messaeg: "No users found" });
    }
    res.status(201).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error);
  }
});

export default router;
