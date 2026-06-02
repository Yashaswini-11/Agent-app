import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { hashPassword, verifyPassword, generateToken } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const { email, password, action = "login" } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Find existing user
    const existingUser = await usersCollection.findOne({ email });

    if (action === "register") {
      // Registration logic
      if (existingUser) {
        return NextResponse.json(
          { message: "User already exists" },
          { status: 409 }
        );
      }

      const hashedPassword = await hashPassword(password);
      const newUser = {
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);

      const token = generateToken({
        userId: result.insertedId,
        email: email,
      });

      return NextResponse.json(
        { 
          token,
          message: "User created successfully",
          userId: result.insertedId
        },
        { status: 201 }
      );
    } else {
      // Login logic
      if (!existingUser) {
        return NextResponse.json(
          { message: "User not found. Please register first." },
          { status: 404 }
        );
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, existingUser.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Generate token
      const token = generateToken({
        userId: existingUser._id,
        email: existingUser.email,
      });

      // Update last login time
      await usersCollection.updateOne(
        { _id: existingUser._id },
        { $set: { updatedAt: new Date() } }
      );

      return NextResponse.json(
        { 
          token,
          message: "Login successful",
          userId: existingUser._id
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}