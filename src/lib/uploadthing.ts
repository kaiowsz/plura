import { generateComponents, generateUploadButton, generateUploadDropzone, generateUploader } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

// export const { UploadButton, UploadDropzone, Uploader } =
//   generateComponents<OurFileRouter>();

// export const { useUploadThing, uploadFiles } =
//   generateReactHelpers<OurFileRouter>();

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const Uploader = generateUploader<OurFileRouter>();

export const { uploadFiles, useUploadThing } = generateReactHelpers<OurFileRouter>();