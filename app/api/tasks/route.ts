import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { AuthMiddleware } from "../middleware/auth";

const getHandler = async (req: NextRequest) => {
  try {
    const db = await connectToDatabase();
    const tasksCollection = db.collection("distributed_items"); 
    
    // Get agentId from query parameters
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("id");
    
    console.log("Agent ID from query params:", agentId);

    if (!agentId) {
      return NextResponse.json({ message: "Agent ID is required" }, { status: 400 });
    }

    const tasksList = await tasksCollection
      .find({ agentId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ tasks: tasksList }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

export const GET = AuthMiddleware.optionalAuth(getHandler);