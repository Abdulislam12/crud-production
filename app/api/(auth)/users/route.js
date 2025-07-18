import { NextResponse } from "next/server";
import connect from "@/lib/db";
import User from "@/lib/modals/user";
import { Types, ObjectId } from "mongoose";

export const GET = async () => {
  try {
    await connect();
    const users = await User.find();
    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new NextResponse("Error in fetching users" + error.message, {
      status: 500,
    });
  }
};

export const POST = async (request) => {
  try {
    const { email, username, password } = await request.json();

    // Basic validation using `.some()` to check for missing fields
    const fields = [email, username, password];
    const missing = ["email", "username", "password"].some(
      (field, i) => !fields[i]
    );

    if (missing) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await connect();

    // Optional: check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return new NextResponse("Username or Email is already taken", {
        status: 409,
      });
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

export const PATCH = async (request) => {
  try {
    const body = await request.json();
    const { userId, newUsername } = body;

    await connect();

    if (!userId || !newUsername) {
      return new NextResponse(
        JSON.stringify({ message: "ID or new username not found" }),
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid User id" }), {
        status: 400,
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { username: newUsername },
      { new: true }
    );

    if (!updatedUser) {
      return new NextResponse(
        JSON.stringify({ message: "User not found in the database" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "User is updated", user: updatedUser }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse("Error in updating user: " + error.message, {
      status: 500,
    });
  }
};

export const DELETE = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse(JSON.stringify({ message: "ID not found" }), {
        status: 400,
      });
    }

    if (!Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid User id" }), {
        status: 400,
      });
    }

    await connect();

    const deletedUser = await User.findByIdAndDelete(
      new Types.ObjectId(userId)
    );

    if (!deletedUser) {
      return new NextResponse(
        JSON.stringify({ message: "User not found in the database" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "User is deleted", user: deletedUser }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse("Error in deleting user: " + error.message, {
      status: 500,
    });
  }
};
