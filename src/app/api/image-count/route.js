import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

//USED FOR CONTEXT FOR DISPLAY IN NAVBAR
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("party");

    const count = await db.collection("images").countDocuments();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Image count error", error);
    return NextResponse.json(
      { error: "Failed to fetch count" },
      { status: 500 }
    );
  }
}
