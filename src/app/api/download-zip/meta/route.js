import { NextResponse } from "next/server";
import { getAllImagesFromUploadThing } from "@/lib/images";

const MAX_FILES_PER_ZIP = 10;
const MAX_ZIP_SIZE_MB = 100;

function chunkFiles(files) {
  let chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const file of files) {
    const fileSizeMB = file.size / (1024 * 1024); // Convert size to MB

    const exceedsSize = currentSize + fileSizeMB > MAX_ZIP_SIZE_MB;
    const exceedsCount = currentChunk.length >= MAX_FILES_PER_ZIP;

    if (exceedsSize || exceedsCount) {
      //ZAVRSI CHANKUVOANJE
      //RESETUJ BROJAC FAJLOVA I SIZE
      chunks.push({ files: currentChunk, sizeMB: currentSize });
      currentChunk = [];
      currentSize = 0;
    }
    //UVECAVAJ BROJ FAILOVA U TRENUTNOM CHANKU
    currentChunk.push(file);
    //UVECAVAJ SIZE TRENUTNOG CHANKA
    currentSize += fileSizeMB;
  }
  //AKO POSLEDNJI CHUNK NIJE PRAZAN, POVECAJ BROJAC CHANKOVA
  if (currentChunk.length > 0) {
    chunks.push({ files: currentChunk, sizeMB: currentSize });
  }

  return chunks;
}

//OVA API ROUTA VRACA UKUPAN BROJ ZIP FAJLOVA
//OVU RUTU ZOVE DOWNLOAD PAGE
export async function GET() {
  try {
    const { files } = await getAllImagesFromUploadThing({
      limit: 500,
      offset: 0,
    });
    const chunks = chunkFiles(files);
    const zipSizes = chunks.map((chunk) => parseFloat(chunk.sizeMB.toFixed(2)));
    console.log("zipsizes", zipSizes)

    return NextResponse.json(
      { zipCount: chunks.length, zipSizes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Meta error:", error);
    return new NextResponse("Failed to calculate zip meta", { status: 500 });
  }
}
