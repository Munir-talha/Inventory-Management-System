import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { username, password } = body;

        const user = await User.findOne({ username });
        const users = await User.find({});
        console.log('All Users: ', users);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid username' }, { status: 401 });
        }

        if (user.password !== password) {
            return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
        }

        return NextResponse.json({ success: true, message: 'Login successful' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
