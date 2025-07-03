import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { imageId, public: newPublicValue } = await req.json();

    if (!imageId || typeof newPublicValue !== "boolean") {
      return NextResponse.json(
        { error: "Image ID and valid 'public' boolean are required" },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("party");

    const image = await db
      .collection("images")
      .findOne({ _id: ObjectId.createFromHexString(imageId) });

    if (!image) {
      return NextResponse.json({ error: "Slika ne postoji." }, { status: 404 });
    }

    if (image.public === newPublicValue) {
      return NextResponse.json({
        success: true,
        message: `Image already ${newPublicValue ? "shared" : "private"}`,
      });
    }

    const result = await db
      .collection("images")
      .updateOne({ _id: image._id }, { $set: { public: newPublicValue } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Greska prilikom update:", error);
    return NextResponse.json({ error: "Server greska." }, { status: 500 });
  }
}
