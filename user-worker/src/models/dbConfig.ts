import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from the .env file

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI as string;

    if (!dbURI) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }

    await mongoose.connect(dbURI); // No need for useNewUrlParser or useUnifiedTopology
    console.log('MongoDB connected successfully ........');
  } catch (error: any) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
