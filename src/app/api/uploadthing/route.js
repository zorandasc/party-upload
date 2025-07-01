import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "@/app/api/uploadthing/core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    errorFormatter: (err) => {
      console.error("UPLOADTHING ERROR:", err);
      return { message: err.message };
    },
  },
});
