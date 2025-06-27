import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getAllImagesFromUploadThing } from "@/lib/images";

const APP_ID = process.env.UPLOADTHING_APP_ID;

const MAX_FILES_PER_ZIP = 10;
const MAX_ZIP_SIZE_MB = 100;

function splitIntoChunks(files) {
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;
  for (const file of files) {
    const fileSizeMB = file.size / (1024 * 1024);
    if (
      currentChunk.length >= MAX_FILES_PER_ZIP ||
      currentSize + fileSizeMB > MAX_ZIP_SIZE_MB
    ) {
      //JEDAN chunk ZAVRSEN, GURNI GA U ARRAY OD CHUNKOVA
      //I KREIRAJ NOVI currentChunk
      chunks.push(currentChunk);
      currentChunk = [];
      currentSize = 0;
    }
    //A AKO NIJE PREDJENA GRANICA NASTAVI DA GURAS U currentChunk
    currentChunk.push(file);
    currentSize += fileSizeMB;
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  return chunks;
}

//RUTA ZA DOWNLOAD ZIPOVANIH FAJLOVA
export async function GET(req) {
  try {
    //SVAKI ZIP FILE IMA SVOJ DOWNLOAD PAGE
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);

    //THIS DOVWNLOADS ARRAYS OF OBJCTS, WHER EACH OBJECTS CONTAINS IMAGE URL
    const { files } = await getAllImagesFromUploadThing({
      limit: 500,
      offset: 0,
    });

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
      const fileRes = await fetch(`https://${APP_ID}.ufs.sh/f/${file.key}`);
      const blob = await fileRes.arrayBuffer();
      // Default to jpg if no extension
      const extension = file.name?.split(".").pop() || "jpg";

      zip.file(`${file.name || file.key}.${extension}`, blob);
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
