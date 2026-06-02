import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import * as Papa from "papaparse";
import * as XLSX from "xlsx";
import { AuthMiddleware } from "../middleware/auth";

interface Item {
  FirstName: string;
  Phone: string;
  Notes: string;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
  mobile: string;
}

const distributeItems = (items: Item[], agents: Agent[]) => {
  const result: Record<string, Item[]> = {};
  const totalAgents = agents.length;
  const totalItems = items.length;

  const baseCount = Math.floor(totalItems / totalAgents);
  let remainder = totalItems % totalAgents;

  let currentIndex = 0;

  agents.forEach((agent) => {
    const count = baseCount + (remainder > 0 ? 1 : 0);
    remainder = remainder > 0 ? remainder - 1 : remainder;

    result[agent._id] = items.slice(currentIndex, currentIndex + count);
    currentIndex += count;
  });

  return result;
};

const postHandler = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const buffer = await file.arrayBuffer();
    let items: Item[] = [];

    if (fileExt === "csv") {
      const text = new TextDecoder().decode(buffer);
      const result = Papa.parse<Item>(text, {
        header: true,
        skipEmptyLines: true,
      });
      items = result.data;
    } else if (["xls", "xlsx"].includes(fileExt || "")) {
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      items = XLSX.utils.sheet_to_json<Item>(worksheet, { defval: "" });
    } else {
      return NextResponse.json(
        { message: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (!items.length) {
      return NextResponse.json({ message: "File is empty" }, { status: 400 });
    }

    // Validate required fields
    const requiredFields = ["FirstName", "Phone", "Notes"];
    const missing = requiredFields.filter(
      (f) => !Object.keys(items[0]).includes(f)
    );
    if (missing.length) {
      return NextResponse.json(
        { message: `Missing required columns: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const agentsCollection = db.collection("agents");
    const distributedCollection = db.collection("distributed_items");

    const agentDocs = await agentsCollection.find().toArray();
    const agents: Agent[] = agentDocs.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      mobile: doc.mobile,
    }));

    if (!agents.length) {
      return NextResponse.json(
        { message: "No agents found to assign items" },
        { status: 400 }
      );
    }

    const distributed = distributeItems(items, agents);

    const saveOps = Object.entries(distributed).map(([agentId, agentItems]) =>
      distributedCollection.insertOne({
        agentId,
        items: agentItems,
        createdAt: new Date(),
      })
    );
    await Promise.all(saveOps);

    return NextResponse.json({
      message: "Items distributed successfully",
      distributed,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = (req: NextRequest) =>
  AuthMiddleware.verifyToken(postHandler)(req);
