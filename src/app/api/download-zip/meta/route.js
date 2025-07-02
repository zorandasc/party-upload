import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { splitIntoChunks } from "@/lib/chunks";

//OVA API ROUTA VRACA UKUPAN BROJ ZIP FAJLOVA
//U ZAVISNOSTI OD OGRANCIENHA DEFINISANIH SA:
//MAX_FILES_PER_ZIP I MAX_ZIP_SIZE_MB
//OVU RUTU ZOVE DOWNLOAD PAGE USEFFECT
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("party");
    // Query images collection with pagination
    const files = await db.collection("images").find({}).toArray();

    const chunks = splitIntoChunks(files);
    const zipSizes = chunks.map((chunk) => parseFloat(chunk.sizeMB.toFixed(2)));

    return NextResponse.json(
      { zipCount: chunks.length, zipSizes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Meta error:", error);
    return new NextResponse("Failed to calculate zip meta", { status: 500 });
  }
}
