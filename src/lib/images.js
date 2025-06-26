
const UPLOADTHING_API_KEY = process.env.UPLOADTHING_API_KEY;

//GET ALL IMAGES FROM UPLOADTHING
export async function getAllImagesFromUploadThing({limit = 10, offset = 0} = { }) {
  try {
    const res = await fetch("https://api.uploadthing.com/v6/listFiles", {
      method: "POST",
      headers: {
        "X-Uploadthing-Api-Key": `${UPLOADTHING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit, offset}),
    });

    if (!res.ok)
      throw new Error("Failed to fetch files from UploadThing");

    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error("UploadThing fetch error:", error);
    return []; // or re-throw
  }
}
