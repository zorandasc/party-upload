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
