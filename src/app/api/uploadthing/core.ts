import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { UTFiles } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  multipleImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
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
      const { req, files, input } = ctx;

      const userName = input.userName || "Anonymous2";

      //DODAJ customId NA SVAKI FILE, KOJI INACE MORA BITI JEDINSTVEN
      const fileOverrides = files.map((file) => {
        return {
          ...file,
          customId: `${userName}-${Date.now()}-${Math.random()}`,
        };
      });

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      //JA DODADO PRVI PRAMAETAR JE METADADA, DRUGI SU FILES KOJI IDU NA uploadthing.com
      return { userId: userName, [UTFiles]: fileOverrides };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      //console.log("metadata", metadata);
      //console.log("file", file);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
