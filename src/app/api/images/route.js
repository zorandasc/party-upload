import { NextResponse } from "next/server";
import { getAllImagesFromUploadThing } from "@/lib/images";

//ROUTA ZA DOBAVLJANJE  SVIH SLIKA
//ROUTU POZIVA ImageGalery.jsx U HOME page
// Extracting the 'page' and 'limit' parameters from the URL
//second parameter is optional (base of the number),
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const { files, hasMore } = await getAllImagesFromUploadThing({
    limit,
    offset,
  });

  return NextResponse.json({ files, hasMore });
}
