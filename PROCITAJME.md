# DA BI APLIKACIJA RADILA MORA POSTOJATI TOKEN U .env

UPLOADTHING_TOKEN=

# KOJI SE INACE NIGDJE DIREKNTO NE REFERNCIRA U KODU ALI MORA POSTOJATI

# .env VARIJABLA UPLOADTHING_API_KEY=, SE INACE KORISTI

# U API REQUESTU, NPR. ZA DOBAVLJANJE SLIKA:

# u /lib/images.js:

```javascript
const UPLOADTHING_API_KEY = process.env.UPLOADTHING_API_KEY;

//GET ALL IMAGES FROM UPLOADTHING
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

# 2. UPLOADDROP ZONE KOMPONENTA KONTAKTIRA SERVER ROUTU PREKO ourFileRouter :

# TA SERVER RUTA JE DEFINISANA NA:

# /api/uploadthing/core.ts

```javascript
FileRouter for your app, can contain multiple FileRoutes
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

# 3. NAKON UPLOADA SLIKA NA uploadthing.com, uploadthing.com POZIVA NAS NEXT.JS SERVER

# NA NASEM SERVERU U OKVIRU # /api/uploadthing/core.tsN

# SA FUNKCIJOM:

`.onUploadComplete(async ({ metadata, file }) => {`

# 4. NAKON CEGA SE POZIVA CLIENTSIDE FUNKCIJA `onClientUploadComplete` callback,

# DEFINISANA KAO HANDLER UNUTURA DROPZONE CLIJENT COMPONENTE (UploadDrop.jsx):

`  onClientUploadComplete={handleOnUploadComplete}`

# 5. KOJA PREDSTAVI KORISNIKU UPLODOVANE SLIKE
