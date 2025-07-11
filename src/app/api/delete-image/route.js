import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const images = await req.json(); // Expecting: [{ key, id }, ...]

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const fileKeys = images.map((img) => img.key);
    const objectIds = images.map((img) => ObjectId.createFromHexString(img.id));

    // 1. Call UploadThing API to delete the file using its key
    const uploadthingRes = await fetch(
      "https://api.uploadthing.com/v6/deleteFiles",

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-uploadthing-api-key": process.env.UPLOADTHING_API_KEY,
        },
        body: JSON.stringify({ fileKeys }),
      }
    );
    if (!uploadthingRes.ok) {
      console.log("Failed to delete files from UploadThing");
      return NextResponse.json(
        { error: "Greška prilikom brisanja slike iz baze." },
        { status: 500 }
      );
    }

    // 2. If UploadThing deletion succeeds
    // 3. Delete from MongoDB
    const client = await clientPromise;
    const db = client.db("party");

    // DELiTE MUTIPLE IMAGES FROM mongodb
    const result = await db
      .collection("images")
      .deleteMany({ _id: { $in: objectIds } });

    // Check MongoDB delete result first
    //MOGUCE DA MONGO BRISANJE PUKNE OVDIJE, ALI NIJE STRASNO IMACEMO
    //MONGO OBIJEKAT SA SLOMLJENIM URL
    if (result.deletedCount !== objectIds.length) {
      console.log("Failed to delete some images from MongoDB");
      return NextResponse.json(
        { error: "Greška prilikom brisanja slike iz baze." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting images:", error);
    return NextResponse.json({ error: "Server greska." }, { status: 500 });
  }
}
