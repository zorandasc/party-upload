npm run dev -- --hostname 0.0.0.0

# PROBLEM ANDROID LOSING REFERENCO OF FILE WITH FILE PICKER

# -------------------------------------------------------------------------------------------

# ERROR:

NotReadableError ON browser-image-compression library

UploadThingError: UPLOAD_FAILED with ERR_UPLOAD_FILE_CHANGED:
The ERR_UPLOAD_FILE_CHANGED error occurs when the browser detects that the file being uploaded (via an HTTP PUT request to UploadThing) has changed since it was selected

Temporary File URIs: On Android, when you select files via the browser's file input (likely used in your UploadDrop component), the file picker often returns a temporary content:// URI rather than a direct file path. This URI may become invalid if the browser or OS revokes access during processing

1 solutuion:

//FIRST MAKY COPY OF ORGINAL TO PREVENT CRASHES ON ANDROID

1st approach (Shallow copy):

```javascript
const fileCopy = new File([file], file.name, { type: file.type });
```

code bellow is It includes aggressive file stabilization by creating a new File object from an ArrayBuffer.

2 solution:Second code (deep copy with metadata), Uses modern file.arrayBuffer() API

```javascript
const arrayBuffer = await file.arrayBuffer();
const stableFile = new File([arrayBuffer], file.name, {
  type: file.type,
  lastModified: file.lastModified,
});
```

try to "lock" the file reference by creating a deep copy of the file earlier in the process.

3.solution: Uses older FileReader API

```javascript
const arrayBuffer = await new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result); //atach handler kada detektuje load, resolve sa rezultatom
  reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`)); //atach handler
  reader.readAsArrayBuffer(file); //citaj file

  const stableFile = new File([arragBuffer], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  });
});
```

Why This Helps:Creating a stable file copy immediately reduces the chance of the file reference becoming invalid during compression.
Using FileReader explicitly may be more reliable than file.arrayBuffer() on some Android browsers.

4. SOLUTION

```javascript
import { useCallback } from "react";
//useCallback prima files vraca stablefiles
const stabilizeFiles = useCallback(
    async (files) => {
      const stableFiles = await Promise.all(
        Array.from(files).map(
          (file) =>
            new Promise((resolve, reject) => {
              console.log(`Stabilizing file: ${file.name}`, {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
              });
              const reader = new FileReader();
              reader.onload = () => {
                const stableFile = new File([reader.result], file.name, {
                  type: file.type,
                  lastModified: file.lastModified,
                });
                resolve(stableFile);
              };
              reader.onerror = () => {
                console.error(`FileReader error for ${file.name}:`, reader.error);
                reject(new Error(`Failed to read file ${file.name}: ${reader.error.message}`));
              };
              reader.readAsArrayBuffer(file);
            })
        )
      );
      return stableFiles;
    },
    []
  );

