import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
  } catch (error) {
    console.log(error);
  }
};
