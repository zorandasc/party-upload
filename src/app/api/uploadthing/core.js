import { createUploadthing } from "uploadthing/next";
import { z } from "zod";
import clientPromise from "@/lib/mongodb";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  multipleImageUploader: f({ image: { maxFileSize: "10MB", maxFileCount: 4 } })
    .input(
      z.object({
        userName: z
          .string()
          .min(2, { message: "Name must be at least 2 characters long." }) // Minimum 2 characters
          .max(20, { message: "Name cannot exceed 50 characters." })
          .optional(),
      })
    )
    // This code runs on your server before upload
    .middleware(async (ctx) => {
      //console.log("INSIDE MIDDLEWARE, ctx", ctx);
      const { /*req,*/ files, input } = ctx;

      const userName = input.userName || "Gost";

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      //JA DODADO PRVI PRAMAETAR JE METADADA, DRUGI SU FILES KOJI IDU NA uploadthing.com
      return { userId: userName };
    })
    // This code RUNS ON YOUR SERVER after upload
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const client = await clientPromise;
        const db = client.db("party");

        const imageDoc = {
          url: file.ufsUrl,
          name: file.name,
          type: file.type,
          size: file.size,
          key: file.key,
          userId: metadata.userId,
          uploadedAt: new Date(),
          public: false,
        };
        await db.collection("images").insertOne(imageDoc);
        //console.log("✅ Image metadata saved to DB:", imageDoc);
      } catch (err) {
        console.error("❌ Failed to save image metadata:", err);
      }
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {};
    }),
};

export default ourFileRouter;
