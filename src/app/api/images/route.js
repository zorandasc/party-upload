import { NextResponse } from "next/server";
import { getAllImagesFromUploadThing } from "@/lib/images";

const UPLOADTHING_API_KEY = process.env.UPLOADTHING_API_KEY;

//ROUTA ZA DOBAVLJANJE  SVIH SLIKA
//ROUTU POZIVA ImageGalery.jsx U HOME page
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  // Extracting the 'page' and 'limit' parameters from the URL
  //second parameter is optional (base of the number),
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const { files, hasMore } = await getAllImagesFromUploadThing({
    limit,
    offset,
  });

  return NextResponse.json({ files, hasMore });
}

//ROUTA ZA BRISANJE SLIKA
export async function POST(key) {
  try {
    const response = await fetch("https://uploadthing.com/api/deleteFile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": `${UPLOADTHING_API_KEY}`,
        "X-Uploadthing-Version": "6.4.0",
      },
      body: JSON.stringify({
        fileKeys: [`${key}`],
      }),
    });
    if (response?.status != 200) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
