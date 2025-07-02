import { NextResponse } from "next/server";
import JSZip from "jszip";
import clientPromise from "@/lib/mongodb";
import { splitIntoChunks } from "@/lib/chunks";

//RUTA ZA DOWNLOAD ZIPOVANIH FAJLOVA
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("party");

    //SVAKI ZIP FILE IMA SVOJ DOWNLOAD PAGE
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);

    //THIS DOVWNLOADS ARRAYS OF OBJCTS, WHER EACH OBJECTS CONTAINS IMAGE URL
    const files = await db.collection("images").find({}).toArray();

    const chunks = splitIntoChunks(files);
    //IZABERI KOJI CHUNK USER HOCE DA DOWNLOADUJE
    const selectedChunk = chunks[page - 1];

    if (!selectedChunk) {
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      );
    }

    const zip = new JSZip();

    // 2. Download each image and add to zip
    for (const file of selectedChunk) {
      try {
        const fileRes = await fetch(file.url);
        if (!fileRes.ok) throw new Error("Image fetch failed");
        const blob = await fileRes.arrayBuffer();
        // Default to jpg if no extension
        const extension = file.name?.split(".").pop() || "jpg";

        zip.file(`${file.name || file.key}.${extension}`, blob);
      } catch (e) {
        console.warn(`Skipping file: ${file.name} — ${e.message}`);
      }
    }
    // 3. Generate zip buffer
    const zipBlob = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="images-part-${page}.zip"`,
      },
    });
  } catch (error) {
    console.error("Download ZIP error:", error);
    return new NextResponse("Failed to generate ZIP", { status: 500 });
  }
}
