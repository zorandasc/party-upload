"use client";
import { generateUploadDropzone } from "@uploadthing/react";
import styles from "./uploadDrop.module.css";
import toast from "react-hot-toast";

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
      onUploadError={(error) => {
        console.error("Upload failed", error);
        toast.error(error.message);
      }}
    ></UploadDropzone>
  );
};

export default UploadDrop;
