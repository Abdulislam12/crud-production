import { NextResponse } from "next/server"
import connect from "@/lib/db"
import User from "@/lib/modals/user";
export const GET = async () => {
    try {
        await connect();
        const users = await User.find()
        return new NextResponse(JSON.stringify(users), { status: 200 })
    } catch (error) {
        return new NextResponse("Error in fetching users" + error.message, { status: 500 })
    }
}

export const POST = async (request) => {
    try {
        const { email, username, password } = await request.json();

        // Basic validation using `.some()` to check for missing fields
        const fields = [email, username, password];
        const missing = ["email", "username", "password"].some((field, i) => !fields[i]);

        if (missing) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        await connect();

        // Optional: check if user already exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            return new NextResponse("Username or Email is already taken", { status: 409 });
        }

        const newUser = new User({ email, username, password });
        await newUser.save();

        return new NextResponse(
            JSON.stringify({ message: "User is created", user: newUser }),
            { status: 201 }
        );

    } catch (error) {
        console.error("User creation error:", error);
        return new NextResponse("Error in creating user: " + error.message, {
            status: 500,
        });
    }
};