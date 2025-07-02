import { NextResponse } from "next/server";
//import { getAllImagesFromUploadThing } from "@/lib/images";
import clientPromise from "@/lib/mongodb";

//ROUTA ZA DOBAVLJANJE  SVIH SLIKA
//ROUTU POZIVA ImageGalery.jsx U HOME page
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    // Extracting the 'page' and 'limit' parameters from the URL
    //second parameter is optional (base of the number),
    const limit = parseInt(searchParams.get("limit") || 20, 10);
    const offset = parseInt(searchParams.get("offset") || 0, 10);

    const client = await clientPromise;
    const db = client.db("party");

    // Query images collection with pagination
    const files = await db
      .collection("images")
      .find({})
      .skip(offset)
      .limit(limit)
      .sort({ uploadedAt: -1 })
      .toArray();

    // Check if more images exist after this page
    const totalCount = await db.collection("images").countDocuments();
    const hasMore = offset + files.length < totalCount;

    return NextResponse.json(
      { files, hasMore, totalCount },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  /*
  const { files, hasMore } = await getAllImagesFromUploadThing({
    limit,
    offset,
  });
*/
  //return NextResponse.json({ files, hasMore });
}
