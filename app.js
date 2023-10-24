import env from "dotenv";
import express from "express";
import { connectDb } from "./config/dbConnect.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsOptions } from "./config/corsOptions.js";
import { fileURLToPath } from "url"; // Import the 'fileURLToPath' function
import path from "path";
import MainRoot from "./routes/root.js";
import AuthRoute from "./routes/authRoute.js";
import AllUsers from "./routes/usersRoute.js";

const __filename = fileURLToPath(import.meta.url); // Get the current module's filename
const __dirname = path.dirname(__filename); // Get the current module's directory name

const dotenv = env.config();
const port = process.env.PORT || 5000;
const app = express();
connectDb();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", MainRoot);
app.use("/", AuthRoute);
app.use("/", AllUsers);

app.use("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "./views/404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

mongoose.connection.once("open", () => {
  console.log(`Database connected`);
  app.listen(port, () => {
    console.log(`Server is listenning at ${port}`);
  });
});

mongoose.connection.on("error", (error) => {
  console.log(`Error From Databse: ${error}`);
});
