// WITH import JSZip from "jszip";

//That means:

//All images are fetched,

//A complete ZIP archive is built in memory (RAM),

//Only after all is done, the ZIP is sent to the user.

//✅ Pros:

//Easy to implement.

//Works fine for small or medium-sized ZIPs (under 100MB, or maybe 200MB).

// Cons:

//Memory-intensive: ZIP is built fully in RAM.

//Can crash your server if too many users request large zips at the same time.

//The user waits until everything is ready — there's no download progress until it’s fully built.

/*
Streaming the ZIP (better for large files):
With streaming, you:

Start sending ZIP content to the user as it's being built.

Don’t wait for all files to be added.

Avoid keeping the full ZIP in RAM.

✅ Pros:

Lower memory usage.

Faster perceived performance: download begins immediately.

Scales better.

❌ Cons:

Requires a different ZIP library like archiver (JSZip doesn’t support streaming).

Slightly more complex code.



*/

/*
Should you use streaming?
If your zips are under ~100–150 MB, buffering is perfectly fine.

If you're:

Zipping 200+ files,

Or generating large ZIPs (hundreds of MBs or GBs),

Or expecting many users to download ZIPs at the same time,

then yes — streaming is the better long-term approach.

*/
/*
import archiver from "archiver";
import { NextResponse } from "next/server";

export async function GET(req) {
  const archive = archiver("zip", { zlib: { level: 9 } });

  const stream = new ReadableStream({
    start(controller) {
      archive.on("data", (chunk) => controller.enqueue(chunk));
      archive.on("end", () => controller.close());
      archive.on("error", (err) => controller.error(err));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=streamed.zip",
    },
  });
}
*/
