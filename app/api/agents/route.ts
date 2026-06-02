import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { hashPassword } from "@/utils/auth";
import { AuthMiddleware } from "@/app/api/middleware/auth";

const postHandler = async (req: NextRequest) => {
  try {
    const { name, email, mobile, password } = await req.json();

    if (!name || !email || !mobile || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const agents = db.collection("agents");

    const existing = await agents.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Agent already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newAgent = {
      name,
      email,
      mobile,
      password: hashedPassword,
      createdAt: new Date(),
    };

    await agents.insertOne(newAgent);

    return NextResponse.json(
      { message: "Agent created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

const getHandler = async (req: NextRequest) => {
  try {
    const db = await connectToDatabase();
    const agents = db.collection("agents");
    const agentsList = await agents.find({}).toArray();

    return NextResponse.json({ agents: agentsList }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = (req: NextRequest) =>
  AuthMiddleware.verifyToken(postHandler)(req);
export const GET = (req: NextRequest) =>
  AuthMiddleware.optionalAuth(getHandler)(req);
