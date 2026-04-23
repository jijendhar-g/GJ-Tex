import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Failed: ${error.message}`);
        console.error(`Server will continue running but database features won't work.`);
        console.error(`Please start MongoDB or update MONGO_URI in .env file.`);
    }
};

export default connectDB;
