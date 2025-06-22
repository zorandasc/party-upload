import { NextResponse } from "next/server";

const UPLOADTHING_API_KEY = process.env.UPLOADTHING_API_KEY;

//GET ALL IMAGES FROM UPLOADTHING
// This API route fetches all images from UploadThing and returns them as a JSON response.
//LIMIT: 100 images per request
export async function GET() {
  try {
    const res = await fetch("https://api.uploadthing.com/v6/listFiles", {
      method: "POST",
      headers: {
        "X-Uploadthing-Api-Key": `${UPLOADTHING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: 100 }),
    });

    if (!res.ok)
      return NextResponse.json(
        { error: "Failed to fetch files" },
        { status: 500 }
      );

    const data = await res.json();
    return NextResponse.json(data.files, { status: 200 });
  } catch (error) {
    console.error("UploadThing fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
