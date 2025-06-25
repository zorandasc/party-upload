"use client";
import { generateUploadDropzone } from "@uploadthing/react";
import styles from "./UploadDrop.module.css";

const UploadDropzone = generateUploadDropzone();

const UploadDrop = ({
  handleOnUploadComplete,
  handleBeforeUpload,
  inputData,
}) => {
  return (
    <UploadDropzone
      className={styles.uploadDropZone}
      endpoint="multipleImageUploader"
      onBeforeUploadBegin={handleBeforeUpload}
      onClientUploadComplete={handleOnUploadComplete}
      input={inputData}
      onUploadError={(error) => console.error("Upload failed", error)}
    ></UploadDropzone>
  );
};

export default UploadDrop;
