import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const client = await clientPromise;
    const db = client.db("party");

    const query = { public: true };

    const files = await db
      .collection("images")
      .find(query)
      .skip(offset)
      .limit(limit)
      .sort({ uploadedAt: -1 })
      .toArray();

    const totalCount = await db.collection("images").countDocuments(query);

    const hasMore = offset + limit < totalCount;
    return NextResponse.json({ files, totalCount, hasMore });
  } catch (error) {
    console.error("Failed to fetch shared images:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
