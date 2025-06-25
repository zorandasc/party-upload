import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Simulating an authenticated user
const auth = (req: Request) => {
  return { id: "fakeId", name: "fakeName" };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  multipleImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4} })
    // Set permissions and file types for this FileRoute
    //THIS CODE RUN ON YOUR SERVER BEFORE UPLOAD
    .middleware(async ({ req }) => {
      console.log("Middleware running for request:", req);
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
      console.log("file", file);
      // !!! Whatever is returned here is sent to the
      // clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
