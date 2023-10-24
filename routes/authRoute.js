import express from "express";
import { User } from "../models/Uesr.js";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ messaeg: "All fields are required" });
    }

    const foundUser = await User.findOne({ email }).exec();

    if (foundUser) {
      return res.status(401).json({ message: "User already exists" });
    }

    const hashedPassword = await bycrpt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: user._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        UserInfo: {
          id: user._id,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const foundUser = await User.findOne({ email }).exec();

    if (!foundUser) {
      return res.status(401).json({ message: "User not exist" });
    }

    const match = await bycrpt.compare(password, foundUser.password);

    if (!match) {
      return res.status(405).json({ message: "Wrorng password" });
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser._id,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken,
      email: foundUser.email,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/refresh", (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const refreshToken = cookies.jwt;

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Forbidden" });
        }

        const foundUser = await User.findById(decoded.UserInfo.id).exec();

        if (!foundUser) {
          return res.status(400).json({ message: "Unauthorized" });
        }

        const accessToken = jwt.sign(
          {
            UserIndo: {
              id: foundUser._id,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );

        res.status(200).json(accessToken);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.post("/logout", (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.sendStatus(204);
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ message: "cookie cleared" });
  } catch (error) {
    console.log(error);
  }
});

export default router;
