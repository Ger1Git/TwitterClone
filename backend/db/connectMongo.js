import mongoose from "mongoose";

const connectMongoDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error(`There was an error when trying to connect to MongoDB: ${error.message}`);
        process.exit(1);
    }
}

export default connectMongoDB;