// Wrap handleBeforeUpload to stabilize files first
const onBeforeUploadBegin = useCallback(
  async (files) => {
    try {
      const stableFiles = await stabilizeFiles(files);
      return await handleBeforeUpload(stableFiles);
    } catch (error) {
      console.error("Error stabilizing files:", error);
      onUploadError(error);
      return [];
    }
  },
  [handleBeforeUpload, stabilizeFiles, onUploadError]
);
```

const reader = new FileReader();
FileReader is a browser API that allows web applications to read the contents of files (or Blob objects) asynchronously. It’s part of the File API

readAsArrayBuffer(file): Reads the file as an ArrayBuffer, useful for binary data or creating new File objects

FileReader uses an event-driven model. You attach handlers to process the results or handle errors:

Since FileReader is event-based, it’s often wrapped in a Promise for modern async/await usage,

# -----------------------------------------------------------------------------------------------------

// COMPRES EACH FILE BEFORE UPLOADING asynhronly

```javascript
const handleBeforeUpload_v1 = async (files) => {
  const compressedFiles = await Promise.all(
    files.map(async (file) => {
      try {
        //FIRST MAKY COPY OF ORGINAL TO PREVENT CRASHES ON ANDROID
        const fileCopy = new File([file], file.name, { type: file.type });

        const sizeInMB = fileCopy.size / 1024 / 1024;

        if (sizeInMB === 0) {
          toast.error("Odabrani fajl je nevažeći ili prazan.");
          console.warn("Skipping empty file:", file.name);
          return null;
        }

        //DONT COMPRESS
        if (sizeInMB < 2) return fileCopy;

        //POKUSAJ KOMPRESIJU KLIJENT SIDE
        const compressedFile = await imageCompression(fileCopy, {
          maxSizeMB: 4, // Aim below 4MB but keep quality decent
          maxWidthOrHeight: 3250, //
          useWebWorker: true, // Improves performance
          initialQuality: 0.9,
        });

        return compressedFile;
      } catch (error) {
        //AKO COMPRESIJA OMANE NISTA NASTAV DA SALJES
        // ORGINALNI FAJL(fileCopy) ALI SAMO AKO JE MANJI OD 10MB
        console.error(`Error compressing file ${fileCopy.name}:`, error);

        if (fileCopy.size > 10 * 1024 * 1024) {
          toast.error(`${fileCopy.name} je prevelik ili pokušajte ponovo.`);
          return null; // Return null to filter this file out
        }

        return fileCopy;
      }
    })
  );
  return compressedFiles.filter(Boolean);
};
```

# DA BI APLIKACIJA RADILA MORA POSTOJATI TOKEN U .env

# UPLOADTHING_TOKEN=

# KOJI SE INACE NIGDJE DIREKNTO NE REFERNCIRA U KODU ALI MORA POSTOJATI

# UPLOADTHING_API_KEY=,

# SE INACE KORISTI U POST API REQUESTU, NPR. ZA DOBAVLJANJE ILI BRISANJE SLIKA:

# UPLOADTHING_APP_ID=

# SE KORISTI KAO DIO URL ZA DOBAVLJANJE SLIKA

# -------------------------------------

# DOBAVLJANE SLIKA

# -------------------------------------

# IZ DOKUMENTACIJE

# https://docs.uploadthing.com/working-with-files#accessing-public-files

# UploadThing serves all files from a CDN at the following URL pattern:

# https://<APP_ID>.ufs.sh/f/<FILE_KEY>

# HOME PAGE page.jsx JE SERVER KOMPONENTA I DOBAVLJA SVE SLIKE SA getAllImagesFromUploadThing() FUKCIJOM

```javascript
const HomePage = async () => {
  const images = await getAllImagesFromUploadThing();
  console.log("Fetched images:", images);
  return <ImagesContainer images={images} />;
};
```

# TA FUNKCIJE JE DEDINISANA U /lib/images.js

```javascript
export async function getAllImagesFromUploadThing() {
  try {
    const res = await fetch("https://api.uploadthing.com/v6/listFiles", {
      method: "POST",
      headers: {
        "X-Uploadthing-Api-Key": `${UPLOADTHING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: 100, offset: 0 }),
    });
```

# OVA FUNKCIJA VRACA ARRAY ELEMENTA U OBLIKU:

```
customId
id
key
name
size
status
uploadedAt

```

# SLIKE SE U HOMNE PAGE PREDSTAVLJAJU SA /components/ImageContainer.jsx KOMPONENTOM

# U ImageContainer.jsx SLIKE SE PREDSTAVLJAJU SA

# src={`https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/${item.key}`}

```javascript

{images?.map((item, i) => (
            <div key={i} className={styles.imageContainer}>
              <Image
                priority
                src={`https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/${item.key}`}
                alt="Image"
                layout="fill"
                className={styles.image}
                sizes="100%"
                blurDataURL={`https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/${item.key}`}
                placeholder="blur"
              />
            </div>

```

# -----------------------------------------

# SLIJED OPERACIJA KOD UPLOADA SLIKA:

# --------------------------------------

# 1. KORISNIK ODE NA UPLOADPAGE I PRAVI INTERAKCIJU SA DROPZONE KOMPONENTOM:

# /uploadpage/page.jsx>

```javascript
<section className={styles.uploadedImagesSmall}>
        {images?.map((item, i) => (
          <div key={i} className={styles.imageContainer}>
            <Image
              priority
              src={item.ufsUrl}
              blurDataURL={item.ufsUrl}
              placeholder="blur"
              alt="image"
              layout="fill"
              sizes="100%"
              className={styles.image}
            ></Image>
          </div>
        ))}
      </section>
      <UploadDrop
        handleBeforeUpload={handleBeforeUpload}
        handleOnUploadComplete={handleOnUploadComplete}
      ></UploadDrop>
    </>
```

# DROP ZONE KOMPONENTA

# /components/UploadDrop.jsx>

```javascript
const UploadDrop = ({ handleOnUploadComplete, handleBeforeUpload }) => {
  return (
    <UploadDropzone
      className={styles.uploadDropZone}
      endpoint="multipleImageUploader"
      onBeforeUploadBegin={handleBeforeUpload}
      onUploadBegin={(name) => console.log("Uploading: ", name)}
      onClientUploadComplete={handleOnUploadComplete}
      onUploadError={(error) => console.error("Upload failed", error)}
    ></UploadDropzone>
  );
};
```

# IZABRANE SLIKE SE PRVO KOMPRESUJU UNUTAR BROWSERA A ONDA:

# 2. UPLOADDROP ZONE KOMPONENTA KONTAKTIRA SERVER ROUTU PREKO endpoint="multipleImageUploader"

# TA SERVER RUTA JE DEFINISANA NA KAO UPLOADTHING ourFileRoute:

# /api/uploadthing/core.ts

```javascript
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  multipleImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4} })
    // Set permissions and file types for this FileRoute
    //THIS CODE RUN ON YOUR SERVER BEFORE UPLOAD
    .middleware(async ({ req }) => {
      const user = await auth(req);
      // If you throw, the user will not be able to upload
      if (!user) {
        throw new UploadThingError("Unauthorized");
      }
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    // THIS CODE RUNS ON YOUR SERVER AFTER UPLOAD
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      // !!! Whatever is returned here is sent to the
      // clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

```

# 3. NAKON UPLOADA SLIKA NA uploadthing.com PREKO ourFileRouter,

# uploadthing.com POZIVA NAS NEXT.JS SERVER, ODNOSNO ourFileRouter FUNKCIJU:

`.onUploadComplete(async ({ metadata, file }) => {`

# 4. NAKON CEGA SE POZIVA CLIENTSIDE FUNKCIJA `onClientUploadComplete` callback,

# DEFINISANA KAO HANDLER UNUTURA DROPZONE CLIJENT COMPONENTE (UploadDrop.jsx):

```javascript
 <UploadDropzone>
      onClientUploadComplete={handleOnUploadComplete}
```

# onClientUploadComplete() DOBIJA ARRAY OBIJEKATA SA SLIJEDECIM PROPERTIJIMA:

```javascript
appUrl
customId
fileHash
key
lastModified
name
serverData
size
type
ufsUrl:"https://4uqx22qha3.ufs.sh/f/1VND70WDq5UAsMgiApNz5fb2yKv817Ehkm0YJ6rnceRFpuiL"
url:"https://utfs.io/f/1VND70WDq5UAsMgiApNz5fb2yKv817Ehkm0YJ6rnceRFpuiL"
```

# 5. KOJA ZATIM MI PREDSTAVI KORISNIKU KAO SLIKE KOJE JE GOST UPLODOVOVAO

# SA:

```javascript
<Image
  priority
  src={item.ufsUrl}
  blurDataURL={item.ufsUrl}
  placeholder="blur"
  alt="image"
  layout="fill"
  sizes="100%"
  className={styles.image}
></Image>
```

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

/\*
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

\*/

/\*
Should you use streaming?
If your zips are under ~100–150 MB, buffering is perfectly fine.

If you're:

Zipping 200+ files,

Or generating large ZIPs (hundreds of MBs or GBs),

Or expecting many users to download ZIPs at the same time,

then yes — streaming is the better long-term approach.

_/
/_
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
\*/
