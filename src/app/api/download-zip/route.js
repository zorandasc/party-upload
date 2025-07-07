import { splitIntoChunks } from "@/lib/chunks";
import clientPromise from "@/lib/mongodb";
import archiver from "archiver";
import { NextResponse } from "next/server";
import { PassThrough } from "stream";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);

  const client = await clientPromise;
  const db = client.db("party");
  const files = await db.collection("images").find({}).toArray();

  const chunks = splitIntoChunks(files);
  const selectedChunk = chunks[page - 1];

  if (!selectedChunk) {
    return new NextResponse("Invalid page", { status: 400 });
  }

  //A PassThrough stream is a type of Transform stream that simply passes
  // the input bytes directly to the output without any modification.

  const passthrough = new PassThrough();
  //creates a temporary, in-memory stream that will act as the output buffer for the generated ZIP data.

  //archiver package for generating archive files (ZIP, TAR, etc.) in a streaming fashion
  //This archive object itself is a readable stream.
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", function (err) {
    console.error("Archiver fatal error:", err);
    // Ensure the passthrough stream is destroyed and error response is sent
    passthrough.destroy(err);
    // No need to throw here as it's an event, but handle it in the response flow
  });

  //The archiver will write its zipped data to passthrough,
  // and then you can read that data from passthrough to send
  // it wherever it needs to go.
  //pipe()  It's designed to connect the output of a readable stream to the input of a writable stream.
  //archive->passthrough
  archive.pipe(passthrough);

  //Data Flow: When the archive instance starts generating the ZIP data (as you append
  // files and eventually call archive.finalize()), this raw ZIP data (in binary form)
  // will be automatically written to the passthrough stream.
  for (const file of selectedChunk.files) {
    try {
      const fileRes = await fetch(file.url);
      if (!fileRes.ok) throw new Error("Image fetch failed");
      /*POSTOJI I OVA MOGUCNOST DA SAMO NASTAVI DALJE
      if (!fileRes.ok) {
        // Log the specific status for debugging
        console.warn(
          `Skipping file ${file.name}: Fetch failed with status ${fileRes.status}`
        );
        continue; // Skip to the next file
      }
      */
      //This method of the Response object asynchronously reads the entire body
      // of the response and returns a Promise that resolves with an ArrayBuffer.
      // An ArrayBuffer is a raw binary data buffer, a low-level representation of the file's bytes.
      const arrayBuffer = await fileRes.arrayBuffer();

      //Buffer.from(): This is a static method from Node.js's built-in Buffer class.
      // It's used to create a new Buffer instance from various sources.
      //in this case, it converts the generic ArrayBuffer (which is a standard JavaScript type
      // available in browsers and Node.js) into a Node.js-specific Buffer object.
      // Buffer objects are optimized for handling binary data in Node.js
      // and are often required by Node.js libraries and APIs.
      const buffer = Buffer.from(arrayBuffer);

      const extension = file.name?.split(".").pop() || "jpg";
      const filename = `${file.name || file.key}.${extension}`;

      archive.append(buffer, { name: filename });
    } catch (error) {
      console.warn(`Skipping file: ${file.name}`);
    }
  }
  archive.finalize();
  return new NextResponse(passthrough, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="images-part-${page}.zip"`,
      "Transfer-Encoding": "chunked", // Optional, but some CDNs require
      "Cache-Control": "no-cache",
    },
  });
}
