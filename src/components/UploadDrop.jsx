"use client";
import { generateUploadDropzone } from "@uploadthing/react";
import styles from "./UploadDrop.module.css";

const UploadDropzone = generateUploadDropzone();

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

export default UploadDrop;
