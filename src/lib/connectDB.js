import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error('MONGO_URI not defined in environment variables');
}

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI);
    }

    cached.conn = await cached.promise;
    console.log('Connected to MongoDB');
    return cached.conn;
}

export default connectDB;
