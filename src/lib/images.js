
const UPLOADTHING_API_KEY = process.env.UPLOADTHING_API_KEY;

//GET ALL IMAGES FROM UPLOADTHING
//OVO NIJE API ROUTA VEC HELPERSKA FUNKCIJA KOJU MOOGU DA 
//KORISTE API ROUTE ILI SEVRESKE PAGE STRANICE
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
    return {
      files:data.files || [],
      hasMore: data.hasMore ?? false,
    };
  } catch (error) {
    console.error("UploadThing fetch error:", error);
    return { files: [], hasMore: false };; // or re-throw
  }
}
